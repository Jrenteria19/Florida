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
    
    // Verificar si la URL de la foto es demasiado larga
    if (photoUrl.length > 500000) {  // Limitar a ~500KB
        return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ 
                success: false, 
                message: 'La imagen es demasiado grande. Por favor, utiliza una imagen más pequeña.' 
            })
        };
    }
    
    let connection;
    try {
        // Conexión directa a la base de datos sin usar db-connect.js
        connection = await mysql.createConnection({
            host: process.env.TIDB_HOST,
            port: process.env.TIDB_PORT || 4000,
            user: process.env.TIDB_USER,
            password: process.env.TIDB_PASSWORD,
            database: process.env.TIDB_DATABASE,
            ssl: process.env.TIDB_SSL === 'true' ? { rejectUnauthorized: true } : false,
            connectTimeout: 60000 // 60 segundos
        });
        
        console.log('Conexión establecida correctamente');
        
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
        
        console.log('Tabla usuario verificada');
        
        // Actualizar la foto del usuario
        const [result] = await connection.execute(
            'UPDATE usuario SET avatar_url = ? WHERE roblox_name = ?',
            [photoUrl, userId]
        );
        
        console.log('Resultado de la actualización:', result);
        
        if (result.affectedRows === 0) {
            // Si no se actualizó ninguna fila, intentar insertar el avatar en el usuario existente
            const [checkUser] = await connection.execute(
                'SELECT id FROM usuario WHERE roblox_name = ?',
                [userId]
            );
            
            if (checkUser.length > 0) {
                // El usuario existe pero no se actualizó (posiblemente un problema con la columna avatar_url)
                console.log('Usuario encontrado pero no se actualizó. Intentando método alternativo.');
                await connection.execute(
                    'ALTER TABLE usuario MODIFY COLUMN avatar_url LONGTEXT',
                    []
                );
                
                await connection.execute(
                    'UPDATE usuario SET avatar_url = ? WHERE roblox_name = ?',
                    [photoUrl, userId]
                );
            } else {
                return {
                    statusCode: 404,
                    headers,
                    body: JSON.stringify({ 
                        success: false, 
                        message: 'Usuario no encontrado' 
                    })
                };
            }
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
            
            console.log('Foto actualizada en la tabla id_cards');
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
            try {
                await connection.end();
                console.log('Conexión cerrada correctamente');
            } catch (err) {
                console.error('Error al cerrar la conexión:', err);
            }
        }
    }
};