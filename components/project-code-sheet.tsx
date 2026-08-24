import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useEffect, useMemo, useState } from "react";
import { Alert, Linking, Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { CopyableCodeBlock } from "@/components/copyable-code-block";
import type { GeneratedProjectFile } from "@/lib/chat";

type ProjectCodeSheetProps = {
  visible: boolean;
  files: GeneratedProjectFile[];
  projectName: string;
  onClose: () => void;
  onPublishToGitHub: () => void;
};

export function ProjectCodeSheet({ visible, files, projectName, onClose, onPublishToGitHub }: ProjectCodeSheetProps) {
  const [selectedPath, setSelectedPath] = useState("");
  const [exportApproved, setExportApproved] = useState(false);
  const [exportNotice, setExportNotice] = useState("");

  useEffect(() => {
    if (visible) setSelectedPath((current) => files.some((file) => file.path === current) ? current : (files[0]?.path ?? ""));
  }, [files, visible]);

  const selectedFile = useMemo(() => files.find((file) => file.path === selectedPath) ?? files[0], [files, selectedPath]);

  const clearExportState = () => {
    setExportApproved(false);
    setExportNotice("Temporary export authorization cleared. ALSI Ai stores no Expo token.");
  };

  const openExpoHandoff = async () => {
    if (!exportApproved) {
      Alert.alert("Approval required", "Review the project files, then confirm that you want to continue in your own Expo account.");
      return;
    }

    try {
      setExportNotice("Opening Expo so you can sign in and export from your own account…");
      await Linking.openURL("https://expo.dev");
    } catch {
      setExportNotice("Expo could not be opened here. Visit expo.dev in your browser when you are ready.");
    } finally {
      clearExportState();
    }
  };

  return (
    <Modal animationType="slide" onRequestClose={onClose} transparent visible={visible}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <View>
              <Text style={styles.eyebrow}>GENERATED PROJECT</Text>
              <Text numberOfLines={1} style={styles.title}>{projectName}</Text>
            </View>
            <Pressable accessibilityLabel="Close code workspace" onPress={onClose} style={({ pressed }) => [styles.close, pressed && styles.pressed]}>
              <MaterialCommunityIcons color="#474642" name="close" size={20} />
            </Pressable>
          </View>

          <Text style={styles.description}>Review every generated file before you create or export the project.</Text>
          <ScrollView contentContainerStyle={styles.fileList} horizontal showsHorizontalScrollIndicator={false}>
            {files.map((file) => {
              const active = file.path === selectedFile?.path;
              return (
                <Pressable key={file.path} onPress={() => setSelectedPath(file.path)} style={({ pressed }) => [styles.fileTab, active && styles.fileTabActive, pressed && styles.pressed]}>
                  <MaterialCommunityIcons color={active ? "#FFFFFF" : "#726F69"} name="file-code-outline" size={15} />
                  <Text numberOfLines={1} style={[styles.fileTabText, active && styles.fileTabTextActive]}>{file.path}</Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {selectedFile ? (
            <ScrollView contentContainerStyle={styles.codeArea} showsVerticalScrollIndicator={false}>
              <CopyableCodeBlock code={selectedFile.content} language={selectedFile.language} showCopyButton />
            </ScrollView>
          ) : <Text style={styles.empty}>No generated files are available yet.</Text>}

          <View style={styles.exportCard}>
            <View style={styles.exportHeading}>
              <MaterialCommunityIcons color="#2A6EDB" name="shield-check-outline" size={20} />
              <Text style={styles.exportTitle}>Expo export handoff</Text>
            </View>
            <Text style={styles.exportBody}>ALSI Ai never accepts, displays, or stores an Expo/EAS token. You export only from your own approved Expo account.</Text>
            <Pressable onPress={() => setExportApproved((current) => !current)} style={({ pressed }) => [styles.approval, exportApproved && styles.approvalActive, pressed && styles.pressed]}>
              <MaterialCommunityIcons color={exportApproved ? "#2A6EDB" : "#77746E"} name={exportApproved ? "checkbox-marked" : "checkbox-blank-outline"} size={20} />
              <Text style={styles.approvalText}>I reviewed these files and want to continue in my Expo account.</Text>
            </Pressable>
            <View style={styles.exportActions}>
              <Pressable onPress={openExpoHandoff} style={({ pressed }) => [styles.exportButton, !exportApproved && styles.exportButtonDisabled, pressed && styles.pressed]}>
                <MaterialCommunityIcons color="#FFFFFF" name="open-in-new" size={16} />
                <Text style={styles.exportButtonText}>Open Expo export</Text>
              </Pressable>
              <Pressable onPress={clearExportState} style={({ pressed }) => [styles.clearButton, pressed && styles.pressed]}>
                <Text style={styles.clearButtonText}>Clear export state</Text>
              </Pressable>
            </View>
            <Pressable onPress={onPublishToGitHub} style={({ pressed }) => [styles.githubButton, pressed && styles.pressed]}>
              <MaterialCommunityIcons color="#FFFFFF" name="github" size={16} />
              <Text style={styles.githubButtonText}>Publish reviewed files to GitHub</Text>
            </Pressable>
            {exportNotice ? <Text style={styles.exportNotice}>{exportNotice}</Text> : null}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { backgroundColor: "rgba(0,0,0,0.46)", flex: 1, justifyContent: "flex-end" },
  sheet: { backgroundColor: "#FBFAF8", borderTopLeftRadius: 28, borderTopRightRadius: 28, maxHeight: "93%", minHeight: "78%", paddingBottom: 20, paddingHorizontal: 18 },
  handle: { alignSelf: "center", backgroundColor: "#D7D4CF", borderRadius: 4, height: 4, marginBottom: 13, marginTop: 10, width: 42 },
  header: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  eyebrow: { color: "#B34740", fontSize: 10, fontWeight: "900", letterSpacing: 1.15 },
  title: { color: "#1B1B1A", fontSize: 20, fontWeight: "800", marginTop: 3, maxWidth: 270 },
  close: { alignItems: "center", backgroundColor: "#EEECE8", borderRadius: 18, height: 36, justifyContent: "center", width: 36 },
  description: { color: "#6D6A65", fontSize: 13, lineHeight: 19, marginTop: 8 },
  fileList: { gap: 8, paddingBottom: 13, paddingTop: 15 },
  fileTab: { alignItems: "center", backgroundColor: "#EEECE8", borderRadius: 11, flexDirection: "row", gap: 6, maxWidth: 160, paddingHorizontal: 11, paddingVertical: 9 },
  fileTabActive: { backgroundColor: "#1B1B1A" },
  fileTabText: { color: "#625F5A", fontFamily: "monospace", fontSize: 12, fontWeight: "700", maxWidth: 115 },
  fileTabTextActive: { color: "#FFFFFF" },
  codeArea: { paddingBottom: 12 },
  empty: { color: "#8D8982", fontSize: 14, marginVertical: 28, textAlign: "center" },
  exportCard: { backgroundColor: "#F1F6FF", borderColor: "#C9D9F4", borderRadius: 16, borderWidth: 1, marginTop: 4, padding: 14 },
  exportHeading: { alignItems: "center", flexDirection: "row", gap: 7 },
  exportTitle: { color: "#194C9B", fontSize: 15, fontWeight: "800" },
  exportBody: { color: "#49658C", fontSize: 12, lineHeight: 17, marginTop: 7 },
  approval: { alignItems: "flex-start", flexDirection: "row", gap: 8, marginTop: 12 },
  approvalActive: { opacity: 1 },
  approvalText: { color: "#335B93", flex: 1, fontSize: 12, fontWeight: "600", lineHeight: 17 },
  exportActions: { flexDirection: "row", gap: 8, marginTop: 13 },
  exportButton: { alignItems: "center", backgroundColor: "#2A6EDB", borderRadius: 10, flex: 1, flexDirection: "row", gap: 6, justifyContent: "center", paddingVertical: 10 },
  exportButtonDisabled: { opacity: 0.58 },
  exportButtonText: { color: "#FFFFFF", fontSize: 12, fontWeight: "800" },
  clearButton: { alignItems: "center", borderColor: "#9DB8E5", borderRadius: 10, borderWidth: 1, justifyContent: "center", paddingHorizontal: 10 },
  clearButtonText: { color: "#285B9B", fontSize: 12, fontWeight: "800" },
  exportNotice: { color: "#426896", fontSize: 11, lineHeight: 15, marginTop: 10 },
  githubButton: { alignItems: "center", backgroundColor: "#242423", borderRadius: 10, flexDirection: "row", gap: 7, justifyContent: "center", marginTop: 10, paddingVertical: 10 },
  githubButtonText: { color: "#FFFFFF", fontSize: 12, fontWeight: "800" },
  pressed: { opacity: 0.75, transform: [{ scale: 0.98 }] },
});
