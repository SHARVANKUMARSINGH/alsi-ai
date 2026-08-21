import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { COOKIE_NAME } from "../shared/const.js";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import {
  OPENROUTER_CHAT_ENDPOINT,
  buildOpenRouterPayload,
  userSafeOpenRouterError,
} from "./openrouter";

const chatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().trim().min(1).max(4000),
});

const chatRequestSchema = z.object({
  messages: z.array(chatMessageSchema).min(1).max(30),
  mode: z.enum(["normal", "thinking"]),
  aggression: z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3)]),
  modelId: z.enum(["lite", "standard", "pro"]),
});

type OpenRouterResponse = {
  choices?: Array<{ message?: { content?: string | null } }>;
};

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
        const response = await fetch(OPENROUTER_CHAT_ENDPOINT, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "X-Title": "ALSI Ai",
          },
          body: JSON.stringify(buildOpenRouterPayload(input.messages, input)),
          signal: controller.signal,
        });

        if (!response.ok) {
          console.error("[ALSI OpenRouter] Completion failed", { status: response.status });
          throw new TRPCError({
            code: response.status === 429 ? "TOO_MANY_REQUESTS" : "INTERNAL_SERVER_ERROR",
            message: userSafeOpenRouterError(response.status),
          });
        }

        const completion = (await response.json()) as OpenRouterResponse;
        const content = completion.choices?.[0]?.message?.content?.trim();
        if (!content) {
          throw new TRPCError({
            code: "BAD_GATEWAY",
            message: "ALSI Ai received an empty response. Please try again.",
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
