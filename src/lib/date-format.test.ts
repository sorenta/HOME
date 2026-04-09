import { formatAppDate } from "./date-format";

describe("formatAppDate", () => {
  it("returns null for null input", () => {
    expect(formatAppDate(null)).toBeNull();
  });

  it("returns null for undefined input", () => {
    expect(formatAppDate(undefined)).toBeNull();
  });

  it("returns null for empty string", () => {
    expect(formatAppDate("")).toBeNull();
  });

  it("returns null for invalid date string", () => {
    expect(formatAppDate("not-a-date")).toBeNull();
  });

  it("formats ISO string in lv locale (DD.MM.YYYY)", () => {
    const result = formatAppDate("2026-04-07T00:00:00.000Z", "lv");
    expect(result).not.toBeNull();
    expect(result).toContain("04");
  });

  it("formats ISO string in en locale (MM/DD/YYYY)", () => {
    const result = formatAppDate("2026-04-07T00:00:00.000Z", "en");
    expect(result).not.toBeNull();
    expect(typeof result).toBe("string");
  });

  it("accepts a Date object directly", () => {
    const date = new Date("2026-01-15T12:00:00.000Z");
    const result = formatAppDate(date, "en");
    expect(result).not.toBeNull();
    expect(result).toContain("2026");
  });

  it("defaults to lv locale when none provided", () => {
    const withLv = formatAppDate("2026-04-07T00:00:00.000Z", "lv");
    const withDefault = formatAppDate("2026-04-07T00:00:00.000Z");
    expect(withLv).toBe(withDefault);
  });
});
