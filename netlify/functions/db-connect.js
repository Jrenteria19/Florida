const mysql = require('mysql2/promise');
require('dotenv').config();

async function dbConnect() {
    try {
        console.log('Intentando conectar a la base de datos...');
        
        // Verificar que las variables de entorno estén definidas
        if (!process.env.TIDB_HOST || !process.env.TIDB_USER || !process.env.TIDB_PASSWORD || !process.env.TIDB_DATABASE) {
            throw new Error('Variables de entorno de base de datos no configuradas correctamente');
        }
        
        // Conexión a la base de datos
        const connection = await mysql.createConnection({
            host: process.env.TIDB_HOST,
            port: process.env.TIDB_PORT || 4000,
            user: process.env.TIDB_USER,
            password: process.env.TIDB_PASSWORD,
            database: process.env.TIDB_DATABASE,
            ssl: process.env.TIDB_SSL === 'true' ? { rejectUnauthorized: true } : false,
            connectTimeout: 60000, // 60 segundos
            waitForConnections: true
        });
        
        // Verificar la conexión
        await connection.execute('SELECT 1');
        console.log('Conexión a la base de datos establecida correctamente');
        
        return connection;
    } catch (error) {
        console.error('Error al conectar a la base de datos:', error.message);
        throw error;
    }
}

module.exports = dbConnect;