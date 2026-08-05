const test = require("node:test");
const assert = require("node:assert/strict");

const { assertEnv, findMissing, REQUIRED_VARS, HTTPS_VARS } = require("../src/config/env");

function completeEnv(overrides = {}) {
  const env = {};
  for (const name of REQUIRED_VARS) {
    env[name] = `value-${name}`;
  }
  return Object.assign(env, overrides);
}

test("accepts an environment with every required variable set", () => {
  assert.doesNotThrow(() => assertEnv(completeEnv()));
});

test("reports every missing variable at once", () => {
  const env = completeEnv();
  delete env.JWT_SECRET;
  delete env.DB_PASSWORD;

  assert.deepEqual(findMissing(env).sort(), ["DB_PASSWORD", "JWT_SECRET"]);
});

test("treats blank and whitespace-only values as missing", () => {
  assert.deepEqual(findMissing(completeEnv({ SECRET_APP: "" })), ["SECRET_APP"]);
  assert.deepEqual(findMissing(completeEnv({ SECRET_APP: "   " })), ["SECRET_APP"]);
});

test("throws listing the missing variables", () => {
  const env = completeEnv();
  delete env.JWT_SECRET;

  assert.throws(() => assertEnv(env), /Missing required environment variables: JWT_SECRET/);
});

test("requires the TLS material only when HTTPS is enabled", () => {
  assert.deepEqual(findMissing(completeEnv({ HTTPS: "false" })), []);
  assert.deepEqual(findMissing(completeEnv({ HTTPS: "true" })).sort(), [...HTTPS_VARS].sort());

  const withTls = completeEnv({
    HTTPS: "true",
    HTTPS_PRIVATEKEY: "/run/secrets/key.pem",
    HTTPS_CERTIFICATE: "/run/secrets/cert.pem",
  });
  assert.deepEqual(findMissing(withTls), []);
});
