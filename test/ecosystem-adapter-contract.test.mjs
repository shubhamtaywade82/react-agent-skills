import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
const root=new URL("..",import.meta.url);
const skills=["apollo","urql","swr","rtk-query","trpc","graphql-codegen","openapi-tooling","jotai","mobx","xstate","react-hook-form","tanstack-form","zod","valibot","arktype","yup","vitest-browser"];
test("ecosystem adapter skills are registered",async()=>{const m=await readFile(new URL("skill-manifest.yml",root),"utf8");for(const s of skills)assert.match(m,new RegExp("  - name: "+s));});
test("ecosystem adapter skills are operational",async()=>{for(const s of skills){const c=await readFile(new URL("skills/"+s+"/SKILL.md",root),"utf8");for(const h of ["## Activate when","## Repository inspection","## Decision rules","## Implementation contract","## Failure handling","## Review","## Verification"])assert.ok(c.includes(h),s+" missing "+h);}});
