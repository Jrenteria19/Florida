const mysql = require('mysql2/promise');
require('dotenv').config();

exports.handler = async function(event, context) {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
    };
    
    // Manejar solicitudes preflight CORS
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }
    
    // Verificar método HTTP
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ success: false, message: 'Método no permitido' })
        };
    }
    
    // Parsear el cuerpo de la solicitud
    let requestBody;
    try {
        requestBody = JSON.parse(event.body);
    } catch (error) {
        console.error('Error al parsear el cuerpo de la solicitud:', error);
        return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ 
                success: false, 
                message: 'Formato de solicitud inválido',
                error: error.message
            })
        };
    }
    
    const { userId, photoUrl } = requestBody;
    
    // Validar datos requeridos
    if (!userId || !photoUrl) {
        return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ 
                success: false, 
                message: 'Se requieren userId y photoUrl' 
            })
        };
    }
    
    let connection;
    try {
        // Conexión a la base de datos
        connection = await mysql.createConnection({
            host: process.env.TIDB_HOST,
            port: process.env.TIDB_PORT,
            user: process.env.TIDB_USER,
            password: process.env.TIDB_PASSWORD,
            database: process.env.TIDB_DATABASE,
            ssl: process.env.TIDB_SSL === 'true' ? { rejectUnauthorized: true } : false
        });
        
        // Verificar si existe la tabla usuario
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS usuario (
                id INT AUTO_INCREMENT PRIMARY KEY,
                roblox_name VARCHAR(100) NOT NULL UNIQUE,
                discord_name VARCHAR(100),
                password VARCHAR(255) NOT NULL,
                avatar_url LONGTEXT,
                registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        // Actualizar la foto del usuario
        const [result] = await connection.execute(
            'UPDATE usuario SET avatar_url = ? WHERE roblox_name = ?',
            [photoUrl, userId]
        );
        
        if (result.affectedRows === 0) {
            return {
                statusCode: 404,
                headers,
                body: JSON.stringify({ 
                    success: false, 
                    message: 'Usuario no encontrado' 
                })
            };
        }
        
        // También actualizar la foto en la tabla id_cards si existe
        try {
            await connection.execute(`
                CREATE TABLE IF NOT EXISTS id_cards (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id VARCHAR(100) NOT NULL,
                    first_name VARCHAR(100) NOT NULL,
                    last_name VARCHAR(100) NOT NULL,
                    birth_date VARCHAR(20) NOT NULL,
                    age INT NOT NULL,
                    nationality VARCHAR(100) NOT NULL,
                    rut VARCHAR(50) NOT NULL,
                    issue_date VARCHAR(20) NOT NULL,
                    discord_name VARCHAR(100),
                    has_photo BOOLEAN DEFAULT FALSE,
                    photo_url LONGTEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);
            
            await connection.execute(
                'UPDATE id_cards SET photo_url = ?, has_photo = TRUE WHERE user_id = ?',
                [photoUrl, userId]
            );
        } catch (idCardError) {
            console.log('Nota: No se pudo actualizar la foto en la cédula:', idCardError.message);
            // No fallamos la operación principal si esto falla
        }
        
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ 
                success: true, 
                message: 'Foto actualizada correctamente' 
            })
        };
        
    } catch (error) {
        console.error('Error al actualizar la foto:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
                success: false, 
                message: 'Error al actualizar la foto en la base de datos',
                error: error.message 
            })
        };
    } finally {
        if (connection) {
            await connection.end();
        }
    }
};