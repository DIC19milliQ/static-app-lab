import { describe, expect, it } from "vitest";
import { parseCsv, serializeJson, toCsv, validateJsonRecords } from "../src/data_helpers.js";

describe("data_helpers", () => {
  it("parses CSV into objects", () => {
    const csv = 'name,city\n"Jane, A.",Tokyo\nBob,"New\nYork"';
    const rows = parseCsv(csv);
    expect(rows).toEqual([
      { name: "Jane, A.", city: "Tokyo" },
      { name: "Bob", city: "New\nYork" },
    ]);
  });

  it("serializes CSV with escaping", () => {
    const rows = [{ name: 'A, "B"', city: "NY" }];
    const csv = toCsv(rows, ["name", "city"]);
    expect(csv).toBe('"A, ""B""",NY');
  });

  it("validates JSON arrays of objects", () => {
    expect(validateJsonRecords([{ id: 1 }, { name: "test" }])).toBe(true);
    expect(validateJsonRecords([{ id: 1 }, null])).toBe(false);
    expect(validateJsonRecords({ id: 1 })).toBe(false);
  });

  it("serializes JSON with pretty formatting", () => {
    const json = serializeJson([{ id: 1 }]);
    expect(json).toBe('[\n  {\n    "id": 1\n  }\n]');
  });
});
