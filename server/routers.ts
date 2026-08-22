import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { COOKIE_NAME } from "../shared/const.js";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import {
  OPENROUTER_CHAT_ENDPOINT,
  OPENROUTER_OVERLOAD_MESSAGE,
  buildAttachmentAwareMessages,
  buildOpenRouterPayload,
  parseOpenRouterCompletion,
  shouldUseFreeVisionFallback,
} from "./openrouter";

const chatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().trim().min(1).max(4000),
});

const imageBase64Schema = z.string().min(4).max(6_000_000);
const imageMediaTypeSchema = z.string().regex(/^image\/[a-z0-9.+-]+$/i).max(100);

const chatRequestSchema = z.object({
  messages: z.array(chatMessageSchema).min(1).max(30),
  mode: z.enum(["normal", "thinking"]),
  aggression: z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3)]),
  modelId: z.enum(["lite", "standard", "pro"]),
  imageBase64: imageBase64Schema.optional(),
  imageMediaType: imageMediaTypeSchema.optional(),
});

export const appRouter = router({
  // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),
  chat: router({
    complete: publicProcedure.input(chatRequestSchema).mutation(async ({ input }) => {
      const apiKey = process.env.OPENROUTER_API_KEY;
      if (!apiKey) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "ALSI Ai is not connected to its AI service yet.",
        });
      }

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 75_000);

      try {
        const requestMessages = buildAttachmentAwareMessages(input.messages, input.imageBase64, input.imageMediaType);
        const primaryPayload = buildOpenRouterPayload(requestMessages, input);
        const requestCompletion = (payload: typeof primaryPayload) =>
          fetch(OPENROUTER_CHAT_ENDPOINT, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "X-Title": "ALSI Ai",
          },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });

        let response = await requestCompletion(primaryPayload);

        if (shouldUseFreeVisionFallback(input.modelId, Boolean(input.imageBase64), response.status)) {
          const primaryErrorBody = await response.text();
          console.warn("[ALSI OpenRouter] Retrying vision request with free router", {
            status: response.status,
            body: primaryErrorBody.slice(0, 500),
          });
          response = await requestCompletion({ ...primaryPayload, model: "openrouter/free" });
        }

        if (!response.ok) {
          const rawErrorBody = await response.text();
          console.error("[ALSI OpenRouter] Completion failed", {
            status: response.status,
            body: rawErrorBody.slice(0, 500),
          });
          throw new TRPCError({
            code: "BAD_GATEWAY",
            message: OPENROUTER_OVERLOAD_MESSAGE,
          });
        }

        const rawCompletionBody = await response.text();
        const content = parseOpenRouterCompletion(rawCompletionBody);
        if (!content) {
          throw new TRPCError({
            code: "BAD_GATEWAY",
            message: OPENROUTER_OVERLOAD_MESSAGE,
          });
        }

        return { content };
      } catch (error) {
        if (error instanceof TRPCError) throw error;

        if (error instanceof Error && error.name === "AbortError") {
          throw new TRPCError({
            code: "TIMEOUT",
            message: "ALSI Ai took too long to respond. Please try again.",
          });
        }

        console.error("[ALSI OpenRouter] Network error", error);
        throw new TRPCError({
          code: "BAD_GATEWAY",
          message: "ALSI Ai could not reach its AI service. Check your connection and try again.",
        });
      } finally {
        clearTimeout(timeout);
      }
    }),
  }),
});

export type AppRouter = typeof appRouter;
