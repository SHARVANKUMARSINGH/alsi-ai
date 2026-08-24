import type { GeneratedProjectFile } from "@/lib/chat";

const GITHUB_API = "https://api.github.com";

export type PublishedGitHubRepository = {
  owner: string;
  name: string;
  htmlUrl: string;
};

export function toRepositorySlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100) || "alsi-generated-app";
}

export function encodeUtf8Base64(value: string) {
  const bytes = new TextEncoder().encode(value);
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  let encoded = "";

  for (let index = 0; index < bytes.length; index += 3) {
    const first = bytes[index];
    const second = bytes[index + 1];
    const third = bytes[index + 2];
    const combined = (first << 16) | ((second ?? 0) << 8) | (third ?? 0);
    encoded += alphabet[(combined >> 18) & 63];
    encoded += alphabet[(combined >> 12) & 63];
    encoded += typeof second === "number" ? alphabet[(combined >> 6) & 63] : "=";
    encoded += typeof third === "number" ? alphabet[combined & 63] : "=";
  }

  return encoded;
}

async function githubJson<T>(token: string, path: string, init?: RequestInit) {
  const response = await fetch(`${GITHUB_API}${path}`, {
    ...init,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`GitHub publishing failed (${response.status}): ${body.slice(0, 180) || "Unknown error"}`);
  }

  return response.json() as Promise<T>;
}

export async function publishGeneratedProject(
  token: string,
  input: { name: string; isPrivate: boolean; files: GeneratedProjectFile[]; description?: string },
  onProgress?: (message: string) => void,
): Promise<PublishedGitHubRepository> {
  const name = toRepositorySlug(input.name);
  onProgress?.("Creating your GitHub repository…");
  const repository = await githubJson<{ name: string; html_url: string; owner: { login: string } }>(token, "/user/repos", {
    method: "POST",
    body: JSON.stringify({
      name,
      private: input.isPrivate,
      description: input.description ?? "React Native project generated with ALSI Ai App Builder",
      auto_init: false,
    }),
  });

  for (const [index, file] of input.files.entries()) {
    onProgress?.(`Uploading ${index + 1} of ${input.files.length}: ${file.path}`);
    await githubJson(token, `/repos/${repository.owner.login}/${repository.name}/contents/${encodeURIComponent(file.path).replace(/%2F/g, "/")}`, {
      method: "PUT",
      body: JSON.stringify({
        message: `Add ${file.path}`,
        content: encodeUtf8Base64(file.content),
      }),
    });
  }

  return { owner: repository.owner.login, name: repository.name, htmlUrl: repository.html_url };
}
