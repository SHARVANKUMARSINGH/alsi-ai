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
    description: "Fast vision-enabled help",
    openRouterModel: "meta-llama/llama-3.2-11b-vision-instruct:free",
    tokenCost: 1,
  },
  {
    id: "standard",
    label: "ALSI",
    description: "Balanced vision analysis",
    openRouterModel: "nvidia/nemotron-nano-12b-vl:free",
    tokenCost: 3,
  },
  {
    id: "pro",
    label: "Alsi Pro",
    description: "Smart free-model routing",
    openRouterModel: "openrouter/free",
    tokenCost: 5,
  },
] as const;

export function getAlsiModel(modelId: AlsiModelId) {
  return alsiModels.find((model) => model.id === modelId) ?? alsiModels[0];
}
