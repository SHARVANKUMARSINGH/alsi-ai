import { describe, expect, it } from "vitest";

import { alsiModels, getAlsiModel } from "../lib/models";

describe("ALSI model tiers", () => {
  it("defines the requested display names, OpenRouter models, and token costs", () => {
    expect(alsiModels).toEqual([
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
    ]);
  });

  it("resolves a selected tier by identifier", () => {
    expect(getAlsiModel("standard").tokenCost).toBe(3);
  });
});
