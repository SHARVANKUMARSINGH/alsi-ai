import AsyncStorage from "@react-native-async-storage/async-storage";

const COMPOSER_DRAFTS_STORAGE_KEY = "alsi-ai.composer-drafts.v1";
const MAX_DRAFT_LENGTH = 4_000;

export type ComposerDrafts = Record<string, string>;

function isComposerDrafts(value: unknown): value is ComposerDrafts {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  return Object.values(value).every((draft) => typeof draft === "string");
}

export async function loadComposerDrafts(): Promise<ComposerDrafts> {
  try {
    const raw = await AsyncStorage.getItem(COMPOSER_DRAFTS_STORAGE_KEY);
    if (!raw) return {};

    const parsed: unknown = JSON.parse(raw);
    if (!isComposerDrafts(parsed)) return {};

    return Object.fromEntries(
      Object.entries(parsed)
        .filter(([key, draft]) => key && draft.trim())
        .map(([key, draft]) => [key, draft.slice(0, MAX_DRAFT_LENGTH)]),
    );
  } catch {
    return {};
  }
}

export async function saveComposerDrafts(drafts: ComposerDrafts) {
  const populatedDrafts = Object.fromEntries(
    Object.entries(drafts)
      .filter(([key, draft]) => key && draft.trim())
      .map(([key, draft]) => [key, draft.slice(0, MAX_DRAFT_LENGTH)]),
  );
  await AsyncStorage.setItem(COMPOSER_DRAFTS_STORAGE_KEY, JSON.stringify(populatedDrafts));
}
