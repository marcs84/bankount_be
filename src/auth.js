const jwt = require('jsonwebtoken');
const sysLogger = require('./sysLogger');

const JWT_ALGORITHM = 'HS256';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';

// Funzione middleware per l'autenticazione
function authenticateToken(req, res, next) {
  // Ottieni il token Bearer dall'header della richiesta
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  // Verifica se il token è presente
  if (!token) {
    return res.sendStatus(401); // Unauthorized
  }
  // Verifica e decodifica il token

  jwt.verify(token, process.env.JWT_SECRET, { algorithms: [JWT_ALGORITHM] }, (err, user) => {
    if (err) {
      sysLogger.logToDb(
        "SYSTEM_ERROR",
        "auth.authenticateToken.jwtVerifyFailed",
        {
          error: err && err.message ? err.message : String(err),
          path: req.path,
        },
        "ERROR"
      );

      return res.sendStatus(401); // Credenziali assenti o non più valide
    }
    req.user = user;
    next();
  });
}

// Funzione per generare un token JWT
function generateToken(user) {
  const token = jwt.sign(user, process.env.JWT_SECRET, {
    algorithm: JWT_ALGORITHM,
    expiresIn: JWT_EXPIRES_IN,
  });
  return token;
}

// Funzione per generare un token JWT con scadenza per la password
function generateLimitedToken(email){
  const token = jwt.sign({email: email}, process.env.JWT_SECRET, {
    algorithm: JWT_ALGORITHM,
    expiresIn: '30m',
  });
  return token
}

module.exports = {
  authenticateToken,
  generateToken,
  generateLimitedToken,
  JWT_ALGORITHM,
  JWT_EXPIRES_IN
}
