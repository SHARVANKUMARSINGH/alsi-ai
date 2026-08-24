import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import Markdown from "react-native-markdown-display";
import { useMemo } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

import { CopyableCodeBlock, getCodeLanguageLabel } from "@/components/copyable-code-block";
import type { ChatMessage as ChatMessageType } from "@/lib/chat";

type ChatMessageProps = {
  message: ChatMessageType;
  onRetry?: (message: ChatMessageType) => void;
  quickCopyButtons?: boolean;
  retryDisabled?: boolean;
};

type MarkdownFenceNode = {
  key: string;
  content: string;
  sourceInfo?: string;
};

function timestamp(value: number) {
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(value);
}

function createMarkdownRules(quickCopyButtons: boolean) {
  const renderCodeBlock = (node: MarkdownFenceNode) => {
    const code = node.content.endsWith("\n") ? node.content.slice(0, -1) : node.content;
    return (
      <CopyableCodeBlock
        code={code}
        key={node.key}
        language={getCodeLanguageLabel(node.sourceInfo)}
        showCopyButton={quickCopyButtons}
      />
    );
  };

  return { code_block: renderCodeBlock, fence: renderCodeBlock };
}

export function ChatMessage({ message, onRetry, quickCopyButtons = true, retryDisabled = false }: ChatMessageProps) {
  const isUser = message.role === "user";
  const markdownRules = useMemo(() => createMarkdownRules(quickCopyButtons), [quickCopyButtons]);

  return (
    <View style={[styles.wrapper, isUser ? styles.userWrapper : styles.assistantWrapper]}>
      {!isUser ? (
        <View style={styles.assistantMeta}>
          <View style={[styles.presenceDot, message.isError && styles.errorDot]} />
          <Text style={[styles.sender, message.isError && styles.errorText]}>
            {message.isError ? "Connection note" : "ALSI Ai"}
          </Text>
        </View>
      ) : null}
      <View
        style={[
          styles.bubble,
          isUser ? styles.userBubble : styles.assistantBubble,
          message.isError && styles.errorBubble,
        ]}
      >
        {message.attachment ? (
          <Image accessibilityLabel="Attached image" source={{ uri: message.attachment.uri }} style={styles.attachmentImage} />
        ) : null}
        {isUser || message.isError ? (
          <Text style={[styles.messageText, isUser ? styles.userText : styles.assistantText]}>
            {message.content}
          </Text>
        ) : (
          <Markdown rules={markdownRules} style={markdownStyles}>{message.content}</Markdown>
        )}
        {message.isError && onRetry ? (
          <Pressable
            accessibilityLabel="Retry the last message"
            disabled={retryDisabled}
            onPress={() => onRetry(message)}
            style={({ pressed }) => [styles.retryButton, retryDisabled && styles.retryDisabled, pressed && styles.pressed]}
          >
            <MaterialCommunityIcons color="#A94039" name="refresh" size={16} />
            <Text style={styles.retryText}>{retryDisabled ? "Retrying…" : "Retry message"}</Text>
          </Pressable>
        ) : null}
      </View>
      <Text style={[styles.time, isUser ? styles.userTime : styles.assistantTime]}>
        {timestamp(message.createdAt)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { maxWidth: "88%", marginBottom: 20 },
  userWrapper: { alignItems: "flex-end", alignSelf: "flex-end" },
  assistantWrapper: { alignItems: "flex-start", alignSelf: "flex-start" },
  assistantMeta: { alignItems: "center", flexDirection: "row", gap: 6, marginBottom: 7, paddingLeft: 2 },
  presenceDot: { backgroundColor: "#FF5A4F", borderRadius: 4, height: 7, width: 7 },
  errorDot: { backgroundColor: "#D7534C" },
  sender: { color: "#51514F", fontSize: 12, fontWeight: "700", letterSpacing: 0.15 },
  errorText: { color: "#AD4842" },
  bubble: { borderRadius: 22, paddingHorizontal: 16, paddingVertical: 13 },
  userBubble: { backgroundColor: "#151515", borderBottomRightRadius: 6 },
  assistantBubble: { backgroundColor: "#FFFFFF", borderBottomLeftRadius: 6, borderColor: "#E8E7E4", borderWidth: 1 },
  errorBubble: { backgroundColor: "#FFF5F4", borderColor: "#F2C6C1" },
  attachmentImage: { alignSelf: "stretch", backgroundColor: "#E7E5E1", borderRadius: 13, height: 180, marginBottom: 10, width: 240 },
  messageText: { fontSize: 16, lineHeight: 23 },
  userText: { color: "#FFFFFF" },
  assistantText: { color: "#20201F" },
  retryButton: { alignItems: "center", alignSelf: "flex-start", backgroundColor: "#FFFFFF", borderColor: "#E7B9B4", borderRadius: 10, borderWidth: 1, flexDirection: "row", gap: 6, marginTop: 11, paddingHorizontal: 10, paddingVertical: 7 },
  retryText: { color: "#A94039", fontSize: 12, fontWeight: "800" },
  retryDisabled: { opacity: 0.5 },
  time: { color: "#9B9A97", fontSize: 11, marginTop: 6 },
  userTime: { paddingRight: 3 },
  assistantTime: { paddingLeft: 3 },
  pressed: { opacity: 0.72, transform: [{ scale: 0.98 }] },
});

const markdownStyles = StyleSheet.create({
  body: { color: "#20201F", fontSize: 16, lineHeight: 23 },
  heading1: { color: "#171716", fontSize: 23, fontWeight: "800", lineHeight: 29, marginBottom: 10, marginTop: 3 },
  heading2: { color: "#171716", fontSize: 19, fontWeight: "800", lineHeight: 25, marginBottom: 8, marginTop: 12 },
  heading3: { color: "#292825", fontSize: 17, fontWeight: "800", lineHeight: 23, marginBottom: 6, marginTop: 10 },
  strong: { color: "#171716", fontWeight: "800" },
  em: { color: "#5C5A56", fontStyle: "italic" },
  bullet_list: { marginBottom: 7, marginTop: 4 },
  ordered_list: { marginBottom: 7, marginTop: 4 },
  list_item: { flexDirection: "row", marginBottom: 4 },
  bullet_list_icon: { color: "#FF5A4F", marginRight: 7 },
  ordered_list_icon: { color: "#B4443C", fontWeight: "800", marginRight: 7 },
  code_inline: { backgroundColor: "#F0EEEA", borderColor: "#DDD9D2", borderRadius: 5, borderWidth: 1, color: "#9C3932", fontFamily: "monospace", fontSize: 13, paddingHorizontal: 4, paddingVertical: 1 },
  fence: { backgroundColor: "#171716", borderRadius: 13, color: "#F8F7F5", fontFamily: "monospace", fontSize: 13, lineHeight: 19, marginBottom: 10, marginTop: 10, overflow: "hidden", padding: 13 },
  code_block: { backgroundColor: "#171716", borderRadius: 13, color: "#F8F7F5", fontFamily: "monospace", fontSize: 13, lineHeight: 19, marginBottom: 10, marginTop: 10, overflow: "hidden", padding: 13 },
  link: { color: "#B4443C", fontWeight: "700", textDecorationLine: "underline" },
  blockquote: { backgroundColor: "#FFF4F2", borderLeftColor: "#FF5A4F", borderLeftWidth: 3, color: "#5C4541", marginBottom: 8, paddingHorizontal: 10, paddingVertical: 7 },
});
