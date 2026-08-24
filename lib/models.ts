export type AlsiModelId = "lite" | "standard" | "pro";
export const APP_BUILDER_MODEL_ID = "app-builder" as const;
export type CompletionModelId = AlsiModelId | typeof APP_BUILDER_MODEL_ID;
export const APP_BUILDER_OPENROUTER_MODEL = "stealth/ox-alpha";

export type AlsiModelRoute = {
  text: string;
  vision: string;
};

export type AlsiModel = {
  id: AlsiModelId;
  label: string;
  description: string;
  openRouterModel: AlsiModelRoute;
  tokenCost: number;
};

export const alsiModels: readonly AlsiModel[] = [
  {
    id: "lite",
    label: "ALSI Lite",
    description: "Fast text and vision help",
    openRouterModel: {
      text: "openrouter/free",
      vision: "qwen/qwen-2-vl-72b-instruct:free",
    },
    tokenCost: 1,
  },
  {
    id: "standard",
    label: "ALSI",
    description: "Balanced text and vision analysis",
    openRouterModel: {
      text: "openrouter/free",
      vision: "google/gemma-4-31b-it:free",
    },
    tokenCost: 3,
  },
  {
    id: "pro",
    label: "Alsi Pro",
    description: "Deep text and vision reasoning",
    openRouterModel: {
      text: "dots-studio/dots-3-note-preview:free",
      vision: "openrouter/free",
    },
    tokenCost: 5,
  },
] as const;

export function getAlsiModel(modelId: AlsiModelId) {
  return alsiModels.find((model) => model.id === modelId) ?? alsiModels[0];
}

export function getOpenRouterModel(modelId: CompletionModelId, usesVision: boolean) {
  if (modelId === APP_BUILDER_MODEL_ID) return APP_BUILDER_OPENROUTER_MODEL;
  const model = getAlsiModel(modelId);
  return model.openRouterModel[usesVision ? "vision" : "text"];
}
