import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { appwriteAccount } from "@/lib/appwrite";
import { getAppwriteCallbackCredentials, getAppwriteCallbackError } from "@/lib/appwrite-callback";

export default function AppwriteLocalhostCallback() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    userId?: string | string[];
    secret?: string | string[];
    error?: string | string[];
    errorDescription?: string | string[];
    error_description?: string | string[];
  }>();
  const handled = useRef(false);
  const [status, setStatus] = useState<"processing" | "error">("processing");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    const completeSession = async () => {
      const { userId, secret } = getAppwriteCallbackCredentials(params);
      const { code: providerError, description: providerErrorDescription } = getAppwriteCallbackError(params);

      if (providerError) {
        setStatus("error");
        setErrorMessage(providerErrorDescription || providerError || "Appwrite sign-in was not completed.");
        return;
      }

      if (!userId || !secret) {
        setStatus("error");
        setErrorMessage("The Appwrite callback did not include the required userId and secret.");
        return;
      }

      try {
        await appwriteAccount.createSession({ userId, secret });
        router.replace("/(tabs)");
      } catch (error) {
        setStatus("error");
        setErrorMessage(error instanceof Error ? error.message : "Unable to complete Appwrite sign-in.");
      }
    };

    void completeSession();
  }, [params.error, params.errorDescription, params.error_description, params.secret, params.userId, router]);

  return (
    <SafeAreaView className="flex-1" edges={["top", "bottom", "left", "right"]}>
      <View className="flex-1 items-center justify-center gap-4 bg-background p-6">
        {status === "processing" ? (
          <>
            <ActivityIndicator size="large" />
            <Text className="text-center text-base leading-6 text-foreground">
              Completing Google sign-in…
            </Text>
          </>
        ) : (
          <>
            <Text className="text-center text-xl font-bold leading-7 text-foreground">
              Sign-in could not be completed
            </Text>
            <Text className="text-center text-base leading-6 text-muted">{errorMessage}</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Return to ALSI Ai"
              onPress={() => router.replace("/(tabs)")}
              style={({ pressed }) => [
                {
                  minHeight: 48,
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 14,
                  backgroundColor: "#111111",
                  paddingHorizontal: 20,
                },
                pressed && { opacity: 0.8 },
              ]}
            >
              <Text className="font-semibold text-white">Return to ALSI Ai</Text>
            </Pressable>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}
