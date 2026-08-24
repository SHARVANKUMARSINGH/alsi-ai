import { describe, expect, it } from "vitest";

import { APP_BUILDER_TOKEN_COST, buildAppBuilderPrompt, canUseAppBuilder, extractCommandProposals, getAppBuilderRequirementMessage } from "../lib/app-builder";
import { APP_BUILDER_MODEL_ID, APP_BUILDER_OPENROUTER_MODEL, getOpenRouterModel } from "../lib/models";

describe("App Builder Alpha", () => {
  it("requires Alsi Pro, Thinking mode, and maximum Aggressive Mode", () => {
    const maximumThinking = { mode: "thinking" as const, aggression: 3 as const };

    expect(APP_BUILDER_TOKEN_COST).toBe(40);
    expect(canUseAppBuilder("pro", maximumThinking)).toBe(true);
    expect(canUseAppBuilder("standard", maximumThinking)).toBe(false);
    expect(canUseAppBuilder("pro", { mode: "normal", aggression: 3 })).toBe(false);
    expect(canUseAppBuilder("pro", { mode: "thinking", aggression: 2 })).toBe(false);
  });

  it("gives the user a clear explanation of the missing eligibility requirement", () => {
    expect(getAppBuilderRequirementMessage("lite", { mode: "thinking", aggression: 3 })).toContain("Alsi Pro");
    expect(getAppBuilderRequirementMessage("pro", { mode: "normal", aggression: 3 })).toContain("Thinking");
    expect(getAppBuilderRequirementMessage("pro", { mode: "thinking", aggression: 2 })).toContain("Maximum");
  });

  it("requires safe Termux, optional icon, and user-controlled EAS handoff guidance", () => {
    const prompt = buildAppBuilderPrompt("A study planner with offline tasks");

    expect(prompt).toContain("A study planner with offline tasks");
    expect(prompt).toContain("Run these yourself in Termux or on a computer");
    expect(prompt).toContain("Optional: add an app icon");
    expect(prompt).toContain("user must sign in to their own Expo account");
    expect(prompt).toContain("Never claim");
    expect(prompt).toContain("individual review and approval");
  });

  it("routes App Builder through the dedicated Ox Alpha model", () => {
    expect(APP_BUILDER_MODEL_ID).toBe("app-builder");
    expect(APP_BUILDER_OPENROUTER_MODEL).toBe("stealth/ox-alpha");
    expect(getOpenRouterModel(APP_BUILDER_MODEL_ID, false)).toBe("stealth/ox-alpha");
  });

  it("extracts only executable-looking lines from fenced command blocks for user review", () => {
    const commands = extractCommandProposals([
      "## Build steps",
      "```bash",
      "# Install the Expo toolchain",
      "npx create-expo-app my-project",
      "cd my-project",
      "npm run start",
      "```",
      "```typescript",
      "const ignored = true;",
      "```",
    ].join("\n"));

    expect(commands).toEqual(["npx create-expo-app my-project", "cd my-project", "npm run start"]);
  });
});
