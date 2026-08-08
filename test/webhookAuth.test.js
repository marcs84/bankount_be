const test = require("node:test");
const assert = require("node:assert/strict");
const crypto = require("crypto");

const { verifySignature, verifyToken, webhookVerifier, captureRawBody } = require("../src/server/webhookAuth");

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
  for (const k of ["WH_SECRET", "WH_HEADER", "WH_ALG", "WH_TOKEN_HEADER"]) delete process.env[k];
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
  const verifier = webhookVerifier({ name: "test", secretVar: "WH_SECRET", headerVar: "WH_HEADER", algorithmVar: "WH_ALG", tokenHeaderVar: "WH_TOKEN_HEADER" });

  const { res, passed } = run(verifier, { rawBody: BODY, headers: { "x-signature": sign(SECRET, BODY) } });

  assert.equal(passed, false, "non deve raggiungere il controller");
  assert.equal(res.statusCode, 503);
});

test("rejects an unsigned request with 401", () => {
  process.env.WH_SECRET = SECRET;
  process.env.WH_HEADER = "x-signature";
  const verifier = webhookVerifier({ name: "test", secretVar: "WH_SECRET", headerVar: "WH_HEADER", algorithmVar: "WH_ALG", tokenHeaderVar: "WH_TOKEN_HEADER" });

  const { res, passed } = run(verifier, { rawBody: BODY, headers: {} });

  assert.equal(passed, false);
  assert.equal(res.statusCode, 401);
});

test("rejects a forged payload with 401", () => {
  process.env.WH_SECRET = SECRET;
  process.env.WH_HEADER = "x-signature";
  const verifier = webhookVerifier({ name: "test", secretVar: "WH_SECRET", headerVar: "WH_HEADER", algorithmVar: "WH_ALG", tokenHeaderVar: "WH_TOKEN_HEADER" });

  const forged = Buffer.from(JSON.stringify({ txId: "0xabc", amount: "1000000" }));
  const { res, passed } = run(verifier, { rawBody: forged, headers: { "x-signature": sign(SECRET, BODY) } });

  assert.equal(passed, false);
  assert.equal(res.statusCode, 401);
});

test("lets a correctly signed request through", () => {
  process.env.WH_SECRET = SECRET;
  process.env.WH_HEADER = "x-signature";
  const verifier = webhookVerifier({ name: "test", secretVar: "WH_SECRET", headerVar: "WH_HEADER", algorithmVar: "WH_ALG", tokenHeaderVar: "WH_TOKEN_HEADER" });

  const { res, passed } = run(verifier, { rawBody: BODY, headers: { "x-signature": sign(SECRET, BODY) } });

  assert.equal(passed, true);
  assert.equal(res.statusCode, null);
});

test("captures the raw body for later verification", () => {
  const req = {};
  captureRawBody(req, {}, BODY);

  assert.equal(req.rawBody, BODY);
});

test("compares a static token when the provider does not sign the body", () => {
  assert.equal(verifyToken({ secret: SECRET, token: SECRET }), true);
  assert.equal(verifyToken({ secret: SECRET, token: `  ${SECRET}  ` }), true);
  assert.equal(verifyToken({ secret: SECRET, token: "altro" }), false);
  assert.equal(verifyToken({ secret: SECRET, token: "" }), false);
  assert.equal(verifyToken({ secret: "", token: SECRET }), false);
});

test("lets through a request carrying the expected token", () => {
  process.env.WH_SECRET = SECRET;
  process.env.WH_TOKEN_HEADER = "x-security-token";
  const verifier = webhookVerifier({ name: "test", secretVar: "WH_SECRET", headerVar: "WH_HEADER", algorithmVar: "WH_ALG", tokenHeaderVar: "WH_TOKEN_HEADER" });

  const { res, passed } = run(verifier, { headers: { "x-security-token": SECRET } });

  assert.equal(passed, true);
  assert.equal(res.statusCode, null);
});

test("rejects a wrong or missing token with 401", () => {
  process.env.WH_SECRET = SECRET;
  process.env.WH_TOKEN_HEADER = "x-security-token";
  const verifier = webhookVerifier({ name: "test", secretVar: "WH_SECRET", headerVar: "WH_HEADER", algorithmVar: "WH_ALG", tokenHeaderVar: "WH_TOKEN_HEADER" });

  assert.equal(run(verifier, { headers: { "x-security-token": "sbagliato" } }).res.statusCode, 401);
  assert.equal(run(verifier, { headers: {} }).res.statusCode, 401);
});

test("prefers the signature when both headers are configured", () => {
  process.env.WH_SECRET = SECRET;
  process.env.WH_HEADER = "x-signature";
  process.env.WH_TOKEN_HEADER = "x-security-token";
  const verifier = webhookVerifier({ name: "test", secretVar: "WH_SECRET", headerVar: "WH_HEADER", algorithmVar: "WH_ALG", tokenHeaderVar: "WH_TOKEN_HEADER" });

  const onlyToken = run(verifier, { rawBody: BODY, headers: { "x-security-token": SECRET } });
  assert.equal(onlyToken.res.statusCode, 401, "il token da solo non basta se e' attesa la firma");

  const signed = run(verifier, { rawBody: BODY, headers: { "x-signature": sign(SECRET, BODY) } });
  assert.equal(signed.passed, true);
});

test("closes the route when neither header is configured", () => {
  process.env.WH_SECRET = SECRET;
  const verifier = webhookVerifier({ name: "test", secretVar: "WH_SECRET", headerVar: "WH_HEADER", algorithmVar: "WH_ALG", tokenHeaderVar: "WH_TOKEN_HEADER" });

  assert.equal(run(verifier, { rawBody: BODY, headers: {} }).res.statusCode, 503);
});
