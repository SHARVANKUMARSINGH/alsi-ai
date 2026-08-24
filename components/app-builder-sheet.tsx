import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useState } from "react";
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { APP_BUILDER_ALPHA_LABEL, APP_BUILDER_TOKEN_COST } from "@/lib/app-builder";

type AppBuilderSheetProps = {
  availableTokens: number;
  isBuilding: boolean;
  onBuild: (idea: string) => void;
  onClose: () => void;
  visible: boolean;
};

export function AppBuilderSheet({ availableTokens, isBuilding, onBuild, onClose, visible }: AppBuilderSheetProps) {
  const hasTokens = availableTokens >= APP_BUILDER_TOKEN_COST;
  const [appIdea, setAppIdea] = useState("");

  return (
    <Modal animationType="slide" onRequestClose={onClose} transparent visible={visible}>
      <Pressable accessibilityLabel="Close App Builder" onPress={onClose} style={styles.backdrop} />
      <View style={styles.sheet}>
        <View style={styles.grabber} />
        <View style={styles.titleRow}>
          <View style={styles.titleCopy}>
            <View style={styles.alphaRow}>
              <Text style={styles.eyebrow}>APP BUILDER</Text>
              <View style={styles.alphaBadge}><Text style={styles.alphaText}>{APP_BUILDER_ALPHA_LABEL}</Text></View>
            </View>
            <Text style={styles.title}>Develop an Expo app</Text>
          </View>
          <Pressable accessibilityLabel="Close App Builder" disabled={isBuilding} hitSlop={10} onPress={onClose} style={({ pressed }) => [styles.closeButton, isBuilding && styles.disabled, pressed && styles.pressed]}>
            <MaterialCommunityIcons color="#4F4F4D" name="close" size={20} />
          </Pressable>
        </View>

        <View style={styles.tokenCard}>
          <View style={styles.tokenIcon}><MaterialCommunityIcons color="#FFFFFF" name="lightning-bolt" size={18} /></View>
          <View style={styles.tokenCopy}>
            <Text style={styles.tokenTitle}>{APP_BUILDER_TOKEN_COST} tokens per build guide</Text>
            <Text style={styles.tokenBody}>{availableTokens} currently available · only charged after a successful guide</Text>
          </View>
        </View>

        <Text style={styles.label}>WHAT SHOULD ALSI BUILD?</Text>
        <TextInput
          accessibilityLabel="Describe the Expo app you want to build"
          autoFocus
          editable={!isBuilding}
          maxLength={1_500}
          multiline
          onChangeText={setAppIdea}
          placeholder="Example: A habit tracker with streaks, reminders, and a calm dark theme"
          placeholderTextColor="#9B9893"
          style={styles.ideaInput}
          textAlignVertical="top"
        />

        <View style={styles.safetyCard}>
          <MaterialCommunityIcons color="#3976C8" name="shield-check-outline" size={19} />
          <Text style={styles.safetyText}>ALSI creates a guided plan and code instructions. You run Termux commands and approve any Expo or EAS sign-in yourself.</Text>
        </View>

        <Pressable
          accessibilityLabel="Generate an App Builder guide"
          disabled={isBuilding || !hasTokens || !appIdea.trim()}
          onPress={() => onBuild(appIdea)}
          style={({ pressed }) => [styles.buildButton, (isBuilding || !hasTokens || !appIdea.trim()) && styles.buildButtonDisabled, pressed && styles.pressed]}
        >
          <MaterialCommunityIcons color={isBuilding || !hasTokens || !appIdea.trim() ? "#9E9C98" : "#FFFFFF"} name={isBuilding ? "progress-wrench" : "hammer-wrench"} size={19} />
          <Text style={[styles.buildText, (isBuilding || !hasTokens || !appIdea.trim()) && styles.buildTextDisabled]}>{isBuilding ? "Creating your guide…" : "Create app build guide"}</Text>
        </Pressable>
        {!hasTokens ? <Text style={styles.warning}>You need {APP_BUILDER_TOKEN_COST - availableTokens} more tokens to use App Builder Alpha.</Text> : null}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { backgroundColor: "rgba(20, 20, 19, 0.42)", bottom: 0, left: 0, position: "absolute", right: 0, top: 0 },
  sheet: { backgroundColor: "#F7F7F5", borderTopLeftRadius: 28, borderTopRightRadius: 28, bottom: 0, left: 0, paddingBottom: 34, paddingHorizontal: 20, paddingTop: 10, position: "absolute", right: 0 },
  grabber: { alignSelf: "center", backgroundColor: "#C8C7C3", borderRadius: 3, height: 5, marginBottom: 16, width: 42 },
  titleRow: { alignItems: "flex-start", flexDirection: "row", justifyContent: "space-between", marginBottom: 18 },
  titleCopy: { flex: 1 },
  alphaRow: { alignItems: "center", flexDirection: "row", gap: 7, marginBottom: 5 },
  eyebrow: { color: "#777674", fontSize: 10, fontWeight: "800", letterSpacing: 1.1 },
  alphaBadge: { backgroundColor: "#E5F0FF", borderColor: "#B8D6FF", borderRadius: 8, borderWidth: 1, paddingHorizontal: 6, paddingVertical: 2 },
  alphaText: { color: "#2368BA", fontSize: 9, fontWeight: "900", letterSpacing: 0.65 },
  title: { color: "#1B1B1A", fontSize: 23, fontWeight: "700", letterSpacing: -0.4 },
  closeButton: { alignItems: "center", backgroundColor: "#EAE9E6", borderRadius: 18, height: 36, justifyContent: "center", width: 36 },
  tokenCard: { alignItems: "center", backgroundColor: "#1B1B1A", borderRadius: 16, flexDirection: "row", padding: 13 },
  tokenIcon: { alignItems: "center", backgroundColor: "#FF5A4F", borderRadius: 14, height: 33, justifyContent: "center", width: 33 },
  tokenCopy: { flex: 1, marginLeft: 10 },
  tokenTitle: { color: "#FFFFFF", fontSize: 13, fontWeight: "800" },
  tokenBody: { color: "#CBC9C4", fontSize: 10, lineHeight: 14, marginTop: 2 },
  label: { color: "#777674", fontSize: 10, fontWeight: "800", letterSpacing: 0.85, marginBottom: 8, marginTop: 18 },
  ideaInput: { backgroundColor: "#FFFFFF", borderColor: "#DDDAD5", borderRadius: 15, borderWidth: 1, color: "#292825", fontSize: 14, lineHeight: 20, minHeight: 112, padding: 12 },
  safetyCard: { alignItems: "flex-start", backgroundColor: "#EFF6FF", borderColor: "#C9E0FF", borderRadius: 14, borderWidth: 1, flexDirection: "row", gap: 8, marginTop: 12, padding: 10 },
  safetyText: { color: "#37638F", flex: 1, fontSize: 10, lineHeight: 14 },
  buildButton: { alignItems: "center", backgroundColor: "#1B1B1A", borderRadius: 15, flexDirection: "row", gap: 8, justifyContent: "center", marginTop: 16, paddingVertical: 15 },
  buildButtonDisabled: { backgroundColor: "#E7E5E1" },
  buildText: { color: "#FFFFFF", fontSize: 14, fontWeight: "800" },
  buildTextDisabled: { color: "#9E9C98" },
  warning: { color: "#B4443C", fontSize: 10, fontWeight: "700", paddingTop: 8, textAlign: "center" },
  disabled: { opacity: 0.5 },
  pressed: { opacity: 0.74, transform: [{ scale: 0.98 }] },
});
