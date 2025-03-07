const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: process.env.TIDB_HOST,
  port: process.env.TIDB_PORT,
  user: process.env.TIDB_USER,
  password: process.env.TIDB_PASSWORD,
  database: process.env.TIDB_DATABASE,
  ssl: process.env.TIDB_SSL === 'true' ? {
    rejectUnauthorized: true
  } : false
};

async function createConnection() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    return connection;
  } catch (error) {
    console.error('Error al conectar a TiDB:', error);
    throw error;
  }
}

module.exports = { createConnection };