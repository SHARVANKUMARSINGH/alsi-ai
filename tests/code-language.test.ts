import { describe, expect, it } from "vitest";

import { getCodeLanguageLabel } from "../lib/code-language";

describe("fenced code language labels", () => {
  it("normalizes common fenced-code aliases for the code-block header", () => {
    expect(getCodeLanguageLabel("js")).toBe("javascript");
    expect(getCodeLanguageLabel("py highlight")).toBe("python");
    expect(getCodeLanguageLabel("typescript")).toBe("typescript");
  });

  it("uses a neutral text label when a fence has no language annotation", () => {
    expect(getCodeLanguageLabel()).toBe("text");
  });
});
