import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { sendLoginOtp } from "@/lib/emailjs";
import { generateOtp, isValidOtp } from "@/lib/otp";

type LoginScreenProps = {
  onContinueAsGuest: () => void;
  onLogin: (email: string) => Promise<void>;
};

type OtpState = {
  email: string;
  value: string;
  issuedAt: number;
};

export function LoginScreen({ onContinueAsGuest, onLogin }: LoginScreenProps) {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [otpState, setOtpState] = useState<OtpState | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendOtp = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
      setError("Enter a valid email address to receive a login code.");
      return;
    }

    setIsSending(true);
    setError(null);
    const otp = generateOtp();

    try {
      await sendLoginOtp(normalizedEmail, otp);
      setOtpState({ email: normalizedEmail, value: otp, issuedAt: Date.now() });
      setCode("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "We could not send the verification code. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  const verifyOtp = async () => {
    if (!otpState) return;
    if (!isValidOtp(code, otpState.value, otpState.issuedAt)) {
      setError("That code is incorrect or expired. Request a new code and try again.");
      return;
    }

    setIsVerifying(true);
    setError(null);
    try {
      await onLogin(otpState.email);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "We could not finish signing you in. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const isOtpStep = Boolean(otpState);

  return (
    <ScreenContainer edges={["top", "bottom", "left", "right"]} containerClassName="bg-background">
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.flex}>
        <View style={styles.content}>
          <View style={styles.hero}>
            <View style={styles.mark}>
              <Text style={styles.markText}>A</Text>
            </View>
            <Text style={styles.eyebrow}>{isOtpStep ? "VERIFY YOUR EMAIL" : "WELCOME TO ALSI AI"}</Text>
            <Text style={styles.title}>{isOtpStep ? "Enter your six-digit code." : "Your thinking space, ready when you are."}</Text>
            <Text style={styles.subtitle}>
              {isOtpStep
                ? `We sent a code to ${otpState?.email}. It expires in 10 minutes.`
                : "Verify your email to unlock the full model suite and receive renewed tokens every four hours."}
            </Text>
          </View>

          <View style={styles.formCard}>
            {!isOtpStep ? (
              <>
                <Text style={styles.formTitle}>Continue with your email</Text>
                <Text style={styles.formBody}>We will send a one-time verification code instead of asking for a password.</Text>
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
                  <Text style={styles.loginButtonText}>{isSending ? "Sending code..." : "Send OTP"}</Text>
                  <MaterialCommunityIcons color="#FFFFFF" name="email-fast-outline" size={18} />
                </Pressable>
              </>
            ) : (
              <>
                <Text style={styles.formTitle}>Check your inbox</Text>
                <Text style={styles.formBody}>Enter the verification code sent to {otpState?.email}.</Text>
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
                <Pressable onPress={() => { setOtpState(null); setCode(""); setError(null); }} style={({ pressed }) => [styles.changeEmailButton, pressed && styles.pressed]}>
                  <Text style={styles.changeEmailText}>Use a different email</Text>
                </Pressable>
              </>
            )}

            <View style={styles.dividerRow}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.divider} />
            </View>

            <Pressable onPress={onContinueAsGuest} style={({ pressed }) => [styles.guestButton, pressed && styles.pressed]}>
              <MaterialCommunityIcons color="#B4443C" name="account-arrow-right-outline" size={19} />
              <Text style={styles.guestButtonText}>Skip Login (Continue as Guest)</Text>
            </Pressable>
            <Text style={styles.guestNote}>Guest access includes 30 one-time tokens and ALSI Lite.</Text>
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
  codeInput: { color: "#252421", flex: 1, fontSize: 20, fontVariant: ["tabular-nums"], fontWeight: "800", letterSpacing: 8, minHeight: 52, paddingLeft: 10 },
  validation: { color: "#C1544C", fontSize: 11, lineHeight: 16, marginBottom: 10, marginTop: -7 },
  loginButton: { alignItems: "center", backgroundColor: "#171716", borderRadius: 14, flexDirection: "row", gap: 8, justifyContent: "center", marginTop: 3, paddingVertical: 14 },
  loginButtonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "800" },
  disabled: { opacity: 0.48 },
  resendButton: { alignItems: "center", flexDirection: "row", gap: 6, justifyContent: "center", marginTop: 15 },
  resendText: { color: "#A93D35", fontSize: 12, fontWeight: "800" },
  changeEmailButton: { alignItems: "center", marginTop: 10 },
  changeEmailText: { color: "#797671", fontSize: 11, fontWeight: "700" },
  dividerRow: { alignItems: "center", flexDirection: "row", gap: 10, marginVertical: 17 },
  divider: { backgroundColor: "#ECE9E4", flex: 1, height: 1 },
  dividerText: { color: "#A19E99", fontSize: 10, fontWeight: "800" },
  guestButton: { alignItems: "center", backgroundColor: "#FFF1EE", borderColor: "#F6CBC5", borderRadius: 14, borderWidth: 1, flexDirection: "row", gap: 8, justifyContent: "center", paddingVertical: 13 },
  guestButtonText: { color: "#A93D35", fontSize: 13, fontWeight: "800" },
  guestNote: { color: "#97938E", fontSize: 10, lineHeight: 14, marginTop: 10, textAlign: "center" },
  pressed: { opacity: 0.76, transform: [{ scale: 0.98 }] },
});
