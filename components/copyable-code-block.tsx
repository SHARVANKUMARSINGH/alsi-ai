import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import * as Clipboard from "expo-clipboard";
import { useCallback, useEffect, useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

type CopyableCodeBlockProps = {
  code: string;
  language: string;
  showCopyButton: boolean;
};

type CopyState = "idle" | "copied" | "failed";

export { getCodeLanguageLabel } from "@/lib/code-language";

export function CopyableCodeBlock({ code, language, showCopyButton }: CopyableCodeBlockProps) {
  const [copyState, setCopyState] = useState<CopyState>("idle");
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (resetTimer.current) clearTimeout(resetTimer.current);
  }, []);

  const copyCode = useCallback(async () => {
    try {
      await Clipboard.setStringAsync(code);
      setCopyState("copied");
    } catch {
      setCopyState("failed");
    }

    if (resetTimer.current) clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(() => setCopyState("idle"), 2_000);
  }, [code]);

  const copyLabel = copyState === "copied" ? "Copied! ✓" : copyState === "failed" ? "Try again" : "Copy";

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text numberOfLines={1} style={styles.language}>{language}</Text>
        {showCopyButton ? (
          <Pressable
            accessibilityLabel={`Copy ${language} code`}
            accessibilityRole="button"
            onPress={copyCode}
            style={({ pressed }) => [styles.copyButton, copyState === "copied" && styles.copyButtonCopied, pressed && styles.pressed]}
          >
            <MaterialCommunityIcons color={copyState === "copied" ? "#B8F5D0" : "#E2E2E2"} name={copyState === "copied" ? "check" : "content-copy"} size={13} />
            <Text style={[styles.copyLabel, copyState === "copied" && styles.copyLabelCopied]}>{copyLabel}</Text>
          </Pressable>
        ) : null}
      </View>
      <ScrollView horizontal contentContainerStyle={styles.codeContent} showsHorizontalScrollIndicator={false} style={styles.codeScroller}>
        <Text selectable style={styles.code}>{code}</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#1E1E1E",
    borderColor: "#303030",
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
    marginTop: 10,
    overflow: "hidden",
  },
  header: {
    alignItems: "center",
    backgroundColor: "#252526",
    borderBottomColor: "#353535",
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 36,
    paddingHorizontal: 11,
  },
  language: {
    color: "#ADADAD",
    fontFamily: "monospace",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.2,
    textTransform: "lowercase",
  },
  copyButton: {
    alignItems: "center",
    backgroundColor: "#353535",
    borderRadius: 8,
    flexDirection: "row",
    gap: 5,
    minHeight: 25,
    paddingHorizontal: 8,
  },
  copyButtonCopied: {
    backgroundColor: "#1B4931",
  },
  copyLabel: {
    color: "#E2E2E2",
    fontSize: 11,
    fontWeight: "800",
  },
  copyLabelCopied: {
    color: "#B8F5D0",
  },
  codeScroller: {
    maxHeight: 292,
  },
  codeContent: {
    padding: 13,
  },
  code: {
    color: "#D4D4D4",
    fontFamily: "monospace",
    fontSize: 13,
    lineHeight: 20,
  },
  pressed: {
    opacity: 0.78,
  },
});
