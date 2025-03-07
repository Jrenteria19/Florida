const mysql = require('mysql2/promise');
require('dotenv').config();

exports.handler = async function(event, context) {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
    };
    
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }
    
    let requestBody;
    try {
        requestBody = JSON.parse(event.body);
    } catch (error) {
        return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ 
                success: false, 
                message: 'Invalid request body' 
            })
        };
    }
    
    const { userId, photoUrl } = requestBody;
    
    if (!userId || !photoUrl) {
        return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ 
                success: false, 
                message: 'Se requiere userId y photoUrl' 
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
        
        // Verificar si el usuario existe
        const [userRows] = await connection.execute(
            'SELECT id FROM usuario WHERE roblox_name = ?',
            [userId]
        );
        
        if (userRows.length === 0) {
            return {
                statusCode: 404,
                headers,
                body: JSON.stringify({ 
                    success: false, 
                    message: 'Usuario no encontrado' 
                })
            };
        }
        
        const userIdNumber = userRows[0].id;
        
        // Actualizar la foto del usuario
        await connection.execute(
            'UPDATE usuario SET avatar_url = ? WHERE id = ?',
            [photoUrl, userIdNumber]
        );
        
        // Verificar si el usuario tiene una cédula y actualizar la foto allí también
        await connection.execute(
            'UPDATE id_cards SET photo_url = ?, has_photo = TRUE WHERE user_id = ?',
            [photoUrl, userId]
        );
        
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