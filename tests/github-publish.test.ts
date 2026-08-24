import { describe, expect, it } from "vitest";

import { encodeUtf8Base64, toRepositorySlug } from "../lib/github-publish";

describe("GitHub publishing helpers", () => {
  it("normalizes user-facing project names into safe repository names", () => {
    expect(toRepositorySlug("Water Reminder: React Native!")).toBe("water-reminder-react-native");
    expect(toRepositorySlug("  ___  ")).toBe("___");
    expect(toRepositorySlug("")).toBe("alsi-generated-app");
  });

  it("encodes Unicode generated source without requiring a browser or persisted credential", () => {
    expect(encodeUtf8Base64("const title = 'ALSI ✓';")).toBe("Y29uc3QgdGl0bGUgPSAnQUxTSSDinJMnOw==");
  });
});
