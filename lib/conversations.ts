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

const titleStopWords = new Set([
  "a", "an", "and", "are", "as", "at", "be", "can", "could", "do", "for", "from", "give", "help", "how", "i", "in", "into", "is", "it", "me", "my", "of", "on", "or", "please", "show", "tell", "that", "the", "to", "use", "what", "with", "would", "you", "your",
]);

const titleLeadVerbs = new Set([
  "analyze", "brainstorm", "build", "create", "debug", "describe", "draft", "explain", "fix", "generate", "make", "outline", "plan", "summarize", "translate", "write",
]);

const IMAGE_ATTACHMENT_PLACEHOLDER = "image attachment";

function titleCase(word: string) {
  if (/^[A-Z0-9]{2,}$/.test(word)) return word;
  return `${word.charAt(0).toUpperCase()}${word.slice(1).toLowerCase()}`;
}

export function generateConversationTitle(content: string) {
  const words = content
    .replace(/```[\s\S]*?```/g, "")
    .replace(/[^\p{L}\p{N}#+]+/gu, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  const topicWords = words
    .filter((word, index) => {
      const lowerCaseWord = word.toLowerCase();
      return !titleStopWords.has(lowerCaseWord) && !(index === 0 && titleLeadVerbs.has(lowerCaseWord));
    })
    .slice(0, 5);

  if (topicWords.length === 0) return "New conversation";
  return getTextPreview(topicWords.map(titleCase).join(" "), 42);
}

export function getConversationTitle(messages: ChatMessage[]) {
  const firstUserMessage = messages.find((message) => message.role === "user" && !message.isError);
  if (firstUserMessage?.content.trim().toLowerCase() === IMAGE_ATTACHMENT_PLACEHOLDER) {
    return "Image analysis";
  }
  return firstUserMessage ? generateConversationTitle(firstUserMessage.content) : "New conversation";
}

export function getConversationPreview(messages: ChatMessage[]) {
  const lastMessage = messages.at(-1);
  if (lastMessage?.content.trim().toLowerCase() === IMAGE_ATTACHMENT_PLACEHOLDER) {
    return "Image attached";
  }
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

export function searchConversations(conversations: Conversation[], query: string) {
  const normalizedQuery = query.trim().toLocaleLowerCase();
  if (!normalizedQuery) return conversations;

  return conversations.filter((conversation) => {
    const searchableText = [
      conversation.title,
      getConversationPreview(conversation.messages),
      ...conversation.messages.map((message) => message.content),
    ].join(" ").toLocaleLowerCase();

    return searchableText.includes(normalizedQuery);
  });
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
