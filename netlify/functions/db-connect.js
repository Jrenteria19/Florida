const mysql = require('mysql2/promise');
require('dotenv').config();

async function dbConnect() {
    try {
        // Conexión a la base de datos
        const connection = await mysql.createConnection({
            host: process.env.TIDB_HOST,
            port: process.env.TIDB_PORT,
            user: process.env.TIDB_USER,
            password: process.env.TIDB_PASSWORD,
            database: process.env.TIDB_DATABASE,
            ssl: process.env.TIDB_SSL === 'true' ? { rejectUnauthorized: true } : false,
            connectTimeout: 30000, // 30 segundos
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        });
        
        // Verificar la conexión
        await connection.execute('SELECT 1');
        console.log('Conexión a la base de datos establecida correctamente');
        
        return connection;
    } catch (error) {
        console.error('Error al conectar a la base de datos:', error);
        throw error;
    }
}

module.exports = dbConnect;