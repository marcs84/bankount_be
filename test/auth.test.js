const test = require("node:test");
const assert = require("node:assert/strict");
const jwt = require("jsonwebtoken");

process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret-for-unit-tests";

const auth = require("../src/auth");

function fakeRes() {
  return {
    statusCode: null,
    sendStatus(code) {
      this.statusCode = code;
      return this;
    },
  };
}

test("issues tokens that expire", () => {
  const decoded = jwt.decode(auth.generateToken({ identifier: "abc" }));

  assert.ok(decoded.exp, "il token deve avere una scadenza");
  assert.ok(decoded.exp > decoded.iat, "la scadenza deve seguire l'emissione");
  assert.equal(decoded.exp - decoded.iat, 3600, "durata attesa di un'ora");
});

test("issues tokens signed with the pinned algorithm", () => {
  const header = JSON.parse(
    Buffer.from(auth.generateToken({ identifier: "abc" }).split(".")[0], "base64").toString()
  );

  assert.equal(header.alg, "HS256");
});

test("rejects a request without a token", () => {
  const res = fakeRes();
  auth.authenticateToken({ headers: {}, path: "/api/wallet" }, res, () => {
    throw new Error("non deve proseguire");
  });

  assert.equal(res.statusCode, 401);
});

test("rejects an expired token with 401 so the client can re-authenticate", (t, done) => {
  const expired = jwt.sign({ identifier: "abc" }, process.env.JWT_SECRET, {
    algorithm: "HS256",
    expiresIn: "-1s",
  });
  const res = fakeRes();

  auth.authenticateToken({ headers: { authorization: `Bearer ${expired}` }, path: "/api/wallet" }, res, () => {
    done(new Error("non deve proseguire"));
  });

  setImmediate(() => {
    assert.equal(res.statusCode, 401);
    done();
  });
});

test("rejects a token signed with another algorithm", (t, done) => {
  const none = jwt.sign({ identifier: "abc" }, "", { algorithm: "none" });
  const res = fakeRes();

  auth.authenticateToken({ headers: { authorization: `Bearer ${none}` }, path: "/api/wallet" }, res, () => {
    done(new Error("non deve proseguire"));
  });

  setImmediate(() => {
    assert.equal(res.statusCode, 401);
    done();
  });
});

test("accepts a valid token and exposes its claims", (t, done) => {
  const token = auth.generateToken({ identifier: "abc", device_token: "d1" });
  const req = { headers: { authorization: `Bearer ${token}` }, path: "/api/wallet" };
  const res = fakeRes();

  auth.authenticateToken(req, res, () => {
    assert.equal(req.user.identifier, "abc");
    assert.equal(res.statusCode, null);
    done();
  });
});
