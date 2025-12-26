/**
 * Test database connection
 * Usage: node scripts/test-connection.js
 */

import dotenv from "dotenv";
import { getPool, closePool } from "../src/config/db.js";

dotenv.config();

async function testConnection() {
  console.log("🔍 Testing database connection...\n");

  console.log("Configuration:");
  console.log("- Server:", process.env.DB_SERVER);
  console.log("- Port:", process.env.DB_PORT);
  console.log("- Database:", process.env.DB_DATABASE);
  console.log("- User:", process.env.DB_USER);
  console.log("- Encrypt:", process.env.DB_ENCRYPT);
  console.log("- Trust Certificate:", process.env.DB_TRUST_SERVER_CERTIFICATE);
  console.log("");

  try {
    // Try to connect
    const pool = await getPool();
    console.log("✅ Database connection successful!\n");

    // Test a simple query
    const result = await pool.request().query("SELECT @@VERSION AS version");
    console.log("📊 SQL Server Version:");
    console.log(result.recordset[0].version);
    console.log("");

    // Close connection
    await closePool();
    console.log("✅ Connection closed successfully");
    process.exit(0);
  } catch (error) {
    console.error("❌ Database connection failed!\n");
    console.error("Error:", error.message);
    console.error("\n💡 Troubleshooting tips:");
    console.error("1. Check if SQL Server is running");
    console.error("2. Verify credentials in .env file");
    console.error("3. Check firewall settings");
    console.error("4. Enable TCP/IP in SQL Server Configuration Manager");
    console.error(
      "5. Verify SQL Server is listening on port",
      process.env.DB_PORT || 1433
    );
    process.exit(1);
  }
}

testConnection();
