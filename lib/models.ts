export type AlsiModelId = "lite" | "standard" | "pro";

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
      text: "nvidia/llama-nemotron-rerank-vl-1b-v2:free",
      vision: "meta-llama/llama-3.2-11b-vision-instruct:free",
    },
    tokenCost: 1,
  },
  {
    id: "standard",
    label: "ALSI",
    description: "Balanced text and vision analysis",
    openRouterModel: {
      text: "poolside/laguna-s-2.1:free",
      vision: "google/gemma-4-26b-a4b-it:free",
    },
    tokenCost: 3,
  },
  {
    id: "pro",
    label: "Alsi Pro",
    description: "Deep text and vision reasoning",
    openRouterModel: {
      text: "nvidia/nemotron-3-ultra-550b-a55b:free",
      vision: "dots-studio/dots3-note-preview:free",
    },
    tokenCost: 5,
  },
] as const;

export function getAlsiModel(modelId: AlsiModelId) {
  return alsiModels.find((model) => model.id === modelId) ?? alsiModels[0];
}

export function getOpenRouterModel(modelId: AlsiModelId, usesVision: boolean) {
  const model = getAlsiModel(modelId);
  return model.openRouterModel[usesVision ? "vision" : "text"];
}
