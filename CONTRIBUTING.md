# Contributing to Awesome Agent Plugins

Thanks for considering a contribution. This list exists to be the accurate reference for a six-day-old spec,
so we're strict about verification but fast about merging — the goal is under 7 days to a first response on
every PR.

## Disclosure

The maintainer of this repository builds and sells developer tools — [TranscriptAPI](https://transcriptapi.com)
(YouTube search & transcripts), [StayingAPI](https://stayingapi.com) (hotel/vacation-rental data), and
[Zillapi](https://zillapi.com) (US property data) — and may list them here when they ship a genuinely working
plugin, skill, or MCP server. When we do:

- Our entries appear **at most once per category**, in the exact same format as every other entry — no bold, no
  emoji, no "featured" styling, placed alphabetically.
- Our entries are held to a **higher** bar than contributed ones: if it doesn't have a working manifest and a
  real README, it doesn't go in.
- We will **never reject or downrank a competing entry** to protect one of ours.
- If you ever think one of our entries doesn't belong, open an issue — we'll take it as seriously as any other
  broken-entry report.

## Adding an entry to the catalog

Open a PR that adds one line, in the right category, alphabetically, in this exact format:

```
- [name](repo-url) by [author](author-url) — one-line description. **[tag]**
```

- `name` — the plugin's `name` field from its `plugin.json`, or a clear human-readable name.
- `repo-url` — link to the plugin's root folder (the folder containing `plugin.json`), not just the repo root,
  if the plugin lives in a subfolder of a monorepo.
- `author` / `author-url` — from `plugin.json`'s `author` field, or the repo owner.
- description — one line, plain, no marketing language. Say what it does, not why it's great.
- `tag` — one of `production` (used in the wild), `beta`, `experimental`, or `reference` (spec text/examples,
  not meant to run standalone).

### Acceptance bar (we merge if all four are true)

1. **The link resolves.** We check this before merging, and again on every weekly link-check run.
2. **There's a real, schema-valid `plugin.json`** at the linked path — `$schema` pointing at
   `https://agent-plugins.org/schemas/1.0.0/plugin.schema.json` (or a later version) and a valid `name`. Run
   it through `ajv-cli` yourself before opening the PR (see the README's Tools section) — PRs that fail
   validation get a friendly bot comment, never an auto-close.
3. **It's not already listed.** Check the category and the "Skills & MCP servers ready to be packaged" section
   first — if it's a skill/MCP server without a `plugin.json` yet, it belongs there instead.
4. **The category is right.** If it spans two, pick the primary use case; maintainers will move it if needed
   rather than bounce the PR.

We reject only for: a dead link, no real substance (a stub repo), pure spam, or an exact duplicate. **We always
reply**, even to a rejection — a closed PR with a kind reason is fine, silence is not.

## Adding a skill or MCP server that isn't a plugin yet

If it's genuinely high-quality but hasn't shipped a `plugin.json`, it belongs in "Skills & MCP servers ready to
be packaged," tagged `**[skills]**` or `**[mcp]**` instead of a maturity tag. Same format, same alphabetical
placement, same bar for "is this real and maintained."

## Reporting a broken entry

Use the "Report broken entry" issue template. Tell us what's broken (dead link, invalid manifest, archived
repo) — we'll fix or pull the entry within a week.

## Style

- One entry per line. No sub-bullets, no nested nesting.
- No affiliate links, no UTM parameters, no tracking redirects.
- Keep descriptions under ~120 characters where you can.
