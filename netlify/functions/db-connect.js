const mysql = require('mysql2/promise');
require('dotenv').config();

function createConnection() {
  return mysql.createConnection({
    host: process.env.TIDB_HOST,
    port: process.env.TIDB_PORT,
    user: process.env.TIDB_USER,
    password: process.env.TIDB_PASSWORD,
    database: process.env.TIDB_DATABASE,
    ssl: process.env.TIDB_SSL === 'true' ? { rejectUnauthorized: true } : false
  });
}

module.exports = { createConnection };