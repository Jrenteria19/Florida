const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: process.env.TIDB_HOST,
  port: parseInt(process.env.TIDB_PORT || '4000'),
  user: process.env.TIDB_USER,
  password: process.env.TIDB_PASSWORD,
  database: process.env.TIDB_DATABASE,
  ssl: {
    minVersion: 'TLSv1.2',
    rejectUnauthorized: true
  }
};

async function createConnection() {
  try {
    console.log('Intentando conectar a:', process.env.TIDB_HOST);
    const connection = await mysql.createConnection(dbConfig);
    console.log('Conexión exitosa');
    return connection;
  } catch (error) {
    console.error('Error detallado:', error.message);
    throw new Error(`Error de conexión: ${error.message}`);
  }
}

module.exports = { createConnection };