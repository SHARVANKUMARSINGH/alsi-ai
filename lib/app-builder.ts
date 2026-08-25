import type { ChatSettings } from "@/lib/chat";
import type { AlsiModelId } from "@/lib/models";

export const APP_BUILDER_TOKEN_COST = 40;
export const APP_BUILDER_ALPHA_LABEL = "ALPHA";

export type GeneratedProjectFile = {
  path: string;
  language: string;
  content: string;
};

export function canUseAppBuilder(_modelId: AlsiModelId, settings: ChatSettings) {
  return settings.mode === "thinking";
}

export function canOpenConfirmedAppBuilder(_modelId: AlsiModelId, settings: ChatSettings, acknowledged: boolean) {
  return canUseAppBuilder(_modelId, settings) && acknowledged;
}

export function getAppBuilderRequirementMessage(_modelId: AlsiModelId, settings: ChatSettings) {
  if (settings.mode !== "thinking") return "Choose Thinking mode to unlock App Builder Alpha.";
  return "App Builder Alpha is ready.";
}

export function buildAppBuilderPrompt(appIdea: string) {
  const cleanIdea = appIdea.trim();

  return `You are ALSI Ai App Builder Alpha. Create a clear, practical Expo React Native project blueprint for this idea:

${cleanIdea}

Your output is a guide only. You cannot download Termux, create folders on the user's phone, run device commands, access an Expo account or EAS token, choose an account, start an EAS build, watch a cloud build, browse YouTube, or work in the background. Never claim that any of those actions happened.

Use this exact structure:
1. **App concept** — name, key screens, and a concise feature list.
2. **Project structure** — a small folder tree for an Expo app.
3. **Build steps** — safe copy-paste commands under the heading "Run these yourself in Termux or on a computer". Use fenced bash blocks, place one command per line, explain each command, and do not include credentials or destructive commands. Every command must wait for the user's individual review and approval; you cannot execute it.
4. **Starter implementation** — the most important Expo files with focused TypeScript examples.
5. **Optional icon** — explicitly say "Optional: add an app icon" and describe where to place it and how to reference it in app.config.ts.
6. **EAS handoff** — explain that the user must sign in to their own Expo account and use their own EAS credentials or a repository secret. Do not ask them to paste a token into chat, do not select an account, and do not promise an APK.
7. **Manual verification checklist** — include how the user can run the app locally and confirm the build.
8. **Complete starter files** — include a small runnable Expo starter set using this exact marker before each fenced code block: \`### FILE: relative/path\`. At minimum provide \`package.json\`, \`app.json\`, and \`App.tsx\`. The full source must be readable and must not contain any credentials.

Prioritize a compact, runnable Expo project. Mark assumptions clearly and offer no hidden automation.`;
}

export function extractCommandProposals(content: string) {
  const blocks = [...content.matchAll(/```(?:bash|sh|shell|termux)?\s*\n([\s\S]*?)```/gi)];
  const candidates = blocks.flatMap((block) => block[1].split("\n"));

  return [...new Set(candidates
    .map((line) => line.trim())
    .filter((line) => Boolean(line) && !line.startsWith("#") && !line.startsWith("//")))]
    .slice(0, 12);
}

function toProjectName(appIdea: string) {
  const words = appIdea
    .replace(/[^a-zA-Z0-9\s-]/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 4);
  return words.join(" ") || "My Expo Project";
}

function toProjectSlug(projectName: string) {
  return projectName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "my-expo-project";
}

export function createStarterProjectFiles(appIdea: string): GeneratedProjectFile[] {
  const name = toProjectName(appIdea);
  const slug = toProjectSlug(name);

  return [
    {
      path: "package.json",
      language: "json",
      content: JSON.stringify({ name: slug, version: "1.0.0", main: "expo-router/entry", scripts: { start: "expo start", android: "expo start --android", ios: "expo start --ios" }, dependencies: { expo: "~54.0.0", react: "19.1.0", "react-native": "0.81.5" }, private: true }, null, 2),
    },
    {
      path: "app.json",
      language: "json",
      content: JSON.stringify({ expo: { name, slug, version: "1.0.0", orientation: "portrait", userInterfaceStyle: "automatic" } }, null, 2),
    },
    {
      path: "App.tsx",
      language: "tsx",
      content: `import { useState } from "react";\nimport { Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from "react-native";\n\nexport default function App() {\n  const [item, setItem] = useState("");\n  const [items, setItems] = useState<string[]>([]);\n\n  const addItem = () => {\n    const next = item.trim();\n    if (!next) return;\n    setItems((current) => [...current, next]);\n    setItem("");\n  };\n\n  return (\n    <SafeAreaView style={styles.screen}>\n      <View style={styles.card}>\n        <Text style={styles.eyebrow}>EXPO STARTER</Text>\n        <Text style={styles.title}>${name}</Text>\n        <Text style={styles.subtitle}>A small working starter generated by ALSI Ai.</Text>\n        <View style={styles.row}>\n          <TextInput value={item} onChangeText={setItem} onSubmitEditing={addItem} placeholder="Add an item" style={styles.input} />\n          <Pressable onPress={addItem} style={styles.button}><Text style={styles.buttonText}>Add</Text></Pressable>\n        </View>\n        {items.length === 0 ? <Text style={styles.empty}>Your items will appear here.</Text> : items.map((value, index) => <Text key={\`${"${index}"}-\${value}\`} style={styles.item}>• {value}</Text>)}\n      </View>\n    </SafeAreaView>\n  );\n}\n\nconst styles = StyleSheet.create({\n  screen: { flex: 1, backgroundColor: "#10100F", justifyContent: "center", padding: 24 },\n  card: { backgroundColor: "#FFFFFF", borderRadius: 24, padding: 20 },\n  eyebrow: { color: "#FF5A4F", fontSize: 11, fontWeight: "800", letterSpacing: 1 },\n  title: { color: "#1B1B1A", fontSize: 29, fontWeight: "800", marginTop: 8 },\n  subtitle: { color: "#777674", fontSize: 14, lineHeight: 20, marginTop: 6 },\n  row: { flexDirection: "row", gap: 8, marginTop: 22 },\n  input: { borderColor: "#E2DFD9", borderWidth: 1, borderRadius: 12, flex: 1, paddingHorizontal: 12, paddingVertical: 10 },\n  button: { alignItems: "center", backgroundColor: "#1B1B1A", borderRadius: 12, justifyContent: "center", paddingHorizontal: 16 },\n  buttonText: { color: "#FFFFFF", fontWeight: "800" },\n  empty: { color: "#9B9893", marginTop: 20 },\n  item: { color: "#383836", fontSize: 15, marginTop: 12 },\n});`,
    },
  ];
}

export function extractProjectFiles(content: string): GeneratedProjectFile[] {
  const files = [...content.matchAll(/### FILE:\s*`?([^`\n]+)`?\s*\n```([^\n]*)\n([\s\S]*?)```/gi)]
    .map((match) => ({ path: match[1].trim().replace(/^\.\//, ""), language: match[2].trim() || "text", content: match[3].replace(/\n$/, "") }))
    .filter((file) => file.path && !file.path.includes(".."));

  return files.length > 0 ? files.slice(0, 20) : [];
}

export function createCompleteProjectFiles(appIdea: string, content: string) {
  const generated = extractProjectFiles(content);
  const fallback = createStarterProjectFiles(appIdea);
  const generatedPaths = new Set(generated.map((file) => file.path));
  return [...generated, ...fallback.filter((file) => !generatedPaths.has(file.path))];
}
