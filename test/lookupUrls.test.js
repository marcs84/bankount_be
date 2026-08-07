const test = require("node:test");
const assert = require("node:assert/strict");

const dao = require("../src/dao");
dao.fetchCustomChainUrlsByWallet = async () => [];

const service = require("../src/service");

async function urlsFor(coin, overrides) {
  const saved = {};
  for (const [k, v] of Object.entries(overrides)) {
    saved[k] = process.env[k];
    if (v === undefined) delete process.env[k];
    else process.env[k] = v;
  }

  const data = {};
  await service.fetchLookupUrls(1, 1, coin, data);

  for (const [k, v] of Object.entries(saved)) {
    if (v === undefined) delete process.env[k];
    else process.env[k] = v;
  }
  return data;
}

test("serves the configured solana mainnet url", async () => {
  const data = await urlsFor("SOL", { SOL_MAIN_URL: "https://example-node.invalid/sol" });

  assert.equal(data.mainnet, "https://example-node.invalid/sol");
});

test("serves the configured solana testnet url", async () => {
  const data = await urlsFor("SOL", { SOL_TEST_URL: "https://example-node.invalid/sol-test" });

  assert.equal(data.testnet, "https://example-node.invalid/sol-test");
});

test("reports the quicknode flag to the client", async () => {
  const on = await urlsFor("SOL", { QUICKNODE_IS_ACTIVE: "true" });
  const off = await urlsFor("SOL", { QUICKNODE_IS_ACTIVE: "false" });

  assert.equal(on.quicknode_is_active, true);
  assert.equal(off.quicknode_is_active, false);
});

test("serves a url for every supported chain", async () => {
  for (const coin of ["BTC", "ETH", "BNB", "SOL"]) {
    const data = await urlsFor(coin, {});
    assert.ok("quicknode_testnet_url" in data, `${coin}: manca quicknode_testnet_url`);
    assert.ok("quicknode_mainnet_url" in data, `${coin}: manca quicknode_mainnet_url`);
    assert.ok("testnet" in data, `${coin}: manca testnet`);
    assert.ok("mainnet" in data, `${coin}: manca mainnet`);
  }
});
