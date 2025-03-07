const mysql = require('mysql2/promise');
require('dotenv').config();

exports.handler = async function(event, context) {
    // CORS headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
    };
    
    // Solo permitir acceso con clave de administrador
    const { adminKey } = JSON.parse(event.body || '{}');
    if (adminKey !== process.env.ADMIN_KEY) {
        return {
            statusCode: 403,
            headers,
            body: JSON.stringify({ success: false, message: 'Acceso denegado' })
        };
    }
    
    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.TIDB_HOST,
            port: process.env.TIDB_PORT,
            user: process.env.TIDB_USER,
            password: process.env.TIDB_PASSWORD,
            database: process.env.TIDB_DATABASE,
            ssl: process.env.TIDB_SSL === 'true' ? { rejectUnauthorized: true } : false
        });
        
        // Eliminar tablas relacionadas con perfiles y cédulas
        await connection.execute('DROP TABLE IF EXISTS id_cards');
        await connection.execute('DROP TABLE IF EXISTS user_profiles');
        
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ 
                success: true, 
                message: 'Tablas eliminadas correctamente' 
            })
        };
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
                success: false, 
                message: 'Error al limpiar la base de datos', 
                error: error.message 
            })
        };
    } finally {
        if (connection) {
            await connection.end();
        }
    }
};