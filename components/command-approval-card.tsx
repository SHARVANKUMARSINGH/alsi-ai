import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import * as Clipboard from "expo-clipboard";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

type CommandApprovalCardProps = {
  commands: string[];
};

export function CommandApprovalCard({ commands }: CommandApprovalCardProps) {
  const [approved, setApproved] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState<string | null>(null);

  const approveAndCopy = async (command: string) => {
    if (!approved[command]) setApproved((previous) => ({ ...previous, [command]: true }));
    await Clipboard.setStringAsync(command);
    setCopied(command);
    setTimeout(() => setCopied((current) => (current === command ? null : current)), 1800);
  };

  return (
    <View style={styles.card}>
      <View style={styles.titleRow}>
        <View style={styles.icon}><MaterialCommunityIcons color="#FFFFFF" name="shield-check-outline" size={16} /></View>
        <View style={styles.titleCopy}>
          <Text style={styles.title}>Review commands</Text>
          <Text style={styles.subtitle}>Approve each command before copying it to Termux.</Text>
        </View>
      </View>
      {commands.map((command, index) => {
        const isApproved = approved[command] === true;
        const isCopied = copied === command;
        return (
          <View key={`${index}-${command}`} style={styles.commandRow}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.commandScroller}>
              <Text selectable style={styles.command}>{command}</Text>
            </ScrollView>
            <Pressable
              accessibilityLabel={`${isApproved ? "Copy approved" : "Approve"} command ${index + 1}`}
              onPress={() => { void approveAndCopy(command); }}
              style={({ pressed }) => [styles.action, isApproved && styles.actionApproved, pressed && styles.pressed]}
            >
              <MaterialCommunityIcons color={isApproved ? "#2767B5" : "#FFFFFF"} name={isCopied ? "check" : isApproved ? "content-copy" : "shield-check"} size={14} />
              <Text style={[styles.actionText, isApproved && styles.actionTextApproved]}>{isCopied ? "Copied" : isApproved ? "Copy approved" : "Approve & copy"}</Text>
            </Pressable>
          </View>
        );
      })}
      <Text style={styles.footer}>Copying never runs a command. Paste and run it yourself only after checking it.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: "#EFF6FF", borderColor: "#C5DCF9", borderRadius: 14, borderWidth: 1, marginTop: 13, padding: 10 },
  titleRow: { alignItems: "center", flexDirection: "row", marginBottom: 9 },
  icon: { alignItems: "center", backgroundColor: "#3976C8", borderRadius: 11, height: 27, justifyContent: "center", width: 27 },
  titleCopy: { flex: 1, marginLeft: 8 },
  title: { color: "#244D7E", fontSize: 12, fontWeight: "800" },
  subtitle: { color: "#5C7EA4", fontSize: 9, marginTop: 2 },
  commandRow: { backgroundColor: "#FFFFFF", borderColor: "#D7E5F8", borderRadius: 10, borderWidth: 1, marginTop: 7, overflow: "hidden" },
  commandScroller: { maxHeight: 31, paddingHorizontal: 8, paddingTop: 7 },
  command: { color: "#263341", fontFamily: "monospace", fontSize: 11, lineHeight: 15 },
  action: { alignItems: "center", alignSelf: "flex-end", backgroundColor: "#3976C8", borderRadius: 8, flexDirection: "row", gap: 5, margin: 6, paddingHorizontal: 8, paddingVertical: 6 },
  actionApproved: { backgroundColor: "#E3F0FF" },
  actionText: { color: "#FFFFFF", fontSize: 10, fontWeight: "800" },
  actionTextApproved: { color: "#2767B5" },
  footer: { color: "#5C7EA4", fontSize: 9, lineHeight: 13, marginTop: 9 },
  pressed: { opacity: 0.74, transform: [{ scale: 0.98 }] },
});
