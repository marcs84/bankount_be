const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const { loadServiceAccount } = require("../Helpers/firebaseCredentials");

const SERVICE_ACCOUNT = {
  type: "service_account",
  project_id: "example-project",
  private_key: "-----BEGIN PRIVATE KEY-----\nstub\n-----END PRIVATE KEY-----\n",
  client_email: "sa@example-project.iam.gserviceaccount.com",
};

test("reads the service account from raw JSON in the environment", () => {
  const env = { FIREBASE_SERVICE_ACCOUNT: JSON.stringify(SERVICE_ACCOUNT) };

  assert.deepEqual(loadServiceAccount(env), SERVICE_ACCOUNT);
});

test("reads the service account from a base64 environment value", () => {
  const env = {
    FIREBASE_SERVICE_ACCOUNT: Buffer.from(JSON.stringify(SERVICE_ACCOUNT)).toString("base64"),
  };

  assert.deepEqual(loadServiceAccount(env), SERVICE_ACCOUNT);
});

test("reads the service account from the path in GOOGLE_APPLICATION_CREDENTIALS", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "bankount-sa-"));
  const file = path.join(dir, "service-account.json");
  fs.writeFileSync(file, JSON.stringify(SERVICE_ACCOUNT));

  try {
    assert.deepEqual(loadServiceAccount({ GOOGLE_APPLICATION_CREDENTIALS: file }), SERVICE_ACCOUNT);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("prefers the environment value over the credentials file path", () => {
  const env = {
    FIREBASE_SERVICE_ACCOUNT: JSON.stringify(SERVICE_ACCOUNT),
    GOOGLE_APPLICATION_CREDENTIALS: "/nonexistent/service-account.json",
  };

  assert.deepEqual(loadServiceAccount(env), SERVICE_ACCOUNT);
});

test("fails loudly when no credential source is configured", () => {
  assert.throws(() => loadServiceAccount({}), /Firebase credentials not configured/);
});
