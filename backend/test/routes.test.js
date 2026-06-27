import test from "node:test";
import assert from "node:assert/strict";

function routeSignature(router) {
  return router.stack
    .filter((layer) => layer.route)
    .flatMap((layer) =>
      Object.keys(layer.route.methods).map((method) => `${method.toUpperCase()} ${layer.route.path}`)
    )
    .sort();
}

test("auth routes expose the expected contract", async () => {
  const { default: router } = await import("../src/routes/auth.routes.js");

  assert.deepEqual(routeSignature(router), ["GET /profile", "POST /login", "POST /register"]);
});

test("category routes expose CRUD endpoints", async () => {
  const { default: router } = await import("../src/routes/category.routes.js");

  assert.deepEqual(routeSignature(router), [
    "DELETE /:id",
    "GET /",
    "GET /:id",
    "POST /",
    "PUT /:id"
  ]);
});

test("transaction routes expose summary and CRUD endpoints", async () => {
  const { default: router } = await import("../src/routes/transaction.routes.js");

  assert.deepEqual(routeSignature(router), [
    "DELETE /:id",
    "GET /",
    "GET /:id",
    "GET /summary",
    "POST /",
    "PUT /:id"
  ]);
});

test("budget routes expose summary and CRUD endpoints", async () => {
  const { default: router } = await import("../src/routes/budget.routes.js");

  assert.deepEqual(routeSignature(router), [
    "DELETE /:id",
    "GET /",
    "GET /:id",
    "GET /summary",
    "POST /",
    "PUT /:id"
  ]);
});

test("dashboard routes expose summary endpoint", async () => {
  const { default: router } = await import("../src/routes/dashboard.routes.js");

  assert.deepEqual(routeSignature(router), ["GET /summary"]);
});
