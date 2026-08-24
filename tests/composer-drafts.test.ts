import { beforeEach, describe, expect, it, vi } from "vitest";

const storage = vi.hoisted(() => new Map<string, string>());

vi.mock("@react-native-async-storage/async-storage", () => ({
  default: {
    getItem: vi.fn(async (key: string) => storage.get(key) ?? null),
    setItem: vi.fn(async (key: string, value: string) => { storage.set(key, value); }),
  },
}));

import { loadComposerDrafts, saveComposerDrafts } from "../lib/composer-drafts";

describe("composer draft persistence", () => {
  beforeEach(() => storage.clear());

  it("keeps only non-empty drafts and restores them by conversation key", async () => {
    await saveComposerDrafts({ "chat-1": "Keep this thought", "chat-2": "   ", new: "Start here" });

    await expect(loadComposerDrafts()).resolves.toEqual({ "chat-1": "Keep this thought", new: "Start here" });
  });

  it("recovers with an empty object when storage contains malformed data", async () => {
    storage.set("alsi-ai.composer-drafts.v1", "not json");

    await expect(loadComposerDrafts()).resolves.toEqual({});
  });
});
