import { describe, expect, it } from "vitest";

import { alsiModels, getAlsiModel, getOpenRouterModel } from "../lib/models";

describe("ALSI model tiers", () => {
  it("defines the requested text and vision OpenRouter routes for every tier", () => {
    expect(alsiModels).toEqual([
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
    ]);
  });

  it("resolves a selected tier by identifier", () => {
    expect(getAlsiModel("standard").tokenCost).toBe(3);
    expect(getOpenRouterModel("lite", false)).toBe("nvidia/llama-nemotron-rerank-vl-1b-v2:free");
    expect(getOpenRouterModel("standard", true)).toBe("google/gemma-4-26b-a4b-it:free");
    expect(getOpenRouterModel("pro", false)).toBe("nvidia/nemotron-3-ultra-550b-a55b:free");
    expect(getOpenRouterModel("pro", true)).toBe("dots-studio/dots3-note-preview:free");
  });
});
