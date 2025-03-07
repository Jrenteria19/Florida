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
    // Check if required environment variables are present
    if (!process.env.TIDB_HOST) {
      throw new Error('Variable de entorno TIDB_HOST no está definida');
    }
    if (!process.env.TIDB_USER) {
      throw new Error('Variable de entorno TIDB_USER no está definida');
    }
    if (!process.env.TIDB_PASSWORD) {
      throw new Error('Variable de entorno TIDB_PASSWORD no está definida');
    }
    if (!process.env.TIDB_DATABASE) {
      throw new Error('Variable de entorno TIDB_DATABASE no está definida');
    }
    
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