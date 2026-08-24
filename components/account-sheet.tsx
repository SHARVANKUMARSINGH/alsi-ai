import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

import { getNextRenewalAt, type StoredAccount } from "@/lib/account";
import { getAlsiModel } from "@/lib/models";

type AccountSheetProps = {
  account: StoredAccount;
  onClose: () => void;
  onSignOut: () => void;
  onUpgradeLogin: () => void;
  visible: boolean;
};

function formatRenewal(timestamp: number | null) {
  if (!timestamp) return "Guest tokens do not renew";
  return `Next renewal ${new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(timestamp)}`;
}

export function AccountSheet({ account, onClose, onSignOut, onUpgradeLogin, visible }: AccountSheetProps) {
  const isGuest = account.mode === "guest";
  const selectedModel = getAlsiModel(account.selectedModelId);

  return (
    <Modal animationType="slide" onRequestClose={onClose} transparent visible={visible}>
      <Pressable accessibilityLabel="Close account settings" onPress={onClose} style={styles.backdrop} />
      <View style={styles.sheet}>
        <View style={styles.grabber} />
        <View style={styles.titleRow}>
          <View>
            <Text style={styles.eyebrow}>ACCOUNT</Text>
            <Text style={styles.title}>{isGuest ? "Guest access" : "Your ALSI account"}</Text>
          </View>
          <Pressable accessibilityLabel="Close account settings" hitSlop={10} onPress={onClose} style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}>
            <MaterialCommunityIcons color="#4F4F4D" name="close" size={20} />
          </Pressable>
        </View>

        <View style={styles.balanceCard}>
          <View style={styles.balanceIcon}>
            <MaterialCommunityIcons color="#FFFFFF" name="lightning-bolt" size={23} />
          </View>
          <View style={styles.balanceCopy}>
            <Text style={styles.balanceValue}>{account.tokens} tokens available</Text>
            <Text style={styles.balanceCaption}>{formatRenewal(getNextRenewalAt(account))}</Text>
          </View>
        </View>

        <View style={styles.detailCard}>
          <View style={styles.detailRow}>
            <View style={styles.detailIcon}><MaterialCommunityIcons color="#6B6965" name={isGuest ? "account-outline" : "email-outline"} size={18} /></View>
            <View style={styles.detailCopy}>
              <Text style={styles.detailLabel}>{isGuest ? "ACCESS" : "SIGNED IN AS"}</Text>
              <Text numberOfLines={1} style={styles.detailValue}>{isGuest ? "Guest mode · ALSI Lite" : account.identifier ?? "Verified account"}</Text>
            </View>
          </View>
          <View style={styles.detailDivider} />
          <View style={styles.detailRow}>
            <View style={styles.detailIcon}><MaterialCommunityIcons color="#6B6965" name="robot-outline" size={18} /></View>
            <View style={styles.detailCopy}>
              <Text style={styles.detailLabel}>ACTIVE MODEL</Text>
              <Text style={styles.detailValue}>{selectedModel.label} · {selectedModel.tokenCost} token{selectedModel.tokenCost === 1 ? "" : "s"} per message</Text>
            </View>
          </View>
        </View>

        {isGuest ? (
          <>
            <Text style={styles.note}>Verify an email to unlock ALSI and Alsi Pro, save your renewable balance, and use the full model suite.</Text>
            <Pressable onPress={onUpgradeLogin} style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}>
              <Text style={styles.primaryButtonText}>Verify email & unlock full access</Text>
              <MaterialCommunityIcons color="#FFFFFF" name="arrow-right" size={18} />
            </Pressable>
          </>
        ) : (
          <>
            <Text style={styles.note}>Your local chats remain on this device when you switch accounts. Your token balance is synced with Appwrite.</Text>
            <Pressable onPress={onSignOut} style={({ pressed }) => [styles.signOutButton, pressed && styles.pressed]}>
              <MaterialCommunityIcons color="#9F3E37" name="logout-variant" size={18} />
              <Text style={styles.signOutText}>Sign out & switch account</Text>
            </Pressable>
          </>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { backgroundColor: "rgba(20, 20, 19, 0.42)", bottom: 0, left: 0, position: "absolute", right: 0, top: 0 },
  sheet: { backgroundColor: "#F7F7F5", borderTopLeftRadius: 28, borderTopRightRadius: 28, bottom: 0, left: 0, paddingBottom: 34, paddingHorizontal: 20, paddingTop: 10, position: "absolute", right: 0 },
  grabber: { alignSelf: "center", backgroundColor: "#C8C7C3", borderRadius: 3, height: 5, marginBottom: 16, width: 42 },
  titleRow: { alignItems: "flex-start", flexDirection: "row", justifyContent: "space-between", marginBottom: 20 },
  eyebrow: { color: "#8E8D8A", fontSize: 10, fontWeight: "800", letterSpacing: 1.2, marginBottom: 5 },
  title: { color: "#1B1B1A", fontSize: 23, fontWeight: "700", letterSpacing: -0.4 },
  closeButton: { alignItems: "center", backgroundColor: "#EAE9E6", borderRadius: 18, height: 36, justifyContent: "center", width: 36 },
  balanceCard: { alignItems: "center", backgroundColor: "#191918", borderRadius: 20, flexDirection: "row", padding: 16 },
  balanceIcon: { alignItems: "center", backgroundColor: "#FF5A4F", borderRadius: 18, height: 42, justifyContent: "center", width: 42 },
  balanceCopy: { flex: 1, marginLeft: 12 },
  balanceValue: { color: "#FFFFFF", fontSize: 17, fontWeight: "800" },
  balanceCaption: { color: "#C9C7C2", fontSize: 11, marginTop: 4 },
  detailCard: { backgroundColor: "#FFFFFF", borderColor: "#E4E1DC", borderRadius: 18, borderWidth: 1, marginTop: 14, paddingHorizontal: 13 },
  detailRow: { alignItems: "center", flexDirection: "row", paddingVertical: 13 },
  detailIcon: { alignItems: "center", backgroundColor: "#F1F0ED", borderRadius: 14, height: 31, justifyContent: "center", width: 31 },
  detailCopy: { flex: 1, marginLeft: 10 },
  detailLabel: { color: "#888681", fontSize: 9, fontWeight: "800", letterSpacing: 0.85 },
  detailValue: { color: "#32312F", fontSize: 12, fontWeight: "700", marginTop: 3 },
  detailDivider: { backgroundColor: "#ECE9E5", height: 1 },
  note: { color: "#74726E", fontSize: 12, lineHeight: 17, marginHorizontal: 3, marginTop: 16 },
  primaryButton: { alignItems: "center", backgroundColor: "#191918", borderRadius: 15, flexDirection: "row", gap: 8, justifyContent: "center", marginTop: 19, paddingVertical: 15 },
  primaryButtonText: { color: "#FFFFFF", fontSize: 14, fontWeight: "800" },
  signOutButton: { alignItems: "center", backgroundColor: "#FFF2F0", borderColor: "#F2C9C4", borderRadius: 15, borderWidth: 1, flexDirection: "row", gap: 8, justifyContent: "center", marginTop: 19, paddingVertical: 14 },
  signOutText: { color: "#9F3E37", fontSize: 14, fontWeight: "800" },
  pressed: { opacity: 0.74, transform: [{ scale: 0.98 }] },
});
