const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: process.env.TIDB_HOST || 'gateway01.us-east-1.prod.aws.tidbcloud.com',
  port: parseInt(process.env.TIDB_PORT || '4000'),
  user: process.env.TIDB_USER,
  password: process.env.TIDB_PASSWORD,
  database: process.env.TIDB_DATABASE,
  ssl: {
    minVersion: 'TLSv1.2',
    rejectUnauthorized: true
  },
  connectTimeout: 20000 // Aumentamos el timeout a 20 segundos
};

async function createConnection() {
  try {
    console.log('Intentando conectar a TiDB Cloud...');
    if (!process.env.TIDB_HOST || !process.env.TIDB_USER || !process.env.TIDB_PASSWORD) {
      throw new Error('Faltan variables de entorno necesarias para la conexión');
    }
    
    const connection = await mysql.createConnection(dbConfig);
    console.log('Conexión exitosa a TiDB Cloud');
    return connection;
  } catch (error) {
    console.error('Error detallado de conexión:', error.message);
    if (error.message.includes('ECONNREFUSED')) {
      throw new Error('No se pudo conectar al servidor de base de datos. Verifica la configuración del host y puerto.');
    }
    throw error;
  }
}

module.exports = { createConnection };