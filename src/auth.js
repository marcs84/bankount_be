const jwt = require('jsonwebtoken');
const sysLogger = require('./sysLogger');

// Funzione middleware per l'autenticazione dell'app
function authenticateTokenApp(req, res, next) {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1]; // Estrae il token dal formato "Bearer <token>"

    // Verifica il token (implementa la tua logica di verifica qui)
    if (token === process.env.SECRET_APP) {
      next(); // Il token è valido, passa al prossimo middleware o alla gestione della rotta
    } else {
      res.sendStatus(401); // Token non valido, accesso non autorizzato
    }
  } else {
    res.sendStatus(401); // Token non fornito, accesso non autorizzato
  }
}

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

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
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

      return res.sendStatus(403); // Forbidden
    }
    req.user = user;
    next();
  });
}

// Funzione per generare un token JWT
function generateToken(user) {
  const token = jwt.sign(user, process.env.JWT_SECRET);
  return token;
}

// Funzione per generare un token JWT con scadenza per la password
function generateLimitedToken(email){
  const token = jwt.sign({email: email}, process.env.JWT_SECRET, {expiresIn: '30m'});
  return token
}

module.exports = {
  authenticateTokenApp,
  authenticateToken,
  generateToken,
  generateLimitedToken
}
