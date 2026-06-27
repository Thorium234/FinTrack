import test from "node:test";
import assert from "node:assert/strict";
import { generateToken, verifyToken } from "../src/utils/jwt.js";

process.env.JWT_SECRET = "unit-test-secret";
process.env.JWT_EXPIRES_IN = "1h";

test("JWT round-trips user claims", () => {
  const token = generateToken({ userId: 7, email: "test@example.com" });
  const decoded = verifyToken(token);

  assert.equal(decoded.userId, 7);
  assert.equal(decoded.email, "test@example.com");
});
