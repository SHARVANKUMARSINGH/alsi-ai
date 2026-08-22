import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { requestAppwriteOtp, type AppwriteAuthIntent, verifyAppwriteOtp } from "@/lib/appwrite-account";

type LoginScreenProps = {
  onContinueAsGuest: () => void;
  onLogin: (email: string, intent: AppwriteAuthIntent) => Promise<void>;
};

type AuthChoice = "verify" | "guest";

export function LoginScreen({ onContinueAsGuest, onLogin }: LoginScreenProps) {
  const [choice, setChoice] = useState<AuthChoice>("verify");
  const [authIntent, setAuthIntent] = useState<AppwriteAuthIntent>("signUp");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [otpEmail, setOtpEmail] = useState<string | null>(null);
  const [otpUserId, setOtpUserId] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const chooseGuest = () => {
    setChoice("guest");
    setError(null);
  };

  const chooseVerify = () => {
    setChoice("verify");
    setError(null);
  };

  const sendOtp = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
      setError("Enter a valid email address to receive a login code.");
      return;
    }

    setIsSending(true);
    setError(null);
    try {
      const token = await requestAppwriteOtp(normalizedEmail, authIntent);
      setOtpEmail(normalizedEmail);
      setOtpUserId(token.userId);
      setCode("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "We could not send the verification code. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  const verifyOtp = async () => {
    if (!otpEmail || !otpUserId) return;
    if (code.length !== 6) {
      setError("Enter the six-digit code from your email.");
      return;
    }

    setIsVerifying(true);
    setError(null);
    try {
      await verifyAppwriteOtp(otpUserId, code);
      await onLogin(otpEmail, authIntent);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "We could not finish signing you in. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const isOtpStep = Boolean(otpEmail);
  const isSignIn = authIntent === "signIn";
  const toggleAuthIntent = () => {
    setAuthIntent((previous) => previous === "signIn" ? "signUp" : "signIn");
    setOtpEmail(null);
    setOtpUserId(null);
    setCode("");
    setError(null);
  };

  return (
    <ScreenContainer edges={["top", "bottom", "left", "right"]} containerClassName="bg-background">
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.flex}>
        <View style={styles.content}>
          <View style={styles.hero}>
            <View style={styles.mark}><Text style={styles.markText}>A</Text></View>
            <Text style={styles.eyebrow}>ALSI AI ACCESS</Text>
            <View style={styles.choiceRow}>
              <Pressable
                accessibilityRole="tab"
                accessibilityState={{ selected: choice === "verify" }}
                onPress={chooseVerify}
                style={({ pressed }) => [styles.choiceButton, choice === "verify" && styles.choiceButtonActive, pressed && styles.pressed]}
              >
                <MaterialCommunityIcons color={choice === "verify" ? "#FFFFFF" : "#3F3E3A"} name="email-check-outline" size={18} />
                <Text style={[styles.choiceText, choice === "verify" && styles.choiceTextActive]}>Verify your Email</Text>
              </Pressable>
              <Pressable
                accessibilityRole="tab"
                accessibilityState={{ selected: choice === "guest" }}
                onPress={chooseGuest}
                style={({ pressed }) => [styles.choiceButton, choice === "guest" && styles.choiceButtonActive, pressed && styles.pressed]}
              >
                <MaterialCommunityIcons color={choice === "guest" ? "#FFFFFF" : "#3F3E3A"} name="account-outline" size={18} />
                <Text style={[styles.choiceText, choice === "guest" && styles.choiceTextActive]}>Skip (Guest Mode)</Text>
              </Pressable>
            </View>
            <Text style={styles.subtitle}>
              {choice === "guest"
                ? "Start with 30 one-time ALSI Lite tokens. Guest tokens do not renew."
                : "Verify once to unlock all models and 100 tokens that renew every four hours."}
            </Text>
          </View>

          {choice === "guest" ? (
            <View style={styles.formCard}>
              <Text style={styles.formTitle}>Explore as a guest</Text>
              <Text style={styles.formBody}>You can start chatting now. Log in later from the conversation menu to keep using the full model suite.</Text>
              <Pressable onPress={onContinueAsGuest} style={({ pressed }) => [styles.guestButton, pressed && styles.pressed]}>
                <MaterialCommunityIcons color="#FFFFFF" name="arrow-right" size={19} />
                <Text style={styles.guestButtonText}>Continue as Guest</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.formCard}>
              {!isOtpStep ? (
                <>
                  <Text style={styles.formTitle}>{isSignIn ? "Sign in to your account" : "Create your account"}</Text>
                  <Text style={styles.formBody}>{isSignIn ? "Use your email OTP to restore your saved token balance." : "Verify your email to create an account with 100 renewable tokens."}</Text>
                  <Text style={styles.label}>EMAIL ADDRESS</Text>
                  <View style={styles.inputShell}>
                    <MaterialCommunityIcons color="#797773" name="email-outline" size={19} />
                    <TextInput
                      autoCapitalize="none"
                      autoCorrect={false}
                      keyboardType="email-address"
                      onChangeText={(value) => { setEmail(value); setError(null); }}
                      onSubmitEditing={sendOtp}
                      placeholder="you@example.com"
                      placeholderTextColor="#A5A29E"
                      returnKeyType="send"
                      style={styles.input}
                      textContentType="emailAddress"
                      value={email}
                    />
                  </View>
                  {error ? <Text style={styles.validation}>{error}</Text> : null}
                  <Pressable disabled={isSending} onPress={sendOtp} style={({ pressed }) => [styles.loginButton, isSending && styles.disabled, pressed && styles.pressed]}>
                    <Text style={styles.loginButtonText}>{isSending ? "Sending code..." : isSignIn ? "Send sign-in OTP" : "Send sign-up OTP"}</Text>
                    <MaterialCommunityIcons color="#FFFFFF" name="email-fast-outline" size={18} />
                  </Pressable>
                  <Pressable onPress={toggleAuthIntent} style={({ pressed }) => [styles.authSwitchButton, pressed && styles.pressed]}>
                    <Text style={styles.authSwitchText}>{isSignIn ? "New to ALSI Ai? Sign up" : "Already have an account? Sign in"}</Text>
                  </Pressable>
                </>
              ) : (
                <>
                  <Text style={styles.formTitle}>Check your inbox</Text>
                  <Text style={styles.formBody}>Enter the six-digit Appwrite code sent to {otpEmail} to {isSignIn ? "restore your account" : "create your account"}.</Text>
                  <Text style={styles.label}>ONE-TIME CODE</Text>
                  <View style={styles.inputShell}>
                    <MaterialCommunityIcons color="#797773" name="shield-key-outline" size={19} />
                    <TextInput
                      autoCapitalize="none"
                      autoCorrect={false}
                      keyboardType="number-pad"
                      maxLength={6}
                      onChangeText={(value) => { setCode(value.replace(/\D/g, "")); setError(null); }}
                      onSubmitEditing={verifyOtp}
                      placeholder="000000"
                      placeholderTextColor="#A5A29E"
                      returnKeyType="go"
                      style={styles.codeInput}
                      textContentType="oneTimeCode"
                      value={code}
                    />
                  </View>
                  {error ? <Text style={styles.validation}>{error}</Text> : null}
                  <Pressable disabled={isVerifying || code.length !== 6} onPress={verifyOtp} style={({ pressed }) => [styles.loginButton, (isVerifying || code.length !== 6) && styles.disabled, pressed && styles.pressed]}>
                    <Text style={styles.loginButtonText}>{isVerifying ? "Verifying..." : "Verify & continue"}</Text>
                    <MaterialCommunityIcons color="#FFFFFF" name="arrow-right" size={18} />
                  </Pressable>
                  <Pressable disabled={isSending} onPress={sendOtp} style={({ pressed }) => [styles.resendButton, pressed && styles.pressed]}>
                    <MaterialCommunityIcons color="#A93D35" name="refresh" size={16} />
                    <Text style={styles.resendText}>{isSending ? "Sending..." : "Resend code"}</Text>
                  </Pressable>
                  <Pressable onPress={() => { setOtpEmail(null); setOtpUserId(null); setCode(""); setError(null); }} style={({ pressed }) => [styles.changeEmailButton, pressed && styles.pressed]}>
                    <Text style={styles.changeEmailText}>Use a different email</Text>
                  </Pressable>
                </>
              )}
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { flex: 1, justifyContent: "center", paddingHorizontal: 22, paddingVertical: 24 },
  hero: { alignItems: "center", marginBottom: 26 },
  mark: { alignItems: "center", backgroundColor: "#171716", borderRadius: 19, height: 58, justifyContent: "center", marginBottom: 14, width: 58 },
  markText: { color: "#FFFFFF", fontSize: 28, fontWeight: "800", letterSpacing: -1 },
  eyebrow: { color: "#B4443C", fontSize: 10, fontWeight: "800", letterSpacing: 1.2, marginBottom: 13 },
  choiceRow: { alignSelf: "stretch", flexDirection: "row", gap: 9 },
  choiceButton: { alignItems: "center", backgroundColor: "#F0EEEA", borderColor: "#DEDCD7", borderRadius: 15, borderWidth: 1, flex: 1, gap: 7, justifyContent: "center", minHeight: 75, paddingHorizontal: 8, paddingVertical: 11 },
  choiceButtonActive: { backgroundColor: "#171716", borderColor: "#171716" },
  choiceText: { color: "#3F3E3A", fontSize: 12, fontWeight: "800", textAlign: "center" },
  choiceTextActive: { color: "#FFFFFF" },
  subtitle: { color: "#77746F", fontSize: 13, lineHeight: 19, marginTop: 13, maxWidth: 340, textAlign: "center" },
  formCard: { backgroundColor: "#FFFFFF", borderColor: "#E5E2DD", borderRadius: 23, borderWidth: 1, padding: 18 },
  formTitle: { color: "#292825", fontSize: 18, fontWeight: "800" },
  formBody: { color: "#7C7974", fontSize: 12, lineHeight: 17, marginBottom: 20, marginTop: 5 },
  label: { color: "#77746F", fontSize: 10, fontWeight: "800", letterSpacing: 0.85, marginBottom: 7 },
  inputShell: { alignItems: "center", backgroundColor: "#F8F7F5", borderColor: "#E4E1DC", borderRadius: 13, borderWidth: 1, flexDirection: "row", marginBottom: 15, paddingHorizontal: 12 },
  input: { color: "#252421", flex: 1, fontSize: 15, minHeight: 47, paddingLeft: 9 },
  codeInput: { color: "#252421", flex: 1, fontSize: 20, fontVariant: ["tabular-nums"], fontWeight: "800", letterSpacing: 8, minHeight: 52, paddingLeft: 10 },
  validation: { color: "#C1544C", fontSize: 11, lineHeight: 16, marginBottom: 10, marginTop: -7 },
  loginButton: { alignItems: "center", backgroundColor: "#171716", borderRadius: 14, flexDirection: "row", gap: 8, justifyContent: "center", marginTop: 3, paddingVertical: 14 },
  loginButtonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "800" },
  authSwitchButton: { alignItems: "center", marginTop: 15, paddingVertical: 4 },
  authSwitchText: { color: "#A93D35", fontSize: 12, fontWeight: "800" },
  guestButton: { alignItems: "center", backgroundColor: "#171716", borderRadius: 14, flexDirection: "row", gap: 8, justifyContent: "center", paddingVertical: 14 },
  guestButtonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "800" },
  disabled: { opacity: 0.48 },
  resendButton: { alignItems: "center", flexDirection: "row", gap: 6, justifyContent: "center", marginTop: 15 },
  resendText: { color: "#A93D35", fontSize: 12, fontWeight: "800" },
  changeEmailButton: { alignItems: "center", marginTop: 10 },
  changeEmailText: { color: "#797671", fontSize: 11, fontWeight: "700" },
  pressed: { opacity: 0.76, transform: [{ scale: 0.98 }] },
});
