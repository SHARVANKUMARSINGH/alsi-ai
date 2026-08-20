import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type ListRenderItemInfo,
} from "react-native";

import { AiControlsSheet } from "@/components/ai-controls-sheet";
import { ChatMessage } from "@/components/chat-message";
import { ConversationSidebar } from "@/components/conversation-sidebar";
import { ThinkingIndicator } from "@/components/thinking-indicator";
import { ScreenContainer } from "@/components/screen-container";
import { createMessage, getModeSummary, type ChatMessage as ChatMessageType, type ChatSettings } from "@/lib/chat";
import {
  appendMessageToConversation,
  createConversation,
  loadConversations,
  saveConversations,
  sortConversations,
  type Conversation,
} from "@/lib/conversations";
import { trpc } from "@/lib/trpc";

const starterPrompts = [
  "Help me make a plan",
  "Explain something clearly",
  "Brainstorm bold ideas",
];

const defaultSettings: ChatSettings = {
  mode: "normal",
  aggression: 0,
};

export default function HomeScreen() {
  const listRef = useRef<FlatList<ChatMessageType>>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [controlsOpen, setControlsOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const completion = trpc.chat.complete.useMutation();
  const isSending = completion.isPending;
  const activeConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === activeConversationId) ?? null,
    [activeConversationId, conversations],
  );
  const messages = activeConversation?.messages ?? [];
  const settings = activeConversation?.settings ?? defaultSettings;

  useEffect(() => {
    let isMounted = true;

    loadConversations().then((savedConversations) => {
      if (!isMounted) return;
      setConversations(savedConversations);
      setActiveConversationId(savedConversations[0]?.id ?? null);
      setHistoryLoaded(true);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!historyLoaded) return;
    saveConversations(conversations).catch(() => undefined);
  }, [conversations, historyLoaded]);

  useEffect(() => {
    if (messages.length > 0 || isSending) {
      const timer = setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 80);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [isSending, messages.length]);

  const updateConversation = useCallback((conversationId: string, updater: (conversation: Conversation) => Conversation) => {
    setConversations((previous) => sortConversations(previous.map((conversation) => (
      conversation.id === conversationId ? updater(conversation) : conversation
    ))));
  }, []);

  const startNewConversation = useCallback(() => {
    const conversation = createConversation(defaultSettings);
    setConversations((previous) => sortConversations([conversation, ...previous]));
    setActiveConversationId(conversation.id);
    setDraft("");
    setSidebarOpen(false);
  }, []);

  const updateSettings = useCallback((nextSettings: ChatSettings) => {
    if (!activeConversation) {
      const conversation = createConversation(nextSettings);
      setConversations((previous) => sortConversations([conversation, ...previous]));
      setActiveConversationId(conversation.id);
      return;
    }

    updateConversation(activeConversation.id, (conversation) => ({
      ...conversation,
      settings: nextSettings,
      updatedAt: Date.now(),
    }));
  }, [activeConversation, updateConversation]);

  const sendMessage = useCallback(async () => {
    const content = draft.trim();
    if (!content || isSending) return;

    Keyboard.dismiss();
    const conversation = activeConversation ?? createConversation(defaultSettings);
    const userMessage = createMessage("user", content);
    const requestMessages = [...conversation.messages.filter((message) => !message.isError), userMessage].map(({ role, content: messageContent }) => ({
      role,
      content: messageContent,
    }));
    const updatedConversation = appendMessageToConversation(conversation, userMessage);

    setConversations((previous) => {
      const exists = previous.some((item) => item.id === conversation.id);
      const next = exists
        ? previous.map((item) => (item.id === conversation.id ? updatedConversation : item))
        : [updatedConversation, ...previous];
      return sortConversations(next);
    });
    setActiveConversationId(conversation.id);
    setDraft("");

    try {
      const response = await completion.mutateAsync({
        messages: requestMessages,
        mode: conversation.settings.mode,
        aggression: conversation.settings.aggression,
      });
      const assistantMessage = createMessage("assistant", response.content);
      updateConversation(conversation.id, (current) => appendMessageToConversation(current, assistantMessage));
    } catch (error) {
      const explanation = error instanceof Error ? error.message : "Please try again.";
      const errorMessage = createMessage("assistant", explanation, { isError: true });
      updateConversation(conversation.id, (current) => appendMessageToConversation(current, errorMessage));
    }
  }, [activeConversation, completion, draft, isSending, updateConversation]);

  const openConversation = useCallback((conversation: Conversation) => {
    setActiveConversationId(conversation.id);
    setDraft("");
    setSidebarOpen(false);
  }, []);

  const deleteConversation = useCallback((conversationId: string) => {
    setConversations((previous) => {
      const next = previous.filter((conversation) => conversation.id !== conversationId);
      if (conversationId === activeConversationId) {
        setActiveConversationId(next[0]?.id ?? null);
        setDraft("");
      }
      return next;
    });
  }, [activeConversationId]);

  const renderItem = useCallback(({ item }: ListRenderItemInfo<ChatMessageType>) => <ChatMessage message={item} />, []);

  const emptyState = (
    <View style={styles.emptyState}>
      <View style={styles.sparkleMark}>
        <MaterialCommunityIcons color="#FF5A4F" name="creation-outline" size={31} />
      </View>
      <Text style={styles.emptyTitle}>Where should we begin?</Text>
      <Text style={styles.emptyBody}>
        ALSI Ai is ready to organize thoughts, explain details, and turn loose ideas into momentum.
      </Text>
      <View style={styles.suggestionGroup}>
        {starterPrompts.map((prompt) => (
          <Pressable key={prompt} onPress={() => setDraft(prompt)} style={({ pressed }) => [styles.suggestion, pressed && styles.pressed]}>
            <Text style={styles.suggestionText}>{prompt}</Text>
            <MaterialCommunityIcons color="#686765" name="arrow-up-right" size={16} />
          </Pressable>
        ))}
      </View>
    </View>
  );

  return (
    <ScreenContainer edges={["top", "left", "right", "bottom"]} containerClassName="bg-background">
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.flex}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Pressable
              accessibilityLabel="Open conversation sidebar"
              onPress={() => setSidebarOpen(true)}
              style={({ pressed }) => [styles.sidebarButton, pressed && styles.pressed]}
            >
              <MaterialCommunityIcons color="#2E2E2C" name="menu" size={22} />
            </Pressable>
            <View style={styles.brandRow}>
            <View style={styles.logoMark}>
              <Text style={styles.logoText}>A</Text>
            </View>
            <View>
              <Text style={styles.title}>ALSI Ai</Text>
              <View style={styles.statusRow}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>Ready for your next thought</Text>
              </View>
            </View>
            </View>
          </View>
          <View style={styles.headerActions}>
            <Pressable
              accessibilityLabel="Open response controls"
              onPress={() => setControlsOpen(true)}
              style={({ pressed }) => [styles.headerButton, pressed && styles.pressed]}
            >
              <MaterialCommunityIcons color="#2E2E2C" name="tune-vertical" size={20} />
            </Pressable>
            <Pressable
              accessibilityLabel="Open conversation sidebar"
              onPress={() => setSidebarOpen(true)}
              style={({ pressed }) => [styles.headerButton, pressed && styles.pressed]}
            >
              <MaterialCommunityIcons color="#2E2E2C" name="message-text-outline" size={20} />
            </Pressable>
          </View>
        </View>

        <FlatList
          ref={listRef}
          contentContainerStyle={messages.length === 0 ? styles.emptyListContent : styles.listContent}
          data={messages}
          keyboardDismissMode="interactive"
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={emptyState}
          ListFooterComponent={isSending ? <ThinkingIndicator /> : null}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: messages.length > 0 })}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
        />

        <View style={styles.composerArea}>
          <View style={styles.modePill}>
            <MaterialCommunityIcons color="#B5433A" name={settings.mode === "thinking" ? "head-snowflake-outline" : "message-processing-outline"} size={14} />
            <Text style={styles.modePillText}>{settings.mode === "thinking" ? "Thinking" : "Normal"}</Text>
            <Text style={styles.modePillSubtext}>· {getModeSummary(settings.mode)}</Text>
          </View>
          <View style={styles.composer}>
            <TextInput
              accessibilityLabel="Message ALSI Ai"
              editable={!isSending}
              maxLength={4000}
              multiline
              onChangeText={setDraft}
              onSubmitEditing={sendMessage}
              placeholder="Message ALSI Ai..."
              placeholderTextColor="#969491"
              returnKeyType="send"
              style={styles.input}
              value={draft}
            />
            <Pressable
              accessibilityLabel="Open response controls"
              onPress={() => setControlsOpen(true)}
              style={({ pressed }) => [styles.composerControl, pressed && styles.pressed]}
            >
              <MaterialCommunityIcons color="#5D5C59" name="tune-vertical" size={20} />
            </Pressable>
            <Pressable
              accessibilityLabel="Send message"
              disabled={!draft.trim() || isSending}
              onPress={sendMessage}
              style={({ pressed }) => [
                styles.sendButton,
                (!draft.trim() || isSending) && styles.sendButtonDisabled,
                pressed && styles.pressed,
              ]}
            >
              {isSending ? (
                <MaterialCommunityIcons color="#AAA9A6" name="clock-outline" size={19} />
              ) : (
                <MaterialCommunityIcons color="#FFFFFF" name="arrow-up" size={20} />
              )}
            </Pressable>
          </View>
          <Text style={styles.disclaimer}>ALSI Ai can make mistakes. Check important information.</Text>
        </View>
      </KeyboardAvoidingView>

      <AiControlsSheet onChange={updateSettings} onClose={() => setControlsOpen(false)} settings={settings} visible={controlsOpen} />
      <ConversationSidebar
        activeConversationId={activeConversationId}
        conversations={conversations}
        onClose={() => setSidebarOpen(false)}
        onCreateConversation={startNewConversation}
        onDeleteConversation={deleteConversation}
        onOpenConversation={openConversation}
        visible={sidebarOpen}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: {
    alignItems: "center",
    backgroundColor: "#F7F7F5",
    borderBottomColor: "#E8E7E4",
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 68,
    paddingHorizontal: 18,
    position: "relative",
    zIndex: 3,
  },
  headerLeft: { alignItems: "center", flexDirection: "row", gap: 9, flex: 1 },
  brandRow: { alignItems: "center", flexDirection: "row", gap: 10, flexShrink: 1 },
  sidebarButton: {
    alignItems: "center",
    backgroundColor: "#ECEBE8",
    borderRadius: 18,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  logoMark: {
    alignItems: "center",
    backgroundColor: "#151515",
    borderRadius: 12,
    height: 37,
    justifyContent: "center",
    width: 37,
  },
  logoText: { color: "#FFFFFF", fontSize: 19, fontWeight: "800", letterSpacing: -0.7 },
  title: { color: "#1B1B1A", fontSize: 17, fontWeight: "800", letterSpacing: -0.2 },
  statusRow: { alignItems: "center", flexDirection: "row", gap: 5, marginTop: 2 },
  statusDot: { backgroundColor: "#42A77B", borderRadius: 3, height: 6, width: 6 },
  statusText: { color: "#84827F", fontSize: 10, fontWeight: "600" },
  headerActions: { flexDirection: "row", gap: 7 },
  headerButton: {
    alignItems: "center",
    backgroundColor: "#ECEBE8",
    borderRadius: 18,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  menu: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E5E3DF",
    borderRadius: 13,
    borderWidth: 1,
    elevation: 4,
    padding: 5,
    position: "absolute",
    right: 18,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.11,
    shadowRadius: 13,
    top: 59,
    width: 154,
    zIndex: 10,
  },
  menuItem: { alignItems: "center", borderRadius: 9, flexDirection: "row", gap: 8, paddingHorizontal: 10, paddingVertical: 10 },
  menuItemPressed: { backgroundColor: "#F2F1EF" },
  menuText: { color: "#2F2F2D", fontSize: 13, fontWeight: "700" },
  listContent: { flexGrow: 1, paddingHorizontal: 18, paddingTop: 25 },
  emptyListContent: { flexGrow: 1, justifyContent: "center", paddingHorizontal: 22, paddingVertical: 28 },
  emptyState: { alignItems: "center", marginBottom: 24, marginTop: -20 },
  sparkleMark: { alignItems: "center", backgroundColor: "#FFF0EE", borderRadius: 24, height: 56, justifyContent: "center", marginBottom: 18, width: 56 },
  emptyTitle: { color: "#1C1C1A", fontSize: 25, fontWeight: "800", letterSpacing: -0.6, textAlign: "center" },
  emptyBody: { color: "#747270", fontSize: 14, lineHeight: 20, marginTop: 10, maxWidth: 300, textAlign: "center" },
  suggestionGroup: { alignSelf: "stretch", gap: 9, marginTop: 28 },
  suggestion: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#E8E7E4",
    borderRadius: 15,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingVertical: 14,
  },
  suggestionText: { color: "#494845", fontSize: 14, fontWeight: "700" },
  composerArea: { backgroundColor: "#F7F7F5", paddingHorizontal: 14, paddingTop: 8 },
  modePill: { alignItems: "center", alignSelf: "flex-start", flexDirection: "row", marginBottom: 7, marginLeft: 5 },
  modePillText: { color: "#A94039", fontSize: 11, fontWeight: "800", marginLeft: 5 },
  modePillSubtext: { color: "#8A8885", fontSize: 11, marginLeft: 2 },
  composer: {
    alignItems: "flex-end",
    backgroundColor: "#FFFFFF",
    borderColor: "#DCDAD6",
    borderRadius: 22,
    borderWidth: 1,
    flexDirection: "row",
    minHeight: 54,
    paddingBottom: 6,
    paddingLeft: 15,
    paddingRight: 6,
    paddingTop: 6,
  },
  input: { color: "#21211F", flex: 1, fontSize: 16, lineHeight: 22, maxHeight: 112, paddingBottom: 8, paddingTop: 8 },
  composerControl: { alignItems: "center", height: 40, justifyContent: "center", width: 34 },
  sendButton: { alignItems: "center", backgroundColor: "#151515", borderRadius: 16, height: 40, justifyContent: "center", marginLeft: 2, width: 40 },
  sendButtonDisabled: { backgroundColor: "#ECEBE8" },
  disclaimer: { color: "#A19F9B", fontSize: 10, paddingBottom: 6, paddingTop: 8, textAlign: "center" },
  pressed: { opacity: 0.76, transform: [{ scale: 0.97 }] },
});
