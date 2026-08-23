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
    ]);
  });

  it("resolves a selected tier by identifier", () => {
    expect(getAlsiModel("standard").tokenCost).toBe(3);
    expect(getOpenRouterModel("lite", false)).toBe("openrouter/free");
    expect(getOpenRouterModel("lite", true)).toBe("qwen/qwen-2-vl-72b-instruct:free");
    expect(getOpenRouterModel("standard", true)).toBe("google/gemma-4-31b-it:free");
    expect(getOpenRouterModel("pro", false)).toBe("dots-studio/dots-3-note-preview:free");
    expect(getOpenRouterModel("pro", true)).toBe("openrouter/free");
  });
});
