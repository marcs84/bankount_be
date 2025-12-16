const mysql = require("mysql");

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
  console.error("MySQL Pool Error:", error.code);
  if (error.code === "PROTOCOL_CONNECTION_LOST") {
    console.error("Database connection was closed.");
  } else if (error.code === "PROTOCOL_ENQUEUE_AFTER_FATAL_ERROR") {
    console.error("Database connection had a fatal error.");
  } else if (error.code === "PROTOCOL_ENQUEUE_AFTER_DESTROY") {
    console.error("Database connection was destroyed.");
  } else if (error.code === "ER_CON_COUNT_ERROR") {
    console.error("Database has too many connections.");
  } else if (error.code === "ER_AUTHENTICATION_PLUGIN_ERROR") {
    console.error("Database authentication plugin error.");
  }
});

// Log successful pool initialization
pool.on("connection", (connection) => {
  if (connection.state !== "disconnected") {
    console.log("MySQL Pool: New connection acquired");
  }
});

// Test the pool connection
pool.getConnection((error, connection) => {
  if (error) {
    if (error.code === "PROTOCOL_CONNECTION_LOST") {
      console.error("Database connection was closed.");
    } else if (error.code === "PROTOCOL_ENQUEUE_AFTER_FATAL_ERROR") {
      console.error("Database connection had a fatal error.");
    } else if (error.code === "PROTOCOL_ENQUEUE_AFTER_DESTROY") {
      console.error("Database connection was destroyed.");
    } else if (error.code === "ER_CON_COUNT_ERROR") {
      console.error("Database has too many connections.");
    } else if (error.code === "ER_AUTHENTICATION_PLUGIN_ERROR") {
      console.error("Database authentication plugin error.");
    }
  } else if (connection) {
    connection.ping((error) => {
      if (error) {
        console.error("MySQL Pool connection ping failed:", error);
      } else {
        console.log("Connesso al database pool con successo");
      }
    });
    connection.release();
  }
});

module.exports = pool;