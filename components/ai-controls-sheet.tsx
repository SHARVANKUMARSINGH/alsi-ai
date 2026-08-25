import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useEffect, useState } from "react";
import { Modal, Pressable, StyleSheet, Switch, Text, View } from "react-native";

import {
  aggressionLabels,
  aggressionTemperatures,
  getModeSummary,
  type AggressionLevel,
  type ChatMode,
  type ChatSettings,
} from "@/lib/chat";
import { canOpenConfirmedAppBuilder } from "@/lib/app-builder";

type AiControlsSheetProps = {
  visible: boolean;
  settings: ChatSettings;
  onChange: (settings: ChatSettings) => void;
  onClose: () => void;
  onOpenAppBuilder: () => void;
};

const modes: { id: ChatMode; label: string; icon: "message-processing-outline" | "head-snowflake-outline" }[] = [
  { id: "normal", label: "Normal", icon: "message-processing-outline" },
  { id: "thinking", label: "Thinking", icon: "head-snowflake-outline" },
];

export function AiControlsSheet({ visible, settings, onChange, onClose, onOpenAppBuilder }: AiControlsSheetProps) {
  const [appBuilderAcknowledged, setAppBuilderAcknowledged] = useState(false);
  const setMode = (mode: ChatMode) => onChange({ ...settings, mode });
  const setAggression = (aggression: AggressionLevel) => onChange({ ...settings, aggression });
  const setQuickCopyButtons = (quickCopyButtons: boolean) => onChange({ ...settings, quickCopyButtons });
  const appBuilderReady = settings.mode === "thinking";
  const appBuilderActionReady = canOpenConfirmedAppBuilder("lite", settings, appBuilderAcknowledged);

  useEffect(() => {
    if (!visible || !appBuilderReady) setAppBuilderAcknowledged(false);
  }, [appBuilderReady, visible]);

  return (
    <Modal animationType="slide" onRequestClose={onClose} transparent visible={visible}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.grabber} />
        <View style={styles.titleRow}>
          <View>
            <Text style={styles.eyebrow}>RESPONSE CONTROLS</Text>
            <Text style={styles.title}>Shape how ALSI replies</Text>
          </View>
          <Pressable
            accessibilityLabel="Close response controls"
            hitSlop={10}
            onPress={onClose}
            style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}
          >
            <MaterialCommunityIcons color="#4F4F4D" name="close" size={20} />
          </Pressable>
        </View>

        <Text style={styles.sectionLabel}>MODE</Text>
        <View style={styles.modeGrid}>
          {modes.map((mode) => {
            const isActive = settings.mode === mode.id;
            return (
              <Pressable
                key={mode.id}
                accessibilityRole="radio"
                accessibilityState={{ selected: isActive }}
                onPress={() => setMode(mode.id)}
                style={({ pressed }) => [
                  styles.modeOption,
                  isActive && styles.modeOptionActive,
                  pressed && styles.pressed,
                ]}
              >
                <View style={[styles.modeIcon, isActive && styles.modeIconActive]}>
                  <MaterialCommunityIcons color={isActive ? "#FFFFFF" : "#383836"} name={mode.icon} size={20} />
                </View>
                <Text style={[styles.modeLabel, isActive && styles.modeLabelActive]}>{mode.label}</Text>
                <Text style={[styles.modeSummary, isActive && styles.modeSummaryActive]}>{getModeSummary(mode.id)}</Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.intensityHeader}>
          <View>
            <Text style={styles.sectionLabel}>AGGRESSIVE MODE</Text>
            <Text style={styles.intensityCaption}>Creativity and unpredictability</Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{aggressionLabels[settings.aggression]}</Text>
          </View>
        </View>

        <View accessibilityLabel="Aggressive Mode intensity" style={styles.levels}>
          {([0, 1, 2, 3] as AggressionLevel[]).map((level) => {
            const selected = level === settings.aggression;
            const activated = level <= settings.aggression;
            return (
              <Pressable
                key={level}
                accessibilityLabel={`Set Aggressive Mode to ${aggressionLabels[level]}`}
                accessibilityRole="button"
                onPress={() => setAggression(level)}
                style={({ pressed }) => [styles.levelButton, pressed && styles.pressed]}
              >
                <View style={[styles.levelBar, activated && styles.levelBarActivated, selected && styles.levelBarSelected]} />
                <Text style={[styles.levelNumber, selected && styles.levelNumberSelected]}>{level + 1}</Text>
              </Pressable>
            );
          })}
        </View>
        <View style={styles.rangeLabels}>
          <Text style={styles.rangeLabel}>Steady</Text>
          <Text style={styles.rangeLabel}>Maximum creative</Text>
        </View>
        <Text style={styles.temperatureNote}>
          Temperature: {aggressionTemperatures[settings.aggression].toFixed(1)}
        </Text>

        <View style={styles.quickCopyRow}>
          <View style={styles.quickCopyTextGroup}>
            <Text style={styles.sectionLabel}>QUICK COPY BUTTONS</Text>
            <Text style={styles.quickCopyCaption}>Show a one-tap Copy action on code blocks.</Text>
          </View>
          <Switch
            accessibilityLabel="Enable Quick Copy Buttons"
            onValueChange={setQuickCopyButtons}
            thumbColor={settings.quickCopyButtons !== false ? "#FFFFFF" : "#F5F4F1"}
            trackColor={{ false: "#C7C5C0", true: "#FF5A4F" }}
            value={settings.quickCopyButtons !== false}
          />
        </View>

        <View style={styles.appBuilderCard}>
          <View style={styles.appBuilderHeader}>
            <View style={styles.appBuilderIcon}><MaterialCommunityIcons color="#FFFFFF" name="hammer-wrench" size={18} /></View>
            <View style={styles.appBuilderCopy}>
              <View style={styles.appBuilderTitleRow}>
                <Text style={styles.appBuilderTitle}>Develop apps</Text>
                <View style={styles.alphaBadge}><Text style={styles.alphaBadgeText}>ALPHA</Text></View>
              </View>
              <Text style={styles.appBuilderDescription}>{appBuilderReady ? "Thinking mode is active. Generate a safe Expo build guide for 40 tokens." : "Turn on Thinking mode to develop an Expo app."}</Text>
            </View>
          </View>
          <Pressable
            accessibilityLabel="Acknowledge App Builder guide and command review requirements"
            accessibilityRole="checkbox"
            accessibilityState={{ checked: appBuilderAcknowledged, disabled: !appBuilderReady }}
            disabled={!appBuilderReady}
            onPress={() => setAppBuilderAcknowledged((value) => !value)}
            style={({ pressed }) => [styles.appBuilderAcknowledgment, !appBuilderReady && styles.appBuilderAcknowledgmentDisabled, pressed && styles.pressed]}
          >
            <MaterialCommunityIcons color={appBuilderAcknowledged ? "#2767B5" : "#6B83A0"} name={appBuilderAcknowledged ? "checkbox-marked" : "checkbox-blank-outline"} size={20} />
            <Text style={[styles.appBuilderAcknowledgmentText, !appBuilderReady && styles.appBuilderAcknowledgmentTextDisabled]}>I understand this creates a guide only. I will review every proposed command before using it.</Text>
          </Pressable>
          <Pressable
            accessibilityLabel="Develop an app with App Builder Alpha"
            disabled={!appBuilderActionReady}
            onPress={onOpenAppBuilder}
            style={({ pressed }) => [styles.appBuilderButton, !appBuilderActionReady && styles.appBuilderButtonDisabled, pressed && styles.pressed]}
          >
            <Text style={[styles.appBuilderButtonText, !appBuilderActionReady && styles.appBuilderButtonTextDisabled]}>{!appBuilderReady ? "Turn on Thinking" : appBuilderAcknowledged ? "Develop app" : "Confirm to develop"}</Text>
            <MaterialCommunityIcons color={appBuilderActionReady ? "#FFFFFF" : "#9E9C98"} name={appBuilderActionReady ? "hammer-wrench" : "checkbox-marked-outline"} size={17} />
          </Pressable>
        </View>

        <Pressable onPress={onClose} style={({ pressed }) => [styles.doneButton, pressed && styles.pressed]}>
          <Text style={styles.doneText}>Done</Text>
          <MaterialCommunityIcons color="#FFFFFF" name="arrow-right" size={18} />
        </Pressable>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: "rgba(20, 20, 19, 0.42)",
    bottom: 0,
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
  },
  sheet: {
    backgroundColor: "#F7F7F5",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    bottom: 0,
    left: 0,
    paddingBottom: 34,
    paddingHorizontal: 20,
    paddingTop: 10,
    position: "absolute",
    right: 0,
  },
  grabber: {
    alignSelf: "center",
    backgroundColor: "#C8C7C3",
    borderRadius: 3,
    height: 5,
    marginBottom: 16,
    width: 42,
  },
  titleRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  eyebrow: {
    color: "#8E8D8A",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.2,
    marginBottom: 5,
  },
  title: {
    color: "#1B1B1A",
    fontSize: 23,
    fontWeight: "700",
    letterSpacing: -0.4,
  },
  closeButton: {
    alignItems: "center",
    backgroundColor: "#EAE9E6",
    borderRadius: 18,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  sectionLabel: {
    color: "#777674",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.85,
  },
  modeGrid: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 26,
    marginTop: 10,
  },
  modeOption: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E6E4E0",
    borderRadius: 18,
    borderWidth: 1,
    flex: 1,
    minHeight: 132,
    padding: 14,
  },
  modeOptionActive: {
    backgroundColor: "#1B1B1A",
    borderColor: "#1B1B1A",
  },
  modeIcon: {
    alignItems: "center",
    backgroundColor: "#F1F0ED",
    borderRadius: 15,
    height: 30,
    justifyContent: "center",
    marginBottom: 15,
    width: 30,
  },
  modeIconActive: {
    backgroundColor: "#FF5A4F",
  },
  modeLabel: {
    color: "#252523",
    fontSize: 15,
    fontWeight: "800",
    marginBottom: 5,
  },
  modeLabelActive: {
    color: "#FFFFFF",
  },
  modeSummary: {
    color: "#7A7976",
    fontSize: 11,
    lineHeight: 15,
  },
  modeSummaryActive: {
    color: "#D8D7D3",
  },
  intensityHeader: {
    alignItems: "flex-end",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  intensityCaption: {
    color: "#777674",
    fontSize: 12,
    marginTop: 5,
  },
  badge: {
    backgroundColor: "#FFF0EE",
    borderRadius: 12,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  badgeText: {
    color: "#B5433A",
    fontSize: 11,
    fontWeight: "800",
  },
  levels: {
    flexDirection: "row",
    gap: 8,
    marginTop: 16,
  },
  levelButton: {
    alignItems: "center",
    flex: 1,
    gap: 8,
  },
  levelBar: {
    backgroundColor: "#E3E1DD",
    borderRadius: 5,
    height: 10,
    width: "100%",
  },
  levelBarActivated: {
    backgroundColor: "#FFAAA4",
  },
  levelBarSelected: {
    backgroundColor: "#FF5A4F",
  },
  levelNumber: {
    color: "#949390",
    fontSize: 11,
    fontWeight: "800",
  },
  levelNumberSelected: {
    color: "#B5433A",
  },
  rangeLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  rangeLabel: {
    color: "#999794",
    fontSize: 11,
  },
  temperatureNote: {
    color: "#777674",
    fontSize: 12,
    marginTop: 18,
  },
  quickCopyRow: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#E6E4E0",
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 18,
    paddingHorizontal: 13,
    paddingVertical: 12,
  },
  quickCopyTextGroup: {
    flex: 1,
    marginRight: 12,
  },
  quickCopyCaption: {
    color: "#777674",
    fontSize: 11,
    lineHeight: 15,
    marginTop: 4,
  },
  appBuilderCard: { backgroundColor: "#F0F6FF", borderColor: "#C5DCF9", borderRadius: 16, borderWidth: 1, marginTop: 14, padding: 12 },
  appBuilderHeader: { alignItems: "center", flexDirection: "row" },
  appBuilderIcon: { alignItems: "center", backgroundColor: "#3976C8", borderRadius: 13, height: 31, justifyContent: "center", width: 31 },
  appBuilderCopy: { flex: 1, marginLeft: 9 },
  appBuilderTitleRow: { alignItems: "center", flexDirection: "row", gap: 6 },
  appBuilderTitle: { color: "#244D7E", fontSize: 13, fontWeight: "800" },
  alphaBadge: { backgroundColor: "#DCEBFF", borderColor: "#B5D0F4", borderRadius: 7, borderWidth: 1, paddingHorizontal: 5, paddingVertical: 1 },
  alphaBadgeText: { color: "#2767B5", fontSize: 8, fontWeight: "900", letterSpacing: 0.6 },
  appBuilderDescription: { color: "#5C7EA4", fontSize: 10, lineHeight: 14, marginTop: 3 },
  appBuilderAcknowledgment: { alignItems: "flex-start", flexDirection: "row", gap: 7, marginTop: 11 },
  appBuilderAcknowledgmentDisabled: { opacity: 0.56 },
  appBuilderAcknowledgmentText: { color: "#426C96", flex: 1, fontSize: 10, lineHeight: 14 },
  appBuilderAcknowledgmentTextDisabled: { color: "#94A0AD" },
  appBuilderButton: { alignItems: "center", backgroundColor: "#3976C8", borderRadius: 11, flexDirection: "row", justifyContent: "center", marginTop: 11, paddingVertical: 10 },
  appBuilderButtonDisabled: { backgroundColor: "#E2E6EC" },
  appBuilderButtonText: { color: "#FFFFFF", fontSize: 12, fontWeight: "800", marginRight: 6 },
  appBuilderButtonTextDisabled: { color: "#9E9C98" },
  doneButton: {
    alignItems: "center",
    backgroundColor: "#1B1B1A",
    borderRadius: 15,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    marginTop: 22,
    paddingVertical: 15,
  },
  doneText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
  pressed: {
    opacity: 0.72,
    transform: [{ scale: 0.98 }],
  },
});
