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
        <Text style={[styles.messageText, isUser ? styles.userText : styles.assistantText]}>
          {message.content}
        </Text>
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
