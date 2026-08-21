import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";

type LoginScreenProps = {
  onContinueAsGuest: () => void;
  onLogin: (identifier: string) => void;
};

export function LoginScreen({ onContinueAsGuest, onLogin }: LoginScreenProps) {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showMissingFields, setShowMissingFields] = useState(false);

  const submitLogin = () => {
    if (!identifier.trim() || !password.trim()) {
      setShowMissingFields(true);
      return;
    }
    onLogin(identifier.trim());
  };

  return (
    <ScreenContainer edges={["top", "bottom", "left", "right"]} containerClassName="bg-background">
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.flex}>
        <View style={styles.content}>
          <View style={styles.hero}>
            <View style={styles.mark}>
              <Text style={styles.markText}>A</Text>
            </View>
            <Text style={styles.eyebrow}>WELCOME TO ALSI AI</Text>
            <Text style={styles.title}>Your thinking space, ready when you are.</Text>
            <Text style={styles.subtitle}>Log in to unlock the full model suite and receive renewed tokens every four hours.</Text>
          </View>

          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Continue your work</Text>
            <Text style={styles.formBody}>A simple local sign-in keeps your account mode and token balance on this device.</Text>

            <Text style={styles.label}>USERNAME OR EMAIL</Text>
            <View style={styles.inputShell}>
              <MaterialCommunityIcons color="#797773" name="account-outline" size={19} />
              <TextInput
                autoCapitalize="none"
                autoCorrect={false}
                onChangeText={(value) => { setIdentifier(value); setShowMissingFields(false); }}
                placeholder="you@example.com"
                placeholderTextColor="#A5A29E"
                style={styles.input}
                textContentType="username"
                value={identifier}
              />
            </View>

            <Text style={styles.label}>PASSWORD</Text>
            <View style={styles.inputShell}>
              <MaterialCommunityIcons color="#797773" name="lock-outline" size={19} />
              <TextInput
                onChangeText={(value) => { setPassword(value); setShowMissingFields(false); }}
                onSubmitEditing={submitLogin}
                placeholder="Enter password"
                placeholderTextColor="#A5A29E"
                returnKeyType="go"
                secureTextEntry
                style={styles.input}
                textContentType="password"
                value={password}
              />
            </View>
            {showMissingFields ? <Text style={styles.validation}>Enter both a username or email and password to continue.</Text> : null}

            <Pressable onPress={submitLogin} style={({ pressed }) => [styles.loginButton, pressed && styles.pressed]}>
              <Text style={styles.loginButtonText}>Log in</Text>
              <MaterialCommunityIcons color="#FFFFFF" name="arrow-right" size={18} />
            </Pressable>

            <View style={styles.dividerRow}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.divider} />
            </View>

            <Pressable onPress={onContinueAsGuest} style={({ pressed }) => [styles.guestButton, pressed && styles.pressed]}>
              <MaterialCommunityIcons color="#B4443C" name="account-arrow-right-outline" size={19} />
              <Text style={styles.guestButtonText}>Skip Login (Continue as Guest)</Text>
            </Pressable>
            <Text style={styles.guestNote}>Guest access includes 30 one-time tokens and Notern Code Mini.</Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { flex: 1, justifyContent: "center", paddingHorizontal: 22, paddingVertical: 24 },
  hero: { alignItems: "center", marginBottom: 28 },
  mark: { alignItems: "center", backgroundColor: "#171716", borderRadius: 19, height: 58, justifyContent: "center", marginBottom: 17, width: 58 },
  markText: { color: "#FFFFFF", fontSize: 28, fontWeight: "800", letterSpacing: -1 },
  eyebrow: { color: "#B4443C", fontSize: 10, fontWeight: "800", letterSpacing: 1.2, marginBottom: 9 },
  title: { color: "#1D1C1A", fontSize: 27, fontWeight: "800", letterSpacing: -0.7, lineHeight: 33, maxWidth: 340, textAlign: "center" },
  subtitle: { color: "#77746F", fontSize: 13, lineHeight: 19, marginTop: 11, maxWidth: 340, textAlign: "center" },
  formCard: { backgroundColor: "#FFFFFF", borderColor: "#E5E2DD", borderRadius: 23, borderWidth: 1, padding: 18 },
  formTitle: { color: "#292825", fontSize: 18, fontWeight: "800" },
  formBody: { color: "#7C7974", fontSize: 12, lineHeight: 17, marginBottom: 20, marginTop: 5 },
  label: { color: "#77746F", fontSize: 10, fontWeight: "800", letterSpacing: 0.85, marginBottom: 7 },
  inputShell: { alignItems: "center", backgroundColor: "#F8F7F5", borderColor: "#E4E1DC", borderRadius: 13, borderWidth: 1, flexDirection: "row", marginBottom: 15, paddingHorizontal: 12 },
  input: { color: "#252421", flex: 1, fontSize: 15, minHeight: 47, paddingLeft: 9 },
  validation: { color: "#C1544C", fontSize: 11, lineHeight: 16, marginBottom: 10, marginTop: -7 },
  loginButton: { alignItems: "center", backgroundColor: "#171716", borderRadius: 14, flexDirection: "row", gap: 8, justifyContent: "center", marginTop: 3, paddingVertical: 14 },
  loginButtonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "800" },
  dividerRow: { alignItems: "center", flexDirection: "row", gap: 10, marginVertical: 17 },
  divider: { backgroundColor: "#ECE9E4", flex: 1, height: 1 },
  dividerText: { color: "#A19E99", fontSize: 10, fontWeight: "800" },
  guestButton: { alignItems: "center", backgroundColor: "#FFF1EE", borderColor: "#F6CBC5", borderRadius: 14, borderWidth: 1, flexDirection: "row", gap: 8, justifyContent: "center", paddingVertical: 13 },
  guestButtonText: { color: "#A93D35", fontSize: 13, fontWeight: "800" },
  guestNote: { color: "#97938E", fontSize: 10, lineHeight: 14, marginTop: 10, textAlign: "center" },
  pressed: { opacity: 0.76, transform: [{ scale: 0.98 }] },
});
