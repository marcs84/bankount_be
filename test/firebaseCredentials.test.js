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

const conFile = (contenuto, prova) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "bankount-sa-"));
  const file = path.join(dir, "service-account.json");
  fs.writeFileSync(file, contenuto);
  try {
    return prova(file);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
};

test("reads the service account from the path in GOOGLE_APPLICATION_CREDENTIALS", () => {
  conFile(JSON.stringify(SERVICE_ACCOUNT), (file) => {
    assert.deepEqual(loadServiceAccount({ GOOGLE_APPLICATION_CREDENTIALS: file }), SERVICE_ACCOUNT);
  });
});

test("ignores the spaces around the path", () => {
  conFile(JSON.stringify(SERVICE_ACCOUNT), (file) => {
    assert.deepEqual(loadServiceAccount({ GOOGLE_APPLICATION_CREDENTIALS: `  ${file}  ` }), SERVICE_ACCOUNT);
  });
});

test("fails loudly when no credential source is configured", () => {
  assert.throws(() => loadServiceAccount({}), /set GOOGLE_APPLICATION_CREDENTIALS/);
  assert.throws(() => loadServiceAccount({ GOOGLE_APPLICATION_CREDENTIALS: "   " }), /set GOOGLE_APPLICATION_CREDENTIALS/);
});

test("says which file it could not read", () => {
  assert.throws(
    () => loadServiceAccount({ GOOGLE_APPLICATION_CREDENTIALS: "/percorso/inesistente/sa.json" }),
    /not readable at \/percorso\/inesistente\/sa\.json/
  );
});

test("says when the file is not the credential it expects", () => {
  conFile("questo non e' json", (file) => {
    assert.throws(() => loadServiceAccount({ GOOGLE_APPLICATION_CREDENTIALS: file }), /not valid JSON/);
  });
});

test("no longer accepts the credential inlined in the environment", () => {
  const env = { FIREBASE_SERVICE_ACCOUNT: JSON.stringify(SERVICE_ACCOUNT) };

  assert.throws(
    () => loadServiceAccount(env),
    /set GOOGLE_APPLICATION_CREDENTIALS/,
    "una chiave privata non deve stare in una variabile d'ambiente"
  );
});
