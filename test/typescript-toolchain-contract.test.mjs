import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
const root=new URL("..",import.meta.url);
const skills=["typescript-version-migration","typescript-build-architecture","eslint","typescript-eslint","frontend-formatting"];
test("TypeScript toolchain skills are registered",async()=>{
 const m=await readFile(new URL("skill-manifest.yml",root),"utf8");
 for(const s of skills) assert.match(m,new RegExp("  - name: "+s));
});
test("TypeScript toolchain skills expose operational sections",async()=>{
 for(const s of skills){
  const c=await readFile(new URL("skills/"+s+"/SKILL.md",root),"utf8");
  for(const h of ["## Activate when","## Repository inspection","## Decision rules","## Implementation contract","## Failure handling","## Review","## Verification"]) assert.ok(c.includes(h),s+" missing "+h);
 }
});
