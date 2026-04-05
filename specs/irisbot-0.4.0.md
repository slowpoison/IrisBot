# IrisBot — Technical Specification

**Version:** 0.4.0
**Date:** 2026-04-05
**Base:** 0.3.0

---

## Overview

Version 0.4.0 allows the bot's display name to be configured via an environment variable. Previously, the name "IrisBot" was hardcoded in persona system prompts and any user-facing strings. Now the name is read from `IRISBOT_NAME` (default: `IrisBot`) and injected wherever the bot refers to itself.

All provider, model, memory, UI, and handler logic is unchanged.

---

## Changes from 0.3.0

| Area | Change |
|------|--------|
| `src/config.ts` | Add optional `IRISBOT_NAME` env var (default: `IrisBot`) |
| `src/personas/index.ts` | Replace hardcoded name references with `config.IRISBOT_NAME` |
| `.env.example` | Document the new optional `IRISBOT_NAME` var |

---

## New Environment Variables

| Variable | Default | Purpose |
|----------|---------|---------|
| `IRISBOT_NAME` | `IrisBot` | Display name the bot uses when referring to itself in system prompts and user-facing strings |

---

## Implementation Details

### `src/config.ts`

Add one new optional field with a default:

```ts
IRISBOT_NAME: z.string().default("IrisBot"),
```

### `src/personas/index.ts`

Replace any hardcoded `"IrisBot"` strings with `config.IRISBOT_NAME`. For example, if a system prompt reads:

```ts
`You are IrisBot, a helpful assistant.`
```

it becomes:

```ts
`You are ${config.IRISBOT_NAME}, a helpful assistant.`
```

Apply this substitution to all three persona system prompts and any other user-facing strings that embed the bot's name.

### `src/index.ts` (startup log)

Extend the startup log line to include the configured name:

```ts
console.log(`[info] bot name: ${config.IRISBOT_NAME}`);
```

### `.env.example`

```
# Optional: display name for the bot (default: IrisBot)
# IRISBOT_NAME=IrisBot
```

---

## Limitations

- **No Slack profile sync** — `IRISBOT_NAME` only affects what the bot says about itself in conversation. The Slack app display name (set in the Slack API dashboard) is unchanged.
- **Runtime only** — changing `IRISBOT_NAME` requires a restart; it is read once at startup via the Zod-validated config.
