import { describe, expect, it } from "vitest";

import { alsiModels, getAlsiModel } from "../lib/models";

describe("ALSI model tiers", () => {
  it("defines the requested display names, OpenRouter models, and token costs", () => {
    expect(alsiModels).toEqual([
      {
        id: "lite",
        label: "Notern Code Mini",
        description: "Fast everyday help",
        openRouterModel: "meta-llama/llama-3-8b-instruct:free",
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
    ]);
  });

  it("resolves a selected tier by identifier", () => {
    expect(getAlsiModel("standard").tokenCost).toBe(3);
  });
});
