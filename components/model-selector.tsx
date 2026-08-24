import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import type { AccountMode } from "@/lib/account";
import { alsiModels, type AlsiModelId } from "@/lib/models";

type ModelSelectorProps = {
  accountMode: AccountMode;
  onSelectModel: (modelId: AlsiModelId) => void;
  selectedModelId: AlsiModelId;
};

export function ModelSelector({ accountMode, onSelectModel, selectedModelId }: ModelSelectorProps) {
  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>AI MODEL</Text>
        <Text style={styles.accessLabel}>{accountMode === "guest" ? "Guest: Lite only" : "All models unlocked"}</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent} horizontal showsHorizontalScrollIndicator={false}>
        {alsiModels.map((model) => {
          const isSelected = model.id === selectedModelId;
          const isLocked = accountMode === "guest" && model.id !== "lite";
          return (
            <Pressable
              key={model.id}
              accessibilityHint={isLocked ? "Tap to learn how to unlock this model." : "Double tap to select this model."}
              accessibilityLabel={`${isLocked ? "Locked " : ""}${model.label}, ${model.tokenCost} tokens per message`}
              accessibilityState={{ selected: isSelected }}
              onPress={() => onSelectModel(model.id)}
              style={({ pressed }) => [styles.option, isSelected && styles.optionSelected, isLocked && styles.optionLocked, pressed && styles.pressed]}
            >
              <View style={styles.optionTopRow}>
                <Text numberOfLines={1} style={[styles.optionName, isSelected && styles.optionNameSelected, isLocked && styles.optionNameLocked]}>
                  {model.label}
                </Text>
                {isLocked ? <MaterialCommunityIcons color="#A39F99" name="lock-outline" size={14} /> : null}
              </View>
              <Text numberOfLines={1} style={[styles.optionDescription, isSelected && styles.optionDescriptionSelected]}>{model.description}</Text>
              <View style={[styles.costPill, isSelected && styles.costPillSelected]}>
                <MaterialCommunityIcons color={isSelected ? "#FFFFFF" : "#B4443C"} name="lightning-bolt-outline" size={12} />
                <Text style={[styles.costText, isSelected && styles.costTextSelected]}>{model.tokenCost} token{model.tokenCost === 1 ? "" : "s"}</Text>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: "#F7F7F5", paddingHorizontal: 14, paddingTop: 7 },
  labelRow: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", marginBottom: 7, paddingHorizontal: 3 },
  label: { color: "#7D7974", fontSize: 10, fontWeight: "800", letterSpacing: 0.9 },
  accessLabel: { color: "#A04D46", fontSize: 10, fontWeight: "700" },
  scrollContent: { gap: 8, paddingRight: 10 },
  option: { backgroundColor: "#FFFFFF", borderColor: "#E2DFDA", borderRadius: 14, borderWidth: 1, minHeight: 78, padding: 10, width: 152 },
  optionSelected: { backgroundColor: "#1A1A18", borderColor: "#1A1A18" },
  optionLocked: { backgroundColor: "#F0EFEC", borderColor: "#E4E1DC" },
  optionTopRow: { alignItems: "center", flexDirection: "row", gap: 5, justifyContent: "space-between" },
  optionName: { color: "#34332F", flex: 1, fontSize: 12, fontWeight: "800" },
  optionNameSelected: { color: "#FFFFFF" },
  optionNameLocked: { color: "#87837E" },
  optionDescription: { color: "#88847E", fontSize: 10, marginTop: 4 },
  optionDescriptionSelected: { color: "#D4D1CC" },
  costPill: { alignItems: "center", alignSelf: "flex-start", backgroundColor: "#FFF0EE", borderRadius: 8, flexDirection: "row", gap: 3, marginTop: 8, paddingHorizontal: 6, paddingVertical: 3 },
  costPillSelected: { backgroundColor: "#B5443D" },
  costText: { color: "#A93D35", fontSize: 9, fontWeight: "800" },
  costTextSelected: { color: "#FFFFFF" },
  pressed: { opacity: 0.76, transform: [{ scale: 0.98 }] },
});
