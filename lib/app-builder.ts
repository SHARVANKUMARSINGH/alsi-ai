import type { ChatSettings } from "@/lib/chat";
import type { AlsiModelId } from "@/lib/models";

export const APP_BUILDER_TOKEN_COST = 40;
export const APP_BUILDER_ALPHA_LABEL = "ALPHA";

export function canUseAppBuilder(modelId: AlsiModelId, settings: ChatSettings) {
  return modelId === "pro" && settings.mode === "thinking" && settings.aggression === 3;
}

export function getAppBuilderRequirementMessage(modelId: AlsiModelId, settings: ChatSettings) {
  if (modelId !== "pro") return "Select Alsi Pro to unlock App Builder Alpha.";
  if (settings.mode !== "thinking") return "Choose Thinking mode to unlock App Builder Alpha.";
  if (settings.aggression !== 3) return "Set Aggressive Mode to Maximum to unlock App Builder Alpha.";
  return "App Builder Alpha is ready.";
}

export function buildAppBuilderPrompt(appIdea: string) {
  const cleanIdea = appIdea.trim();

  return `You are ALSI Ai App Builder Alpha. Create a clear, practical Expo React Native project blueprint for this idea:

${cleanIdea}

Your output is a guide only. You cannot download Termux, create folders on the user's phone, run device commands, access an Expo account or EAS token, choose an account, start an EAS build, watch a cloud build, browse YouTube, or work in the background. Never claim that any of those actions happened.

Use this exact structure:
1. **App concept** — name, key screens, and a concise feature list.
2. **Project structure** — a small folder tree for an Expo app.
3. **Build steps** — safe copy-paste commands under the heading "Run these yourself in Termux or on a computer". Keep commands standard, explain each one, and do not include credentials or destructive commands.
4. **Starter implementation** — the most important Expo files with focused TypeScript examples.
5. **Optional icon** — explicitly say "Optional: add an app icon" and describe where to place it and how to reference it in app.config.ts.
6. **EAS handoff** — explain that the user must sign in to their own Expo account and use their own EAS credentials or a repository secret. Do not ask them to paste a token into chat, do not select an account, and do not promise an APK.
7. **Manual verification checklist** — include how the user can run the app locally and confirm the build.

Prioritize a compact, runnable Expo project. Mark assumptions clearly and offer no hidden automation.`;
}
