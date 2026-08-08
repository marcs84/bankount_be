const test = require("node:test");
const assert = require("node:assert/strict");
const crypto = require("crypto");

const { verifySignature, webhookVerifier, captureRawBody } = require("../src/server/webhookAuth");

const SECRET = "shared-secret-for-tests";
const BODY = Buffer.from(JSON.stringify({ txId: "0xabc", amount: "1.5" }));

const sign = (secret, body, enc = "hex", alg = "sha256") =>
  crypto.createHmac(alg, secret).update(body).digest(enc);

function fakeRes() {
  return {
    statusCode: null,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };
}

function run(verifier, req) {
  const res = fakeRes();
  let passed = false;
  verifier({ headers: {}, socket: {}, ...req }, res, () => {
    passed = true;
  });
  return { res, passed };
}

const savedEnv = { ...process.env };
test.afterEach(() => {
  for (const k of ["WH_SECRET", "WH_HEADER", "WH_ALG"]) delete process.env[k];
  Object.assign(process.env, savedEnv);
});

test("accepts a hex signature computed over the raw body", () => {
  assert.equal(verifySignature({ secret: SECRET, rawBody: BODY, signature: sign(SECRET, BODY) }), true);
});

test("accepts a base64 signature, as some providers encode it that way", () => {
  assert.equal(verifySignature({ secret: SECRET, rawBody: BODY, signature: sign(SECRET, BODY, "base64") }), true);
});

test("accepts a signature carrying the algorithm prefix", () => {
  const prefixed = `sha256=${sign(SECRET, BODY)}`;

  assert.equal(verifySignature({ secret: SECRET, rawBody: BODY, signature: prefixed }), true);
});

test("rejects a signature computed with another secret", () => {
  assert.equal(verifySignature({ secret: SECRET, rawBody: BODY, signature: sign("altro", BODY) }), false);
});

test("rejects a signature that does not match the body", () => {
  const tampered = Buffer.from(JSON.stringify({ txId: "0xabc", amount: "999" }));

  assert.equal(verifySignature({ secret: SECRET, rawBody: tampered, signature: sign(SECRET, BODY) }), false);
});

test("rejects when signature, body or secret are missing", () => {
  assert.equal(verifySignature({ secret: SECRET, rawBody: BODY, signature: "" }), false);
  assert.equal(verifySignature({ secret: SECRET, rawBody: null, signature: sign(SECRET, BODY) }), false);
  assert.equal(verifySignature({ secret: "", rawBody: BODY, signature: sign(SECRET, BODY) }), false);
});

test("supports a different digest algorithm", () => {
  const sig = sign(SECRET, BODY, "hex", "sha512");

  assert.equal(verifySignature({ secret: SECRET, rawBody: BODY, signature: sig, algorithm: "sha512" }), true);
  assert.equal(verifySignature({ secret: SECRET, rawBody: BODY, signature: sig }), false);
});

test("closes the route when no secret is configured", () => {
  process.env.WH_HEADER = "x-signature";
  const verifier = webhookVerifier({ name: "test", secretVar: "WH_SECRET", headerVar: "WH_HEADER", algorithmVar: "WH_ALG" });

  const { res, passed } = run(verifier, { rawBody: BODY, headers: { "x-signature": sign(SECRET, BODY) } });

  assert.equal(passed, false, "non deve raggiungere il controller");
  assert.equal(res.statusCode, 503);
});

test("rejects an unsigned request with 401", () => {
  process.env.WH_SECRET = SECRET;
  process.env.WH_HEADER = "x-signature";
  const verifier = webhookVerifier({ name: "test", secretVar: "WH_SECRET", headerVar: "WH_HEADER", algorithmVar: "WH_ALG" });

  const { res, passed } = run(verifier, { rawBody: BODY, headers: {} });

  assert.equal(passed, false);
  assert.equal(res.statusCode, 401);
});

test("rejects a forged payload with 401", () => {
  process.env.WH_SECRET = SECRET;
  process.env.WH_HEADER = "x-signature";
  const verifier = webhookVerifier({ name: "test", secretVar: "WH_SECRET", headerVar: "WH_HEADER", algorithmVar: "WH_ALG" });

  const forged = Buffer.from(JSON.stringify({ txId: "0xabc", amount: "1000000" }));
  const { res, passed } = run(verifier, { rawBody: forged, headers: { "x-signature": sign(SECRET, BODY) } });

  assert.equal(passed, false);
  assert.equal(res.statusCode, 401);
});

test("lets a correctly signed request through", () => {
  process.env.WH_SECRET = SECRET;
  process.env.WH_HEADER = "x-signature";
  const verifier = webhookVerifier({ name: "test", secretVar: "WH_SECRET", headerVar: "WH_HEADER", algorithmVar: "WH_ALG" });

  const { res, passed } = run(verifier, { rawBody: BODY, headers: { "x-signature": sign(SECRET, BODY) } });

  assert.equal(passed, true);
  assert.equal(res.statusCode, null);
});

test("captures the raw body for later verification", () => {
  const req = {};
  captureRawBody(req, {}, BODY);

  assert.equal(req.rawBody, BODY);
});
