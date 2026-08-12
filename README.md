<p align="center">
  <img src="banner.png" width="800" alt="Awesome Agent Plugins" />
</p>

<p align="center">
  <a href="https://awesome.re"><img src="https://awesome.re/badge.svg" alt="Awesome" /></a>
  <img src="https://img.shields.io/badge/plugins-17-blueviolet" alt="Plugin count" />
  <img src="https://img.shields.io/github/last-commit/ZeroPointRepo/awesome-agent-plugins" alt="Last commit" />
  <img src="https://img.shields.io/badge/spec-v1.0.0%20(Working%20Draft)-informational" alt="Spec version" />
  <img src="https://img.shields.io/badge/license-CC%20BY%204.0-lightgrey" alt="License" />
</p>

<p align="center">
  <b>A curated, verified directory for <a href="https://agentplugins.codes/">Agent Plugins</a></b> — the open,
  vendor-neutral standard (published 2026-08-06 by Amazon, Anysphere/Cursor, GitHub, Microsoft, OpenAI and Vercel,
  with Google as a core maintainer) that bundles <b>Agent Skills + MCP servers</b> into one portable,
  drop-in folder. Every entry below is checked against a live <code>plugin.json</code> — no link dumps, no dead repos.
</p>

---

## Contents

- [What is an Agent Plugin?](#what-is-an-agent-plugin)
- [Quickstart: build your first plugin in 5 minutes](#quickstart-build-your-first-plugin-in-5-minutes)
- [Client support matrix](#client-support-matrix)
- [⭐ Plugin of the Week](#-plugin-of-the-week)
- [The catalog](#the-catalog)
- [Skills & MCP servers ready to be packaged](#skills--mcp-servers-ready-to-be-packaged)
- [Tools](#tools)
- [Spec & resources](#spec--resources)
- [🛡️ Security notice](#️-security-notice)
- [🤝 Contributing](#-contributing)

---

## What is an Agent Plugin?

An **Agent Plugin** is a directory with a `plugin.json` manifest at its root. It's the packaging format the
Agent Plugins Working Group (Amazon, Cursor, GitHub, Microsoft, OpenAI, Vercel) published on 2026-08-06 to give
**Agent Skills** and **MCP server configs** one portable, install-once shape that every compliant client can
read — instead of writing a separate integration for each client.

```
plugin-name/
├── plugin.json               # REQUIRED — $schema + name. Optional: version, description,
│                              # license, keywords[], author, homepage, repository, extensions
├── skills/
│   └── <skill-name>/
│       ├── SKILL.md           # one skill per immediate child dir — NOT searched recursively
│       ├── scripts/
│       └── references/
├── mcp.json                   # OPTIONAL — mcpServers{}: stdio | streamable-http | sse
└── com.vendor.client/         # OPTIONAL — namespaced client-specific extensions
```

Minimal valid `plugin.json`:

```json
{
  "$schema": "https://agent-plugins.org/schemas/1.0.0/plugin.schema.json",
  "name": "my-first-plugin"
}
```

**What the spec deliberately does *not* cover** — and this is the part worth being precise about, because it's
what most secondary write-ups blur: Agent Plugins is a **packaging format only**. It defines the manifest, the
fixed component locations, and two runtime variables (`${PLUGIN_ROOT}`, the package root; `${PLUGIN_DATA}`, a
persistent writable directory) that clients expand in `args`, `env` values and `cwd` — never in `command`, URLs,
or header keys. It has **no opinion on distribution, marketplaces, permissions, or how a client installs a
plugin** — each client (VS Code, Cursor, ChatGPT/Codex, GitHub Copilot, Kiro, and Google's tooling as core
maintainer) owns that layer itself. It also enforces real security boundaries: every path a plugin ships must
resolve inside the plugin root (symlink escapes are rejected), `command` in `mcp.json` is a single executable
token that is never shell-interpolated, and there's no portable field for embedding credentials.

## Quickstart: build your first plugin in 5 minutes

```bash
mkdir -p hello-plugin/skills/say-hello
cd hello-plugin

cat > plugin.json <<'EOF'
{
  "$schema": "https://agent-plugins.org/schemas/1.0.0/plugin.schema.json",
  "name": "hello-plugin",
  "version": "0.1.0",
  "description": "A minimal Agent Plugin — one skill, no MCP server.",
  "license": "MIT"
}
EOF

cat > skills/say-hello/SKILL.md <<'EOF'
---
name: say-hello
description: Greet the user by name and explain what this plugin does.
---

# Say Hello
1. Ask for the user's name if not already known.
2. Reply with a friendly greeting.
3. Mention that this plugin came from a `SKILL.md` file with zero extra config.
EOF

# Validate against the canonical schema before you ship it (see Tools below)
npx -y ajv-cli@5 validate --spec=draft2020 \
  -s https://agent-plugins.org/schemas/1.0.0/plugin.schema.json \
  -d plugin.json
```

Point a compliant client at the `hello-plugin/` folder (in VS Code: **Chat: Install Plugin From Source**) and
you have a working plugin — no `mcp.json` required, since it's optional. Add one when you actually need an MCP
server; see [`upstash/context7`](#the-catalog) below for a real `mcp.json` in production.

## Client support matrix

Verified against each vendor's own docs/announcement as of 2026-08-12. `✅` confirmed · `❓` not yet confirmed in
public docs — please open a PR with a source if you can confirm it.

| Client | Skills | MCP servers | Client extensions (`com.vendor.*`) | Install path |
|---|---|---|---|---|
| **VS Code** | ✅ | ✅ | ❌ ignored today ([docs](https://code.visualstudio.com/docs/agent-customization/agent-plugins)) | `@agentPlugins` in Extensions view · **Chat: Install Plugin From Source** · auto-appears after install via Copilot CLI. Requires `chat.plugins.enabled`. |
| **GitHub Copilot** (VS Code, CLI, app) | ✅ | ✅ | ❓ | Shared install path with VS Code above; also via Copilot CLI. |
| **Codex / Codex CLI** | ✅ (discovers + reads plugin skills) | ✅ (opt-in MCP 2026-07-28 protocol, paginated discovery) | ❓ | Codex CLI workspace plugin install; marketplace details unconfirmed. |
| **ChatGPT** | ✅ (plugins can bundle skills) | ❓ | ❓ | Install UX not independently confirmed at time of writing — see [Codex Knowledge Base writeup](https://codex.danielvaughan.com/2026/08/08/agent-plugins-1-0-open-standard-codex-cli-portable-skills-mcp-packaging/). |
| **Cursor** | ✅ | ✅ | ❓ | Listed as a launch client by Vercel's announcement; specific install flow not independently confirmed — PRs welcome. |
| **Kiro** | ✅ | ✅ | ❓ | Via "Kiro Powers" installable packages ([AWS Open Source Blog](https://aws.amazon.com/blogs/opensource/aws-supports-agent-plugins-an-open-standard-for-portable-agent-extensions/)). |

Google joined as a **core maintainer** on launch day (not a launch client) and is integrating support starting
with Agents CLI and the Data Agent Kit.

If you run one of the `❓` cells day to day, open a PR — a one-line source link is all we need to flip it to ✅.

## ⭐ Plugin of the Week

**[context7](https://github.com/upstash/context7/tree/master/plugins/agent-plugins/context7)** by
[Upstash](https://github.com/upstash) — pulls version-specific library documentation straight into your
agent's context instead of letting it guess API shapes from stale training data. It ships a real `mcp.json`
(one `streamable-http` server) plus a `skills/` entry, and it's one of the first production plugins verified
against the 1.0.0 schema outside the launch clients' own repos. Install: point your client at the
`plugins/agent-plugins/context7` folder in the repo above.

*Rotates weekly. Nominate an entry by opening an issue with the `pick-of-the-week` label.*

## The catalog

Format: `- [name](repo-url) by [author](author-url) — one-line description. **[tag]**`
Tags: **production** (used in the wild) · **beta** · **experimental** · **reference** (spec/example, not meant to run standalone)

### Official & Reference

- [agent-plugins-spec](https://github.com/agentplugins/agent-plugins-spec) by [Agent Plugins Working Group](https://agentplugins.codes/) — the canonical v1.0.0 spec text, JSON schemas, and governance docs. **[reference]**
- [awesome-copilot](https://github.com/github/awesome-copilot) by [GitHub](https://github.com/github) — GitHub's own collection of 90+ compliant plugins spanning languages, cloud platforms and workflows; the single largest source of real plugins six days after launch. **[production]**

### Dev & Coding

- [csharp-dotnet-development](https://github.com/github/awesome-copilot/tree/main/plugins/csharp-dotnet-development) by [Awesome Copilot Community](https://github.com/github/awesome-copilot) — C#/.NET prompts, instructions and chat modes for testing, docs and best practices. **[production]**
- [daisyui](https://github.com/saadeghi/daisyui) by [saadeghi](https://github.com/saadeghi) — the official daisyUI component-library plugin for building Tailwind CSS interfaces. **[production]**
- [testing-automation](https://github.com/github/awesome-copilot/tree/main/plugins/testing-automation) by [Awesome Copilot Community](https://github.com/github/awesome-copilot) — unit, integration and end-to-end testing plus TDD workflows. **[production]**

### Data & APIs

- [database-data-management](https://github.com/github/awesome-copilot/tree/main/plugins/database-data-management) by [Awesome Copilot Community](https://github.com/github/awesome-copilot) — PostgreSQL/SQL Server administration, optimization and data-management guidance. **[production]**
- [hindsight](https://github.com/vectorize-io/hindsight/tree/main/hindsight-integrations/agent-plugin) by [Vectorize](https://hindsight.vectorize.io) — long-term agent memory (retain/recall/reflect) exposed as portable MCP tools. **[production]**

### Search & Research

- [context7](https://github.com/upstash/context7/tree/master/plugins/agent-plugins/context7) by [Upstash](https://github.com/upstash) — version-specific library documentation pulled straight into LLM context. **[production]**
- [scientific-agent-skills](https://github.com/K-Dense-AI/scientific-agent-skills) by [K-Dense Inc.](https://k-dense.ai) — 158 ready-to-use scientific and research skills across biology, chemistry, medicine and drug discovery. **[production]**

### Browser & Automation

*No plugin has been verified against the 1.0.0 schema in this category yet.* See
[Playwright MCP](#skills--mcp-servers-ready-to-be-packaged) and
[Browserbase](#skills--mcp-servers-ready-to-be-packaged) below for the obvious first candidates — be the one
who ships the `plugin.json`.

### Productivity

- [backlog-swipe-triage](https://github.com/github/awesome-copilot/tree/main/plugins/backlog-swipe-triage) by [James Montemagno](https://github.com/jamesmontemagno) — swipe through backlog issues to assign, defer, close or ignore. **[production]**
- [project-planning](https://github.com/github/awesome-copilot/tree/main/plugins/project-planning) by [Awesome Copilot Community](https://github.com/github/awesome-copilot) — feature breakdown, epic management and implementation planning for dev teams. **[production]**
- [release-notes-showcase](https://github.com/github/awesome-copilot/tree/main/plugins/release-notes-showcase) by [Kayla Cinnamon](https://github.com/cinnamon-msft) — compose launch-ready release notes with contributor callouts. **[production]**
- [where-was-i](https://github.com/github/awesome-copilot/tree/main/plugins/where-was-i) by [Aaron Powell](https://github.com/aaronpowell) — reconstructs your dev context (branch, commits, PR clues) to resume work fast. **[production]**

### DevOps

- [aws-cloud-development](https://github.com/github/awesome-copilot/tree/main/plugins/aws-cloud-development) by [Awesome Copilot Community](https://github.com/github/awesome-copilot) — AWS infrastructure-as-code, serverless, architecture patterns and cost optimization. **[production]**
- [devops-oncall](https://github.com/github/awesome-copilot/tree/main/plugins/devops-oncall) by [Awesome Copilot Community](https://github.com/github/awesome-copilot) — incident triage prompts and a chat mode for DevOps/Azure on-call response. **[production]**

### Content & Media

- [skill-image-gen](https://github.com/github/awesome-copilot/tree/main/plugins/skill-image-gen) by [adamd9](https://github.com/adamd9) — AI image generation (OpenAI gpt-image-2, Google Gemini) from inside your coding workflow, BYO API key. **[production]**

### Security

- [security-best-practices](https://github.com/github/awesome-copilot/tree/main/plugins/security-best-practices) by [Awesome Copilot Community](https://github.com/github/awesome-copilot) — security frameworks, accessibility guidelines, and code-quality best practices. **[production]**

### Finance

*No plugin has been verified against the 1.0.0 schema in this category yet.* Open a PR if you ship one — this
is the fastest empty category to claim.

## Skills & MCP servers ready to be packaged

The Agent Plugins ecosystem is six days old at the time of writing, so most of the world's best Agent Skills
and MCP servers **aren't plugins yet** — they just need a `plugin.json` dropped on top. This section is not
the catalog above: nothing here has shipped a compliant manifest. It's a punch list of high-quality, real,
maintained skills/MCP servers that would make excellent plugins, listed here so day-one readers still get
something useful instead of an empty repo. Once one of these ships a `plugin.json`, it graduates to the
catalog above (via PR — see [Contributing](#-contributing)).

- [ahujasid/blender-mcp](https://github.com/ahujasid/blender-mcp) by [ahujasid](https://github.com/ahujasid) — control Blender 3D from any LLM. **[mcp]**
- [anthropics/skills](https://github.com/anthropics/skills) by [Anthropic](https://github.com/anthropics) — the official reference repo for the Agent Skills format that every plugin's `skills/` folder builds on. **[skills]**
- [browserbase/mcp-server-browserbase](https://github.com/browserbase/mcp-server-browserbase) by [Browserbase](https://github.com/browserbase) — browser automation via Stagehand; the obvious first Browser & Automation plugin. **[mcp]**
- [cloudflare/mcp-server-cloudflare](https://github.com/cloudflare/mcp-server-cloudflare) by [Cloudflare](https://github.com/cloudflare) — manage Cloudflare resources (Workers, KV, R2, DNS) from an agent. **[mcp]**
- [getsentry/sentry-mcp](https://github.com/getsentry/sentry-mcp) by [Sentry](https://github.com/getsentry) — query and triage Sentry issues from an LLM. **[mcp]**
- [grafana/mcp-grafana](https://github.com/grafana/mcp-grafana) by [Grafana Labs](https://github.com/grafana) — query dashboards, alerts and datasources via MCP. **[mcp]**
- [hotel-vacation-rental-mcp](https://github.com/stayingapi/hotel-vacation-rental-mcp) by [StayingAPI](https://stayingapi.com) — hotel and vacation-rental search, availability and cross-OTA price comparison across Airbnb, Booking.com, Vrbo and Google Hotels. **[mcp]**
- [microsoft/playwright-mcp](https://github.com/microsoft/playwright-mcp) by [Microsoft](https://github.com/microsoft) — Playwright-driven browser control MCP server. **[mcp]**
- [modelcontextprotocol/servers](https://github.com/modelcontextprotocol/servers) by [Model Context Protocol](https://github.com/modelcontextprotocol) — the official reference MCP server collection; the other half of most future plugins. **[mcp]**
- [youtube-skills](https://github.com/ZeroPointRepo/youtube-skills) by [TranscriptAPI](https://transcriptapi.com) — YouTube transcript and video-search skills, no Google API key or `yt-dlp` required. **[skills]**
- [zillow-mcp](https://github.com/ZeroPointRepo/zillow-mcp) by [Zillapi](https://zillapi.com) — US residential property data, Zestimates and listing search over MCP. **[mcp]**

## Tools

- [`ajv-cli`](https://github.com/ajv-validator/ajv-cli) against the canonical schemas — the validation one-liner multiple plugin authors in the catalog above ship in their own CI:
  ```bash
  npx -y ajv-cli@5 validate --spec=draft2020 \
    -s https://agent-plugins.org/schemas/1.0.0/plugin.schema.json -d plugin.json
  npx -y ajv-cli@5 validate --spec=draft2020 \
    -s https://agent-plugins.org/schemas/1.0.0/mcp.schema.json -d mcp.json
  ```
- [`eng/create-plugin.mjs`](https://github.com/github/awesome-copilot/blob/main/eng/create-plugin.mjs) by GitHub — the scaffolder GitHub's own contributors use to generate new plugins inside `awesome-copilot`; a good reference for writing your own.

*This section is intentionally short. If you maintain a standalone Agent Plugins validator, linter, or
scaffolder, open a PR — it's an empty niche and first-mover here is real.*

## Spec & resources

- [Agent Plugins — spec site](https://agentplugins.codes/)
- [agentplugins/agent-plugins-spec](https://github.com/agentplugins/agent-plugins-spec) — spec text, schemas, governance
- [Plugin manifest schema](https://agent-plugins.org/schemas/1.0.0/plugin.schema.json) · [MCP config schema](https://agent-plugins.org/schemas/1.0.0/mcp.schema.json)
- [Vercel — Introducing Agent Plugins 1.0.0](https://vercel.com/changelog/introducing-agent-plugins-1-0-0)
- [AWS Open Source Blog — AWS supports Agent Plugins](https://aws.amazon.com/blogs/opensource/aws-supports-agent-plugins-an-open-standard-for-portable-agent-extensions/)
- [VS Code docs — Agent plugins in VS Code](https://code.visualstudio.com/docs/agent-customization/agent-plugins)
- [Agent Plugins 1.0 and the Codex CLI plugin strategy](https://codex.danielvaughan.com/2026/08/08/agent-plugins-1-0-open-standard-codex-cli-portable-skills-mcp-packaging/)

## 🛡️ Security notice

This is a **curated list, not an audit**. Entries here are verified to have a real, schema-valid `plugin.json`
and a resolving repository at the time they were added — that is a packaging check, not a security review. The
spec itself enforces path containment and forbids shell-interpolated commands and embedded credentials, but a
plugin can still request an MCP server that talks to a service you don't trust, or a skill that gives bad
instructions. **Read a plugin before you install it**, the same as you would a package or a browser extension.
Report a plugin that misbehaves via [an issue](../../issues/new/choose) and we'll pull it pending review.

## 🤝 Contributing

PRs are very welcome — see [CONTRIBUTING.md](CONTRIBUTING.md) for the format and the four acceptance rules.
**Disclosure:** the maintainer of this list also builds some of the tools listed in it
([TranscriptAPI](https://transcriptapi.com), [StayingAPI](https://stayingapi.com), [Zillapi](https://zillapi.com)).
Our own entries follow the exact same format and bar as everyone else's, appear at most once per category, and
we never reject a competing entry to protect ours — see the disclosure section of CONTRIBUTING.md for the full
policy.

---

<p align="center">
Maintained by <a href="https://github.com/ZeroPointRepo">ZeroPointRepo</a> · list content licensed
<a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a> · Built with <a href="https://crhq.ai">crhq.ai</a>
</p>
