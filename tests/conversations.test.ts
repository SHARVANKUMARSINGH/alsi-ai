import { describe, expect, it } from "vitest";

import { appendMessageToConversation, createConversation, getConversationPreview, getConversationTitle, sortConversations } from "../lib/conversations";

const settings = { mode: "normal" as const, aggression: 0 as const };

describe("conversation helpers", () => {
  it("uses the first real user request for the conversation title", () => {
    const conversation = createConversation(settings);
    const updated = appendMessageToConversation(conversation, {
      id: "one",
      role: "user",
      content: "  Outline   a realistic product launch plan for a small team.  ",
      createdAt: 100,
    });

    expect(updated.title).toBe("Outline a realistic product launch pl…");
    expect(getConversationPreview(updated.messages)).toBe("Outline a realistic product launch plan for a small t…");
  });

  it("sorts saved chats by their last update", () => {
    const older = { ...createConversation(settings), id: "older", updatedAt: 10 };
    const newer = { ...createConversation(settings), id: "newer", updatedAt: 20 };

    expect(sortConversations([older, newer]).map((conversation) => conversation.id)).toEqual(["newer", "older"]);
    expect(getConversationTitle([])).toBe("New conversation");
  });
});
