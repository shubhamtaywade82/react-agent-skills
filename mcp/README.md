# MCP server definitions

This pack does NOT ship an MCP server yet — that is the point of this
directory: the capability policy a future server must satisfy is defined
here, BEFORE any server code exists to enforce it. The reference
implementation in the pack family is node-agent-skills'
`lib/mcp-server.mjs` (a read-only JSON-RPC 2.0 MCP server exposing skill
routing; pinned in this pack's manifest at v0.11.0). ruby-agent-skills
ships the same policy schema (`mcp/permissions.yml`, schema_version 1) with
a live preflight consumer.

## `permissions.yml`

The capability policy for this pack's future MCP server, following the
cross-pack policy schema (schema_version 1). Rules:

- Tool names are classified explicitly, from a trusted `tools/list`
  response of the server actually being wired up.
- Server-provided descriptions and annotations are never security policy.
- Fail-closed: an unclassified tool is denied; the policy below pre-classifies
  the read-only routing surface this pack intends to expose (mirroring
  node-agent-skills' five read-only tools).
- A write-capable tool (campaign runner, recording writer) must be
  classified here with a write/isolated capability BEFORE the server
  exposes it, and this file must be updated in the same change that adds
  the tool.
