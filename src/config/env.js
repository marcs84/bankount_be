const REQUIRED_VARS = [
  "DB_HOST",
  "DB_USERNAME",
  "DB_DATABASE",
  "JWT_SECRET",
  "SECRET_APP",
];

const HTTPS_VARS = ["HTTPS_PRIVATEKEY", "HTTPS_CERTIFICATE"];

function findMissing(env) {
  const names =
    env.HTTPS === "true" ? REQUIRED_VARS.concat(HTTPS_VARS) : REQUIRED_VARS;

  return names.filter((name) => !env[name] || env[name].trim() === "");
}

function assertEnv(env = process.env) {
  const missing = findMissing(env);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`
    );
  }
}

module.exports = { assertEnv, findMissing, REQUIRED_VARS, HTTPS_VARS };
