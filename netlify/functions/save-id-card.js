const mysql = require('mysql2/promise');
require('dotenv').config();

exports.handler = async function(event, context) {
    // CORS headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
    };
    
    // Handle preflight request
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
    
    // Parse request body
    let requestBody;
    try {
        requestBody = JSON.parse(event.body);
    } catch (error) {
        console.error('Error parsing request body:', error);
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
    
    const { userId, firstName, lastName, birthDate, age, nationality, rut, issueDate, discordName, photoUrl } = requestBody;
    const hasPhoto = !!photoUrl;
    
    // Validar datos requeridos
    if (!userId || !firstName || !lastName || !birthDate || !nationality || !rut || !issueDate) {
        return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ 
                success: false, 
                message: 'Faltan campos requeridos para la cédula' 
            })
        };
    }
    
    // Connect to database
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
        
        // Crear la tabla id_cards si no existe
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
        
        console.log('Tabla id_cards verificada');
        
        // Verificar si el usuario ya tiene una cédula
        const [existingIdCards] = await connection.execute(
            'SELECT id FROM id_cards WHERE user_id = ?',
            [userId]
        );
        
        if (existingIdCards.length > 0) {
            // Actualizar la cédula existente
            await connection.execute(
                `UPDATE id_cards SET 
                first_name = ?, 
                last_name = ?, 
                birth_date = ?, 
                age = ?, 
                nationality = ?, 
                rut = ?, 
                issue_date = ?, 
                discord_name = ?, 
                has_photo = ?,
                photo_url = ?
                WHERE user_id = ?`,
                [firstName, lastName, birthDate, age, nationality, rut, issueDate, discordName, hasPhoto, photoUrl, userId]
            );
            
            console.log('Cédula actualizada correctamente');
            
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ 
                    success: true, 
                    message: 'Cédula actualizada correctamente',
                    id: existingIdCards[0].id
                })
            };
        }
        
        // Insertar nueva cédula
        const [result] = await connection.execute(
            `INSERT INTO id_cards 
            (user_id, first_name, last_name, birth_date, age, nationality, rut, issue_date, discord_name, has_photo, photo_url) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [userId, firstName, lastName, birthDate, age, nationality, rut, issueDate, discordName, hasPhoto, photoUrl]
        );
        
        console.log('Nueva cédula creada correctamente');
        
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ 
                success: true, 
                message: 'Cédula guardada correctamente',
                id: result.insertId
            })
        };
        
    } catch (error) {
        console.error('Database error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
                success: false, 
                message: 'Error al guardar la cédula en la base de datos',
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