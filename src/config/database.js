const mysql = require("mysql");
const fs = require("fs");
const path = require("path");
const morgan = require("morgan");

// Create log directory if it doesn't exist
const logDir = path.join(__dirname, "../../logs");
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Setup Morgan stream for database errors
const dbErrorStream = fs.createWriteStream(
  path.join(logDir, "database-errors.log"),
  { flags: "a" }
);

const morganDbErrorMiddleware = morgan(
  ":date[iso] - :method :url - DATABASE ERROR - :response-time ms",
  { stream: dbErrorStream }
);

// Create MySQL connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  connectTimeout: 60000,
  connectionLimit: 10,
  waitForConnections: true,
  queueLimit: 0,
});

// Handle pool errors
pool.on("error", (error) => {
  const errorMessage = `MySQL Pool Error: ${error.code} - ${error.message}`;
  
  // Log database error to file using Morgan
  dbErrorStream.write(`[ERROR] ${new Date().toISOString()} - ${errorMessage}\n`);
  
  if (error.code === "PROTOCOL_CONNECTION_LOST") {
    const msg = "Database connection was closed.";
    dbErrorStream.write(`[ERROR] ${new Date().toISOString()} - ${msg}\n`);
  } else if (error.code === "PROTOCOL_ENQUEUE_AFTER_FATAL_ERROR") {
    const msg = "Database connection had a fatal error.";
    dbErrorStream.write(`[ERROR] ${new Date().toISOString()} - ${msg}\n`);
  } else if (error.code === "PROTOCOL_ENQUEUE_AFTER_DESTROY") {
    const msg = "Database connection was destroyed.";
    dbErrorStream.write(`[ERROR] ${new Date().toISOString()} - ${msg}\n`);
  } else if (error.code === "ER_CON_COUNT_ERROR") {
    const msg = "Database has too many connections.";
    dbErrorStream.write(`[ERROR] ${new Date().toISOString()} - ${msg}\n`);
  } else if (error.code === "ER_AUTHENTICATION_PLUGIN_ERROR") {
    const msg = "Database authentication plugin error.";
    dbErrorStream.write(`[ERROR] ${new Date().toISOString()} - ${msg}\n`);
  }
});

// Log successful pool initialization
pool.on("connection", (connection) => {
  if (connection.state !== "disconnected") {
    const msg = "MySQL Pool: New connection acquired";
    dbErrorStream.write(`[INFO] ${new Date().toISOString()} - ${msg}\n`);
  }
});

// Keep MySQL connections alive (prevents idle timeout kills)
setInterval(() => {
  pool.query("SELECT 1", (err) => {
    if (err) {
      const errorMessage = `MySQL keepalive failed: ${err.message}`;
      dbErrorStream.write(`[KEEPALIVE_ERROR] ${new Date().toISOString()} - ${errorMessage}\n`);
    }
  });
}, 5 * 60 * 1000); // every 5 minutes

// Test the pool connection
pool.getConnection((error, connection) => {
  if (error) {
    const errorMessage = `Database Connection Test Failed: ${error.message}`;
    dbErrorStream.write(`[CONNECTION_TEST_ERROR] ${new Date().toISOString()} - ${errorMessage}\n`);
    
    if (error.code === "PROTOCOL_CONNECTION_LOST") {
      const msg = "Database connection was closed.";
      dbErrorStream.write(`[ERROR] ${new Date().toISOString()} - ${msg}\n`);
    } else if (error.code === "PROTOCOL_ENQUEUE_AFTER_FATAL_ERROR") {
      const msg = "Database connection had a fatal error.";
      dbErrorStream.write(`[ERROR] ${new Date().toISOString()} - ${msg}\n`);
    } else if (error.code === "PROTOCOL_ENQUEUE_AFTER_DESTROY") {
      const msg = "Database connection was destroyed.";
      dbErrorStream.write(`[ERROR] ${new Date().toISOString()} - ${msg}\n`);
    } else if (error.code === "ER_CON_COUNT_ERROR") {
      const msg = "Database has too many connections."      
      dbErrorStream.write(`[ERROR] ${new Date().toISOString()} - ${msg}\n`);
    } else if (error.code === "ER_AUTHENTICATION_PLUGIN_ERROR") {
      const msg = "Database authentication plugin error.";
      dbErrorStream.write(`[ERROR] ${new Date().toISOString()} - ${msg}\n`);
    }
  } else if (connection) {
    connection.ping((error) => {
      if (error) {
        const errorMessage = `MySQL Pool connection ping failed: ${error.message}`;
        dbErrorStream.write(`[PING_ERROR] ${new Date().toISOString()} - ${errorMessage}\n`);
      } else {
        // SUCCESS MESSAGE - COMMENT OUT AFTER TESTING ON SERVER
        const successMessage = "✅ Connesso al database pool con successo";
        dbErrorStream.write(`[SUCCESS] ${new Date().toISOString()} - ${successMessage}\n`);
      }
    });
    connection.release();
  }
});

module.exports = pool;
