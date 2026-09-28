import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
const root=new URL("..",import.meta.url);
const skills=["frontend-monorepo","typescript-package-publishing","frontend-generated-code","frontend-internationalization","frontend-offline-pwa","frontend-realtime","frontend-web-performance","frontend-test-reliability","frontend-visual-testing","frontend-rendering-strategies","frontend-supply-chain","frontend-documentation","frontend-codemod-migration","react-accessibility-widgets","frontend-storage","frontend-messaging","frontend-workers","frontend-networking","browser-authentication","browser-media"];
test("browser and production skills are registered",async()=>{const m=await readFile(new URL("skill-manifest.yml",root),"utf8");for(const s of skills)assert.match(m,new RegExp("  - name: "+s));});
test("browser and production skills expose operational guidance",async()=>{for(const s of skills){const c=await readFile(new URL("skills/"+s+"/SKILL.md",root),"utf8");for(const h of ["## Activate when","## Repository inspection","## Decision rules","## Implementation contract","## Failure handling","## Review","## Verification"])assert.ok(c.includes(h),s+" missing "+h);}});
