import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { createOllama } from "ai-sdk-ollama";
import type { LanguageModel } from "ai";
import { config, resolveProvider } from "../config";
import type { ProviderName } from "../types";

const { provider: activeProvider, source } = resolveProvider(config);

const MODEL_STRINGS: Record<ProviderName, string> = {
  gemini: config.GEMINI_MODEL,
  openai: config.OPENAI_MODEL,
  nebius: config.NEBIUS_MODEL,
  ollama: config.OLLAMA_MODEL,
};

console.log(
  `[info] provider: ${activeProvider} (${source === "explicit" ? "DEFAULT_PROVIDER" : "auto-detected"}) model: ${MODEL_STRINGS[activeProvider]}`
);

const gemini = createGoogleGenerativeAI({
  apiKey: config.GOOGLE_GENERATIVE_AI_API_KEY ?? "",
});

const openai = createOpenAI({
  apiKey: config.OPENAI_API_KEY ?? "",
});

const nebius = createOpenAICompatible({
  name: "nebius",
  // baseURL: "https://api.studio.nebius.ai/v1/",
  baseURL: "https://api.tokenfactory.us-central1.nebius.com/v1/",
  apiKey: config.NEBIUS_API_KEY ?? "",
});

const ollamaClient = createOllama({ baseURL: config.OLLAMA_BASE_URL });

const MODELS: Record<ProviderName, LanguageModel> = {
  gemini: gemini(config.GEMINI_MODEL),
  openai: openai(config.OPENAI_MODEL),
  nebius: nebius(config.NEBIUS_MODEL),
  ollama: ollamaClient(config.OLLAMA_MODEL),
};

export function getProvider(name: ProviderName = activeProvider): LanguageModel {
  const model = MODELS[name];
  if (!model) throw new Error(`Unknown provider: ${name}`);
  return model;
}
