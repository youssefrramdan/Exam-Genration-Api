import sql from "mssql";
import dotenv from "dotenv";
import asyncHandler from "express-async-handler";
import ApiError from "../utils/apiError.js";
dotenv.config();
// Database configuration for sql server Connection
const dbConfig = {
  server: process.env.DB_SERVER,
  port: parseInt(process.env.DB_PORT) || 1433,
  database: process.env.DB_DATABASE,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  options: {
    encrypt: process.env.DB_ENCRYPT === "true",
    trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE === "true",
    enableArithAbort: true,
    connectionTimeout: 30000,
    requestTimeout: 30000,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};

// Connection pool
let pool = null;

/**
 * Get database connection pool
 * Creates a new pool if one doesn't exist
 * @returns {Promise<sql.ConnectionPool>}
 */
const getPool = asyncHandler(async () => {
  //for no repeatedConnection
  if (pool?.connected) return pool;

  try {
    pool = await sql.connect(dbConfig);
    console.log("Database connected");

    pool.on("error", (err) => {
      console.error("Database pool error:", err);
      pool = null;
    });

    return pool;
  } catch (err) {
    throw new ApiError(500, "Failed to connect to database", err);
  }
});

/**
 * Close database connection pool
 */
const closePool = asyncHandler(async () => {
  try {
    if (pool) {
      await pool.close();
      pool = null;
      console.log("Database connection closed");
    }
  } catch (err) {
    throw new ApiError(500, "Failed to close database connection", err);
  }
});

/**
 * Execute a stored procedure
 * @param {string} procedureName - Name of the stored procedure
 * @param {Object} params - Parameters object { paramName: { type: sql.VarChar, value: 'value' } }
 * @returns {Promise<Object>} - Result from stored procedure
 */
const executeStoredProcedure = asyncHandler(
  async (procedureName, params = {}) => {
    try {
      const poolConnection = await getPool();
      const request = poolConnection.request();

      for (const [key, param] of Object.entries(params)) {
        if (param.output) {
          request.output(key, param.type, param.value);
        } else {
          request.input(key, param.type, param.value);
        }
      }

      return await request.execute(procedureName);
    } catch (err) {
      throw new ApiError(
        500,
        `Error executing stored procedure: ${procedureName}`,
        false,
        err
      );
    }
  }
);

// Graceful shutdown
process.on("SIGINT", async () => {
  await closePool();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await closePool();
  process.exit(0);
});

export { sql, getPool, closePool, executeStoredProcedure };
