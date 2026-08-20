import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { FlatList, Modal, Pressable, StyleSheet, Text, View } from "react-native";

import { getConversationPreview, type Conversation } from "@/lib/conversations";

type ConversationSidebarProps = {
  activeConversationId: string | null;
  conversations: Conversation[];
  onClose: () => void;
  onCreateConversation: () => void;
  onDeleteConversation: (id: string) => void;
  onOpenConversation: (conversation: Conversation) => void;
  visible: boolean;
};

function formatConversationDate(timestamp: number) {
  const date = new Date(timestamp);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();

  return isToday
    ? new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(date)
    : new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(date);
}

export function ConversationSidebar({
  activeConversationId,
  conversations,
  onClose,
  onCreateConversation,
  onDeleteConversation,
  onOpenConversation,
  visible,
}: ConversationSidebarProps) {
  return (
    <Modal animationType="fade" onRequestClose={onClose} transparent visible={visible}>
      <View style={styles.root}>
        <Pressable accessibilityLabel="Close conversation sidebar" onPress={onClose} style={styles.backdrop} />
        <View style={styles.sidebar}>
          <View style={styles.header}>
            <View>
              <Text style={styles.eyebrow}>YOUR SPACE</Text>
              <Text style={styles.heading}>Conversations</Text>
            </View>
            <Pressable accessibilityLabel="Close conversation sidebar" onPress={onClose} style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}>
              <MaterialCommunityIcons color="#3E3D3A" name="close" size={20} />
            </Pressable>
          </View>

          <Pressable onPress={onCreateConversation} style={({ pressed }) => [styles.newChatButton, pressed && styles.pressed]}>
            <MaterialCommunityIcons color="#FFFFFF" name="plus" size={19} />
            <Text style={styles.newChatText}>New conversation</Text>
          </Pressable>

          <Text style={styles.sectionLabel}>CHAT HISTORY</Text>
          <FlatList
            contentContainerStyle={conversations.length === 0 ? styles.emptyList : styles.list}
            data={conversations}
            keyExtractor={(conversation) => conversation.id}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <View style={styles.emptyIcon}>
                  <MaterialCommunityIcons color="#9A9894" name="message-outline" size={22} />
                </View>
                <Text style={styles.emptyTitle}>No saved chats yet</Text>
                <Text style={styles.emptyBody}>Start a new conversation and it will appear here automatically.</Text>
              </View>
            }
            renderItem={({ item }) => {
              const isActive = item.id === activeConversationId;
              return (
                <View style={[styles.conversationItem, isActive && styles.activeConversationItem]}>
                  <Pressable
                    accessibilityLabel={`Open ${item.title}`}
                    onPress={() => onOpenConversation(item)}
                    style={({ pressed }) => [styles.conversationMain, pressed && styles.itemPressed]}
                  >
                    <View style={styles.conversationTitleRow}>
                      <Text numberOfLines={1} style={[styles.conversationTitle, isActive && styles.activeConversationText]}>
                        {item.title}
                      </Text>
                      <Text style={[styles.conversationDate, isActive && styles.activeConversationDate]}>{formatConversationDate(item.updatedAt)}</Text>
                    </View>
                    <Text numberOfLines={2} style={[styles.conversationPreview, isActive && styles.activeConversationPreview]}>
                      {getConversationPreview(item.messages)}
                    </Text>
                  </Pressable>
                  <Pressable
                    accessibilityLabel={`Delete ${item.title}`}
                    hitSlop={8}
                    onPress={() => onDeleteConversation(item.id)}
                    style={({ pressed }) => [styles.deleteButton, pressed && styles.pressed]}
                  >
                    <MaterialCommunityIcons color={isActive ? "#B5433A" : "#9B9893"} name="trash-can-outline" size={17} />
                  </Pressable>
                </View>
              );
            }}
            showsVerticalScrollIndicator={false}
          />

          <View style={styles.footer}>
            <MaterialCommunityIcons color="#A19F9A" name="cellphone-link" size={15} />
            <Text style={styles.footerText}>Chats are stored privately on this device.</Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  backdrop: { backgroundColor: "rgba(20, 20, 18, 0.36)", bottom: 0, left: 0, position: "absolute", right: 0, top: 0 },
  sidebar: {
    backgroundColor: "#F7F7F5",
    borderRightColor: "#E1DFDB",
    borderRightWidth: 1,
    bottom: 0,
    left: 0,
    paddingBottom: 20,
    paddingHorizontal: 16,
    paddingTop: 57,
    position: "absolute",
    top: 0,
    width: "82%",
  },
  header: { alignItems: "flex-start", flexDirection: "row", justifyContent: "space-between", marginBottom: 22 },
  eyebrow: { color: "#8A8884", fontSize: 10, fontWeight: "800", letterSpacing: 1.1, marginBottom: 5 },
  heading: { color: "#1A1A18", fontSize: 23, fontWeight: "800", letterSpacing: -0.55 },
  closeButton: { alignItems: "center", backgroundColor: "#EBEAE7", borderRadius: 17, height: 34, justifyContent: "center", width: 34 },
  newChatButton: { alignItems: "center", backgroundColor: "#171716", borderRadius: 15, flexDirection: "row", gap: 8, justifyContent: "center", marginBottom: 25, paddingVertical: 14 },
  newChatText: { color: "#FFFFFF", fontSize: 14, fontWeight: "800" },
  sectionLabel: { color: "#8A8884", fontSize: 10, fontWeight: "800", letterSpacing: 0.9, marginBottom: 8, paddingLeft: 4 },
  list: { gap: 6, paddingBottom: 16 },
  emptyList: { flexGrow: 1, justifyContent: "center", paddingBottom: 50 },
  conversationItem: { alignItems: "center", borderRadius: 14, flexDirection: "row", minHeight: 70, paddingLeft: 12, paddingRight: 5 },
  activeConversationItem: { backgroundColor: "#FFF0EE" },
  conversationMain: { flex: 1, paddingVertical: 10 },
  conversationTitleRow: { alignItems: "center", flexDirection: "row", gap: 8, justifyContent: "space-between" },
  conversationTitle: { color: "#32312F", flex: 1, fontSize: 13, fontWeight: "800" },
  conversationDate: { color: "#9A9894", fontSize: 10, fontWeight: "600" },
  conversationPreview: { color: "#777571", fontSize: 11, lineHeight: 15, marginTop: 4, paddingRight: 4 },
  activeConversationText: { color: "#8F352E" },
  activeConversationDate: { color: "#B25B54" },
  activeConversationPreview: { color: "#9D625D" },
  deleteButton: { alignItems: "center", height: 36, justifyContent: "center", width: 32 },
  emptyState: { alignItems: "center", paddingHorizontal: 24 },
  emptyIcon: { alignItems: "center", backgroundColor: "#EBEAE6", borderRadius: 20, height: 40, justifyContent: "center", marginBottom: 12, width: 40 },
  emptyTitle: { color: "#494744", fontSize: 14, fontWeight: "800", textAlign: "center" },
  emptyBody: { color: "#85827E", fontSize: 12, lineHeight: 17, marginTop: 6, textAlign: "center" },
  footer: { alignItems: "center", borderTopColor: "#E8E6E2", borderTopWidth: 1, flexDirection: "row", gap: 6, paddingTop: 14 },
  footerText: { color: "#918F8B", fontSize: 10, flex: 1 },
  pressed: { opacity: 0.72, transform: [{ scale: 0.98 }] },
  itemPressed: { opacity: 0.68 },
});
