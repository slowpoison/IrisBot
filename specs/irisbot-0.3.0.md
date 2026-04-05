# IrisBot — Technical Specification

**Version:** 0.3.0
**Date:** 2026-04-05
**Base:** 0.2.1

---

## Overview

Version 0.3.0 allows the model string for each provider to be overridden via environment variables. Previously, model strings were hardcoded in `src/lib/ai.ts`. Now each provider reads its model from a dedicated env var with the original hardcoded value as the default.

All handlers, personas, memory, UI, and provider resolution logic are unchanged.

---

## Changes from 0.2.1

| Area | Change |
|------|--------|
| `src/config.ts` | Add `GEMINI_MODEL`, `OPENAI_MODEL`, `NEBIUS_MODEL` optional env vars with defaults |
| `src/lib/ai.ts` | `MODELS` map reads model strings from `config.*_MODEL` instead of literals |
| `.env.example` | Document the new optional model override vars |

---

## New Environment Variables

| Variable | Default | Purpose |
|----------|---------|---------|
| `GEMINI_MODEL` | `gemini-2.5-flash` | Model string passed to the Gemini provider |
| `OPENAI_MODEL` | `gpt-4o` | Model string passed to the OpenAI provider |
| `NEBIUS_MODEL` | `nvidia/nemotron-3-super-120b-a12b` | Model string passed to the Nebius provider |

`OLLAMA_MODEL` already existed in 0.2.0 and is unchanged.

---

## Implementation Details

### `src/config.ts`

Add three new optional fields with defaults:

```ts
GEMINI_MODEL: z.string().default("gemini-2.5-flash"),
OPENAI_MODEL: z.string().default("gpt-4o"),
NEBIUS_MODEL: z.string().default("nvidia/nemotron-3-super-120b-a12b"),
```

### `src/lib/ai.ts`

Replace hardcoded model literals in the `MODELS` map, add a `MODEL_STRINGS` lookup, and extend the startup log line to include the active model:

```ts
const MODEL_STRINGS: Record<ProviderName, string> = {
  gemini: config.GEMINI_MODEL,
  openai: config.OPENAI_MODEL,
  nebius: config.NEBIUS_MODEL,
  ollama: config.OLLAMA_MODEL,
};

console.log(
  `[info] provider: ${activeProvider} (${source === "explicit" ? "DEFAULT_PROVIDER" : "auto-detected"}) model: ${MODEL_STRINGS[activeProvider]}`
);

const MODELS: Record<ProviderName, LanguageModel> = {
  gemini: gemini(config.GEMINI_MODEL),
  openai: openai(config.OPENAI_MODEL),
  nebius: nebius(config.NEBIUS_MODEL),
  ollama: ollamaClient(config.OLLAMA_MODEL),
};
```

Example startup output:

```
[info] provider: gemini (auto-detected) model: gemini-2.5-flash
[info] provider: openai (DEFAULT_PROVIDER) model: gpt-4o-mini
```

---

## Limitations

- **Model string validity** — The env var value is passed directly to the provider SDK. An unrecognised model string surfaces as a runtime error on the first request, not at startup.
