## What kind of change is this?

- [ ] New catalog entry (compliant Agent Plugin)
- [ ] New "ready to be packaged" entry (skill or MCP server, not yet a plugin)
- [ ] Fix a broken/outdated entry
- [ ] Other (README, CONTRIBUTING, infra, etc.)

## Checklist (for new entries)

- [ ] The linked repo/folder resolves and is not archived.
- [ ] `plugin.json` exists at the linked path with `$schema` pointing at a valid
      `https://agent-plugins.org/schemas/<version>/plugin.schema.json` and a valid `name`.
- [ ] I validated it locally (`ajv-cli` against the canonical schema — see README → Tools).
- [ ] It's not already listed anywhere in this README.
- [ ] The entry follows the exact format: `- [name](repo-url) by [author](author-url) — description. **[tag]**`
- [ ] It's placed alphabetically within the correct category.

## Anything else maintainers should know?

<!-- Optional context: why this belongs, who you are relative to the project (if you're the author), etc. -->
