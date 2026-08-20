import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

import {
  aggressionLabels,
  aggressionTemperatures,
  getModeSummary,
  type AggressionLevel,
  type ChatMode,
  type ChatSettings,
} from "@/lib/chat";

type AiControlsSheetProps = {
  visible: boolean;
  settings: ChatSettings;
  onChange: (settings: ChatSettings) => void;
  onClose: () => void;
};

const modes: { id: ChatMode; label: string; icon: "message-processing-outline" | "head-snowflake-outline" }[] = [
  { id: "normal", label: "Normal", icon: "message-processing-outline" },
  { id: "thinking", label: "Thinking", icon: "head-snowflake-outline" },
];

export function AiControlsSheet({ visible, settings, onChange, onClose }: AiControlsSheetProps) {
  const setMode = (mode: ChatMode) => onChange({ ...settings, mode });
  const setAggression = (aggression: AggressionLevel) => onChange({ ...settings, aggression });

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
