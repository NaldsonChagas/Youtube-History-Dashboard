import { describe, it, expect } from "vitest";
import { escapeHtml, formatDate } from "../src/lib/format";

describe("formatDate", () => {
  it("returns dash for null", () => {
    expect(formatDate(null)).toBe("–");
  });

  it("returns dash for undefined", () => {
    expect(formatDate(undefined)).toBe("–");
  });

  it("returns dash for empty string", () => {
    expect(formatDate("")).toBe("–");
  });

  it("formats valid ISO date string", () => {
    const result = formatDate("2024-06-15T14:30:00.000Z");
    expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    expect(result).toMatch(/\d{2}:\d{2}/);
  });

  it("formats with pt-BR locale", () => {
    const result = formatDate("2024-06-15T14:30:00.000Z", "pt-BR");
    expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    expect(result).toMatch(/\d{2}:\d{2}/);
    expect(result).toContain("2024");
  });

  it("formats with en-US locale", () => {
    const result = formatDate("2024-06-15T14:30:00.000Z", "en-US");
    expect(result).not.toBe("–");
    expect(result).toContain("2024");
  });
});

describe("escapeHtml", () => {
  it("escapes angle brackets", () => {
    expect(escapeHtml("<script>")).toBe("&lt;script&gt;");
  });

  it("returns empty string for empty input", () => {
    expect(escapeHtml("")).toBe("");
  });

  it("leaves safe text unchanged", () => {
    expect(escapeHtml("hello")).toBe("hello");
  });
});
