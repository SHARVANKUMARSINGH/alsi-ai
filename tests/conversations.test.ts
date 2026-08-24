import { describe, expect, it } from "vitest";

import { appendMessageToConversation, createConversation, generateConversationTitle, getConversationPreview, getConversationTitle, searchConversations, sortConversations } from "../lib/conversations";

const settings = { mode: "normal" as const, aggression: 0 as const };

describe("conversation helpers", () => {
  it("generates a compact topic title from the opening user request", () => {
    const conversation = createConversation(settings);
    const updated = appendMessageToConversation(conversation, {
      id: "one",
      role: "user",
      content: "  Outline   a realistic product launch plan for a small team.  ",
      createdAt: 100,
    });

    expect(updated.title).toBe("Realistic Product Launch Plan Small");
    expect(getConversationPreview(updated.messages)).toBe("Outline a realistic product launch plan for a small t…");
  });

  it("removes common request wording instead of copying the first prompt verbatim", () => {
    expect(generateConversationTitle("Explain how to build a Python JSON parser.")).toBe("Build Python JSON Parser");
  });

  it("gives image-only chats a useful name instead of exposing the internal attachment placeholder", () => {
    const conversation = appendMessageToConversation(createConversation(settings), {
      id: "image-only",
      role: "user",
      content: "Image attachment",
      createdAt: 50,
    });

    expect(conversation.title).toBe("Image analysis");
    expect(getConversationPreview(conversation.messages)).toBe("Image attached");
  });

  it("sorts saved chats by their last update", () => {
    const older = { ...createConversation(settings), id: "older", updatedAt: 10 };
    const newer = { ...createConversation(settings), id: "newer", updatedAt: 20 };

    expect(sortConversations([older, newer]).map((conversation) => conversation.id)).toEqual(["newer", "older"]);
    expect(getConversationTitle([])).toBe("New conversation");
  });

  it("finds an archive item from its title, preview, or earlier message text", () => {
    const roadmap = appendMessageToConversation({ ...createConversation(settings), id: "roadmap" }, {
      id: "roadmap-message",
      role: "user",
      content: "Create a quarterly product roadmap for the mobile team.",
      createdAt: 20,
    });
    const recipe = appendMessageToConversation({ ...createConversation(settings), id: "recipe" }, {
      id: "recipe-message",
      role: "user",
      content: "Draft a pasta recipe with tomato and basil.",
      createdAt: 10,
    });

    expect(searchConversations([roadmap, recipe], "mobile").map((conversation) => conversation.id)).toEqual(["roadmap"]);
    expect(searchConversations([roadmap, recipe], "basil").map((conversation) => conversation.id)).toEqual(["recipe"]);
    expect(searchConversations([roadmap, recipe], "")).toEqual([roadmap, recipe]);
  });
});
