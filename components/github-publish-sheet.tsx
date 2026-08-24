import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { OAuthProvider } from "react-native-appwrite";
import { useEffect, useMemo, useState } from "react";
import { Alert, Modal, Pressable, StyleSheet, Switch, Text, TextInput, View } from "react-native";

import type { GeneratedProjectFile } from "@/lib/chat";
import { publishGeneratedProject, toRepositorySlug } from "@/lib/github-publish";
import { appwriteAccount } from "@/lib/appwrite";

type GitHubPublishSheetProps = {
  files: GeneratedProjectFile[];
  projectName: string;
  visible: boolean;
  onClose: () => void;
};

export function GitHubPublishSheet({ files, projectName, visible, onClose }: GitHubPublishSheetProps) {
  const initialName = useMemo(() => toRepositorySlug(projectName), [projectName]);
  const [repositoryName, setRepositoryName] = useState(initialName);
  const [isPrivate, setIsPrivate] = useState(true);
  const [approved, setApproved] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (visible) {
      setRepositoryName(initialName);
      setApproved(false);
      setStatus("");
    }
  }, [initialName, visible]);

  const clearAuthorizationState = () => {
    setApproved(false);
    setIsPublishing(false);
  };

  const publish = async () => {
    if (!approved || isPublishing) {
      Alert.alert("Approval required", "Confirm that you want to authorize GitHub and create this repository before continuing.");
      return;
    }

    const name = toRepositorySlug(repositoryName);
    if (!name) {
      Alert.alert("Repository name needed", "Enter a repository name before publishing.");
      return;
    }

    let providerAccessToken = "";
    setIsPublishing(true);
    try {
      const redirectUrl = Linking.createURL("github-publish");
      const authorizationUrl = appwriteAccount.createOAuth2Session({
        provider: OAuthProvider.Github,
        success: redirectUrl,
        failure: redirectUrl,
        scopes: ["repo"],
      });
      if (!authorizationUrl) throw new Error("GitHub authorization could not be started.");

      setStatus("Waiting for GitHub approval…");
      const result = await WebBrowser.openAuthSessionAsync(authorizationUrl.toString(), redirectUrl);
      if (result.type !== "success") throw new Error("GitHub authorization was cancelled or did not finish.");

      const session = await appwriteAccount.getSession("current");
      providerAccessToken = session.providerAccessToken;
      if (session.provider !== "github" || !providerAccessToken) {
        throw new Error("GitHub authorization was not available. Enable the GitHub provider in Appwrite, then try again.");
      }

      const repository = await publishGeneratedProject(providerAccessToken, { name, isPrivate, files }, setStatus);
      setStatus(`Published to ${repository.owner}/${repository.name}.`);
      Alert.alert("Repository created", `Your generated React Native project is now in ${repository.owner}/${repository.name}.`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "GitHub publishing could not be completed.");
    } finally {
      providerAccessToken = "";
      clearAuthorizationState();
    }
  };

  return (
    <Modal animationType="slide" onRequestClose={onClose} transparent visible={visible}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <View>
              <Text style={styles.eyebrow}>GITHUB PUBLISH</Text>
              <Text style={styles.title}>Create your repository</Text>
            </View>
            <Pressable accessibilityLabel="Close GitHub publishing" onPress={onClose} style={({ pressed }) => [styles.close, pressed && styles.pressed]}>
              <MaterialCommunityIcons color="#474642" name="close" size={20} />
            </Pressable>
          </View>
          <Text style={styles.description}>GitHub opens in a secure browser. ALSI Ai uses the approved authorization only while uploading these {files.length} generated files and never saves a personal access token.</Text>
          <Text style={styles.label}>REPOSITORY NAME</Text>
          <TextInput autoCapitalize="none" autoCorrect={false} onChangeText={setRepositoryName} placeholder="my-react-native-project" style={styles.input} value={repositoryName} />
          <View style={styles.privateRow}>
            <View style={styles.privateCopy}>
              <Text style={styles.privateTitle}>Private repository</Text>
              <Text style={styles.privateBody}>Recommended while you review generated code.</Text>
            </View>
            <Switch onValueChange={setIsPrivate} trackColor={{ false: "#CCC8C1", true: "#AAC9F7" }} value={isPrivate} />
          </View>
          <Pressable onPress={() => setApproved((value) => !value)} style={({ pressed }) => [styles.approval, pressed && styles.pressed]}>
            <MaterialCommunityIcons color={approved ? "#235EBA" : "#77746E"} name={approved ? "checkbox-marked" : "checkbox-blank-outline"} size={22} />
            <Text style={styles.approvalText}>I approve opening GitHub and creating this {isPrivate ? "private" : "public"} repository with the reviewed files.</Text>
          </Pressable>
          <Pressable disabled={!approved || isPublishing} onPress={() => { void publish(); }} style={({ pressed }) => [styles.publishButton, (!approved || isPublishing) && styles.publishDisabled, pressed && styles.pressed]}>
            <MaterialCommunityIcons color="#FFFFFF" name={isPublishing ? "progress-clock" : "github"} size={18} />
            <Text style={styles.publishText}>{isPublishing ? "Publishing…" : "Connect GitHub & publish"}</Text>
          </Pressable>
          {status ? <Text style={styles.status}>{status}</Text> : null}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { backgroundColor: "rgba(0,0,0,0.46)", flex: 1, justifyContent: "flex-end" },
  sheet: { backgroundColor: "#FBFAF8", borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 18, paddingBottom: 30 },
  handle: { alignSelf: "center", backgroundColor: "#D7D4CF", borderRadius: 4, height: 4, marginBottom: 13, marginTop: -8, width: 42 },
  header: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  eyebrow: { color: "#B34740", fontSize: 10, fontWeight: "900", letterSpacing: 1.15 },
  title: { color: "#1B1B1A", fontSize: 21, fontWeight: "800", marginTop: 3 },
  close: { alignItems: "center", backgroundColor: "#EEECE8", borderRadius: 18, height: 36, justifyContent: "center", width: 36 },
  description: { color: "#6D6A65", fontSize: 13, lineHeight: 19, marginTop: 10 },
  label: { color: "#77736D", fontSize: 10, fontWeight: "900", letterSpacing: 0.9, marginLeft: 2, marginTop: 18 },
  input: { backgroundColor: "#FFFFFF", borderColor: "#DEDAD4", borderRadius: 12, borderWidth: 1, color: "#22211F", fontFamily: "monospace", fontSize: 15, marginTop: 7, paddingHorizontal: 12, paddingVertical: 12 },
  privateRow: { alignItems: "center", borderBottomColor: "#E5E1DA", borderBottomWidth: 1, flexDirection: "row", justifyContent: "space-between", marginTop: 15, paddingBottom: 15 },
  privateCopy: { flex: 1, paddingRight: 16 },
  privateTitle: { color: "#292825", fontSize: 14, fontWeight: "800" },
  privateBody: { color: "#77736D", fontSize: 12, lineHeight: 17, marginTop: 2 },
  approval: { alignItems: "flex-start", flexDirection: "row", gap: 8, marginTop: 16 },
  approvalText: { color: "#3B5D91", flex: 1, fontSize: 12, fontWeight: "600", lineHeight: 17 },
  publishButton: { alignItems: "center", backgroundColor: "#1B1B1A", borderRadius: 12, flexDirection: "row", gap: 8, justifyContent: "center", marginTop: 17, paddingVertical: 13 },
  publishDisabled: { opacity: 0.48 },
  publishText: { color: "#FFFFFF", fontSize: 14, fontWeight: "800" },
  status: { color: "#4B688F", fontSize: 12, lineHeight: 17, marginTop: 12, textAlign: "center" },
  pressed: { opacity: 0.75, transform: [{ scale: 0.98 }] },
});
