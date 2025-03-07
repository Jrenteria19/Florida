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
    // Log environment variables (without exposing sensitive data)
    console.log('Environment check:', {
      host_exists: !!process.env.TIDB_HOST,
      port_exists: !!process.env.TIDB_PORT,
      user_exists: !!process.env.TIDB_USER,
      password_exists: !!process.env.TIDB_PASSWORD,
      database_exists: !!process.env.TIDB_DATABASE
    });
    
    if (!process.env.TIDB_HOST || !process.env.TIDB_USER || !process.env.TIDB_PASSWORD || !process.env.TIDB_DATABASE) {
      throw new Error('Faltan variables de entorno necesarias para la conexión');
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