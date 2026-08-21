export type AlsiModelId = "lite" | "standard" | "pro";

export type AlsiModel = {
  id: AlsiModelId;
  label: string;
  description: string;
  openRouterModel: string;
  tokenCost: number;
};

export const alsiModels: readonly AlsiModel[] = [
  {
    id: "lite",
    label: "ALSI Lite",
    description: "Fast everyday help",
    openRouterModel: "liquid/lfm-2.5-2.6b:free",
    tokenCost: 1,
  },
  {
    id: "standard",
    label: "ALSI",
    description: "Balanced capability",
    openRouterModel: "poolside/laguna-s-2.1:free",
    tokenCost: 3,
  },
  {
    id: "pro",
    label: "Alsi Pro",
    description: "Deep reasoning and planning",
    openRouterModel: "nvidia/nemotron-3-ultra-550b-a55b:free",
    tokenCost: 5,
  },
] as const;

export function getAlsiModel(modelId: AlsiModelId) {
  return alsiModels.find((model) => model.id === modelId) ?? alsiModels[0];
}
