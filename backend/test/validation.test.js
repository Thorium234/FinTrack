import test from "node:test";
import assert from "node:assert/strict";
import {
  normalizeOptionalText,
  normalizePassword,
  normalizeRequiredText,
  parseMonth,
  parsePositiveNumber
} from "../src/utils/validation.js";

test("normalizeRequiredText trims and validates strings", () => {
  assert.equal(normalizeRequiredText("  FinTrack  ", "Name"), "FinTrack");
  assert.throws(() => normalizeRequiredText("", "Name"), /Name is required/);
  assert.throws(() => normalizeRequiredText(12, "Name"), /Name must be a string/);
});

test("normalizeOptionalText handles empty and missing values", () => {
  assert.equal(normalizeOptionalText(undefined, "Notes"), undefined);
  assert.equal(normalizeOptionalText(null, "Notes"), undefined);
  assert.equal(normalizeOptionalText("  hello  ", "Notes"), "hello");
  assert.equal(normalizeOptionalText("   ", "Notes"), null);
});

test("normalizePassword validates string passwords", () => {
  assert.equal(normalizePassword("secret"), "secret");
  assert.throws(() => normalizePassword(""), /Password is required/);
  assert.throws(() => normalizePassword(123), /Password must be a string/);
});

test("parseMonth defaults and validates YYYY-MM", () => {
  assert.match(parseMonth(), /^\d{4}-\d{2}$/);
  assert.equal(parseMonth("2026-06"), "2026-06");
  assert.throws(() => parseMonth("06-2026"), /Month must use YYYY-MM format/);
});

test("parsePositiveNumber validates numeric values", () => {
  assert.equal(parsePositiveNumber("12.50", "Amount"), 12.5);
  assert.throws(() => parsePositiveNumber(0, "Amount"), /Amount must be a positive number/);
  assert.throws(() => parsePositiveNumber("abc", "Amount"), /Amount must be a positive number/);
});
