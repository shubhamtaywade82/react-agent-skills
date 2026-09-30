import { readFile, readdir } from "node:fs/promises";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("../", import.meta.url));

function parseArgs(argv) {
  const args = { check: false, manifest: join(ROOT, "benchmarks/discovery/manifest.json") };
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === "--check") args.check = true;
    else if (argv[i] === "--manifest") args.manifest = argv[++i];
    else throw new Error("Unknown argument: " + argv[i]);
  }
  return args;
}

function normalize(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function tokens(value) {
  return normalize(value).split(/\s+/).filter((token) => token.length > 2);
}

function parseSkill(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n/);
  if (!match) throw new Error("SKILL.md is missing frontmatter");
  const name = match[1].match(/^name:\s*(.+)$/m)?.[1]?.trim();
  const description = match[1].match(/^description:\s*(.+)$/m)?.[1]?.trim();
  if (!name || !description) throw new Error("SKILL.md is missing name or description");
  return { name, description };
}

async function loadCatalog() {
  const dirs = await readdir(join(ROOT, "skills"), { withFileTypes: true });
  const catalog = [];
  for (const dir of dirs.filter((entry) => entry.isDirectory())) {
    const path = join(ROOT, "skills", dir.name, "SKILL.md");
    const skill = parseSkill(await readFile(path, "utf8"));
    catalog.push({ ...skill, path: relative(ROOT, path) });
  }
  return catalog.sort((a, b) => a.name.localeCompare(b.name));
}

function scoreSkill(skill, queryTokens) {
  const nameTokens = new Set(tokens(skill.name));
  const descriptionTokens = new Set(tokens(skill.description));
  let score = 0;
  for (const token of queryTokens) {
    if (descriptionTokens.has(token)) score += 2;
    else if (nameTokens.has(token)) score += 1;
  }
  const phrase = queryTokens.join(" ");
  const haystack = normalize(skill.name + " " + skill.description);
  if (phrase.length > 8 && haystack.includes(phrase)) score += 3;
  return score;
}

function approximateTokens(value) {
  return Math.ceil(value.trim().split(/\s+/).filter(Boolean).length * 1.3);
}

function evaluate(catalog, cases) {
  return cases.map((entry) => {
    const ranked = catalog
      .map((skill) => ({ skill: skill.name, score: scoreSkill(skill, tokens(entry.query)) }))
      .sort((a, b) => b.score - a.score || a.skill.localeCompare(b.skill));
    const expected = ranked.find((item) => item.skill === entry.expected_skill);
    const rank = expected ? ranked.indexOf(expected) + 1 : null;
    const competitors = (entry.competitors ?? []).map((name) => ({
      skill: name,
      score: ranked.find((item) => item.skill === name)?.score ?? 0
    }));
    const margin = expected
      ? expected.score - Math.max(0, ...competitors.map((item) => item.score))
      : null;
    const pass = Boolean(expected && expected.score >= 2 && margin > 0);
    return { id: entry.id, expected_skill: entry.expected_skill, rank, score: expected?.score ?? 0, margin, competitors, pass, top: ranked.slice(0, 5) };
  });
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const manifest = JSON.parse(await readFile(args.manifest, "utf8"));
  if (manifest.version !== 1 || !Array.isArray(manifest.cases)) throw new Error("Invalid discovery manifest");
  const catalog = await loadCatalog();
  const cases = evaluate(catalog, manifest.cases);
  const descriptionChars = catalog.reduce((sum, skill) => sum + skill.description.length, 0);
  const output = {
    version: 1,
    methodology: "deterministic lexical routing regression over native SKILL.md name/description metadata",
    catalog: {
      skills: catalog.length,
      description_chars: descriptionChars,
      approximate_description_tokens: approximateTokens(catalog.map((skill) => skill.description).join("\n"))
    },
    summary: {
      total: cases.length,
      passed: cases.filter((entry) => entry.pass).length,
      failed: cases.filter((entry) => !entry.pass).length,
      pass_rate: cases.length ? cases.filter((entry) => entry.pass).length / cases.length : 0
    },
    cases
  };
  process.stdout.write(JSON.stringify(output, null, 2) + "\n");
  if (args.check && (output.catalog.skills !== 127 || output.summary.failed > 0)) process.exitCode = 1;
}

await main();
