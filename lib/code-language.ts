export function getCodeLanguageLabel(sourceInfo?: string) {
  const rawLanguage = sourceInfo?.trim().split(/\s+/)[0]?.toLowerCase() ?? "";
  const aliases: Record<string, string> = {
    js: "javascript",
    jsx: "javascript",
    ts: "typescript",
    tsx: "typescript",
    py: "python",
    rb: "ruby",
    sh: "shell",
    shell: "shell",
    yml: "yaml",
    md: "markdown",
  };

  return (aliases[rawLanguage] ?? rawLanguage) || "text";
}
