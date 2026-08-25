import "./load-env.js";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import {
  OPENROUTER_CHAT_ENDPOINT,
  buildAttachmentAwareMessages,
  buildOpenRouterPayload,
  getEmptyCompletionRetryCount,
  parseOpenRouterCompletion,
  shouldUseFreeVisionFallback,
} from "../server/openrouter";
import type { CompletionModelId } from "../lib/models";

type RouteCase = {
  id: string;
  modelId: CompletionModelId;
  usesVision: boolean;
};

const apiKey = process.env.OPENROUTER_API_KEY;
if (!apiKey) throw new Error("OpenRouter is not configured for live route checks.");

const routes: RouteCase[] = [
  { id: "lite-text", modelId: "lite", usesVision: false },
  { id: "standard-text", modelId: "standard", usesVision: false },
  { id: "pro-text", modelId: "pro", usesVision: false },
  { id: "lite-vision", modelId: "lite", usesVision: true },
  { id: "standard-vision", modelId: "standard", usesVision: true },
  { id: "pro-vision", modelId: "pro", usesVision: true },
  { id: "app-builder", modelId: "app-builder", usesVision: false },
];

// A local bundled image verifies the production-sized data-URI path without external image storage.
const imageFixture = readFileSync(resolve(process.cwd(), "assets/images/icon.png")).toString("base64");

async function requestCompletion(payload: ReturnType<typeof buildOpenRouterPayload>) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 75_000);

  try {
    return await fetch(OPENROUTER_CHAT_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "X-Title": "ALSI Ai controlled route check",
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}

async function main() {
  const results = [];

  for (const route of routes) {
    const prompt = route.usesVision
      ? "Confirm that an image attachment was received. Reply only with VISION_OK."
      : route.modelId === "app-builder"
        ? "Reply only with APP_BUILDER_OK."
        : "Reply only with TEXT_OK.";
    const messages = buildAttachmentAwareMessages(
      [{ role: "user", content: prompt }],
      route.usesVision ? imageFixture : undefined,
      "image/png",
    );
    const settings = { modelId: route.modelId, mode: "normal" as const, aggression: 0 as const };
    const primaryPayload = {
      ...buildOpenRouterPayload(messages, settings),
      max_tokens: route.modelId === "app-builder" || route.usesVision ? 1600 : 80,
    };
    const configuredModel = primaryPayload.model;

    try {
      let response = await requestCompletion(primaryPayload);
      const initialStatus = response.status;
      let usedFallback = false;

      if (shouldUseFreeVisionFallback(route.modelId, route.usesVision, response.status)) {
        await response.text();
        usedFallback = true;
        response = await requestCompletion({ ...primaryPayload, model: "openrouter/free" });
      }

      let body = await response.text();
      let content = response.ok ? parseOpenRouterCompletion(body) : null;
      const requestedModel = usedFallback ? "openrouter/free" : configuredModel;
      let retryCount = 0;
      const maximumRetries = getEmptyCompletionRetryCount(requestedModel);
      while (!content && response.ok && retryCount < maximumRetries) {
        retryCount += 1;
        response = await requestCompletion({ ...primaryPayload, model: usedFallback ? "openrouter/free" : configuredModel });
        body = await response.text();
        content = response.ok ? parseOpenRouterCompletion(body) : null;
      }
      results.push({
        id: route.id,
        configuredModel,
        finalModel: usedFallback ? "openrouter/free" : configuredModel,
        initialStatus,
        finalStatus: response.status,
        usedFallback,
        retryCount,
        completionReceived: Boolean(content),
        outcome: response.status === 429 ? "rate_limited" : response.ok && content ? "pass" : "fail",
      });
    } catch (error) {
      results.push({
        id: route.id,
        configuredModel,
        finalModel: configuredModel,
        initialStatus: null,
        finalStatus: null,
        usedFallback: false,
        completionReceived: false,
        outcome: "fail",
        error: error instanceof Error ? error.name : "UnknownError",
      });
    }
  }

  console.log(JSON.stringify(results, null, 2));
}

void main();
