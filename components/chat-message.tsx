import Markdown from "react-native-markdown-display";
import { StyleSheet, Text, View } from "react-native";

import type { ChatMessage as ChatMessageType } from "@/lib/chat";

type ChatMessageProps = {
  message: ChatMessageType;
};

function timestamp(value: number) {
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(value);
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

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
        {isUser || message.isError ? (
          <Text style={[styles.messageText, isUser ? styles.userText : styles.assistantText]}>
            {message.content}
          </Text>
        ) : (
          <Markdown style={markdownStyles}>{message.content}</Markdown>
        )}
      </View>
      <Text style={[styles.time, isUser ? styles.userTime : styles.assistantTime]}>
        {timestamp(message.createdAt)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    maxWidth: "88%",
    marginBottom: 20,
  },
  userWrapper: {
    alignSelf: "flex-end",
    alignItems: "flex-end",
  },
  assistantWrapper: {
    alignSelf: "flex-start",
    alignItems: "flex-start",
  },
  assistantMeta: {
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
    marginBottom: 7,
    paddingLeft: 2,
  },
  presenceDot: {
    backgroundColor: "#FF5A4F",
    borderRadius: 4,
    height: 7,
    width: 7,
  },
  errorDot: {
    backgroundColor: "#D7534C",
  },
  sender: {
    color: "#51514F",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.15,
  },
  errorText: {
    color: "#AD4842",
  },
  bubble: {
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  userBubble: {
    backgroundColor: "#151515",
    borderBottomRightRadius: 6,
  },
  assistantBubble: {
    backgroundColor: "#FFFFFF",
    borderBottomLeftRadius: 6,
    borderColor: "#E8E7E4",
    borderWidth: 1,
  },
  errorBubble: {
    backgroundColor: "#FFF5F4",
    borderColor: "#F2C6C1",
  },
  messageText: {
    fontSize: 16,
    lineHeight: 23,
  },
  userText: {
    color: "#FFFFFF",
  },
  assistantText: {
    color: "#20201F",
  },
  time: {
    color: "#9B9A97",
    fontSize: 11,
    marginTop: 6,
  },
  userTime: {
    paddingRight: 3,
  },
  assistantTime: {
    paddingLeft: 3,
  },
});

const markdownStyles = StyleSheet.create({
  body: {
    color: "#20201F",
    fontSize: 16,
    lineHeight: 23,
  },
  heading1: {
    color: "#171716",
    fontSize: 23,
    fontWeight: "800",
    lineHeight: 29,
    marginBottom: 10,
    marginTop: 3,
  },
  heading2: {
    color: "#171716",
    fontSize: 19,
    fontWeight: "800",
    lineHeight: 25,
    marginBottom: 8,
    marginTop: 12,
  },
  heading3: {
    color: "#292825",
    fontSize: 17,
    fontWeight: "800",
    lineHeight: 23,
    marginBottom: 6,
    marginTop: 10,
  },
  strong: {
    color: "#171716",
    fontWeight: "800",
  },
  em: {
    color: "#5C5A56",
    fontStyle: "italic",
  },
  bullet_list: {
    marginBottom: 7,
    marginTop: 4,
  },
  ordered_list: {
    marginBottom: 7,
    marginTop: 4,
  },
  list_item: {
    flexDirection: "row",
    marginBottom: 4,
  },
  bullet_list_icon: {
    color: "#FF5A4F",
    marginRight: 7,
  },
  ordered_list_icon: {
    color: "#B4443C",
    fontWeight: "800",
    marginRight: 7,
  },
  code_inline: {
    backgroundColor: "#F0EEEA",
    borderColor: "#DDD9D2",
    borderRadius: 5,
    borderWidth: 1,
    color: "#9C3932",
    fontFamily: "monospace",
    fontSize: 13,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  fence: {
    backgroundColor: "#171716",
    borderRadius: 13,
    color: "#F8F7F5",
    fontFamily: "monospace",
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 10,
    marginTop: 10,
    overflow: "hidden",
    padding: 13,
  },
  code_block: {
    backgroundColor: "#171716",
    borderRadius: 13,
    color: "#F8F7F5",
    fontFamily: "monospace",
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 10,
    marginTop: 10,
    overflow: "hidden",
    padding: 13,
  },
  link: {
    color: "#B4443C",
    fontWeight: "700",
    textDecorationLine: "underline",
  },
  blockquote: {
    backgroundColor: "#FFF4F2",
    borderLeftColor: "#FF5A4F",
    borderLeftWidth: 3,
    color: "#5C4541",
    marginBottom: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
});
