import AsyncStorage from "@react-native-async-storage/async-storage";

import type { ChatMessage, ChatSettings } from "@/lib/chat";

const CONVERSATION_STORAGE_KEY = "alsi-ai.conversations.v1";

export type Conversation = {
  id: string;
  title: string;
  messages: ChatMessage[];
  settings: ChatSettings;
  createdAt: number;
  updatedAt: number;
};

function createConversationId() {
  return `chat-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function getTextPreview(content: string, limit: number) {
  const normalized = content.replace(/\s+/g, " ").trim();
  if (normalized.length <= limit) return normalized;
  return `${normalized.slice(0, Math.max(0, limit - 1)).trimEnd()}…`;
}

export function getConversationTitle(messages: ChatMessage[]) {
  const firstUserMessage = messages.find((message) => message.role === "user" && !message.isError);
  return firstUserMessage ? getTextPreview(firstUserMessage.content, 38) : "New conversation";
}

export function getConversationPreview(messages: ChatMessage[]) {
  const lastMessage = messages.at(-1);
  return lastMessage ? getTextPreview(lastMessage.content, 54) : "No messages yet";
}

export function createConversation(settings: ChatSettings): Conversation {
  const now = Date.now();
  return {
    id: createConversationId(),
    title: "New conversation",
    messages: [],
    settings,
    createdAt: now,
    updatedAt: now,
  };
}

export function appendMessageToConversation(conversation: Conversation, message: ChatMessage): Conversation {
  const messages = [...conversation.messages, message];
  return {
    ...conversation,
    messages,
    title: getConversationTitle(messages),
    updatedAt: message.createdAt,
  };
}

export function sortConversations(conversations: Conversation[]) {
  return [...conversations].sort((left, right) => right.updatedAt - left.updatedAt);
}

export function isConversation(value: unknown): value is Conversation {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<Conversation>;
  return (
    typeof candidate.id === "string" &&
    typeof candidate.title === "string" &&
    Array.isArray(candidate.messages) &&
    typeof candidate.createdAt === "number" &&
    typeof candidate.updatedAt === "number" &&
    candidate.settings !== undefined
  );
}

export async function loadConversations(): Promise<Conversation[]> {
  try {
    const raw = await AsyncStorage.getItem(CONVERSATION_STORAGE_KEY);
    if (!raw) return [];

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return sortConversations(parsed.filter(isConversation));
  } catch {
    return [];
  }
}

export async function saveConversations(conversations: Conversation[]) {
  await AsyncStorage.setItem(CONVERSATION_STORAGE_KEY, JSON.stringify(sortConversations(conversations)));
}
