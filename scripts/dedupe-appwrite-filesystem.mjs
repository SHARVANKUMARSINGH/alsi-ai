import { existsSync, rmSync } from "node:fs";
import { join } from "node:path";

const rootDirectory = process.cwd();
const rootFileSystem = join(rootDirectory, "node_modules", "expo-file-system");
const nestedFileSystem = join(
  rootDirectory,
  "node_modules",
  "react-native-appwrite",
  "node_modules",
  "expo-file-system",
);

if (!existsSync(rootFileSystem) || !existsSync(nestedFileSystem)) {
  process.exit(0);
}

rmSync(nestedFileSystem, { force: true, recursive: true });
console.log("Deduplicated Appwrite's legacy expo-file-system dependency for Expo SDK 54.");
