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
                message: 'Invalid request body',
                error: error.message 
            })
        };
    }
    
    const { userId, firstName, lastName, birthDate, age, nationality, rut, issueDate, discordName, hasPhoto } = requestBody;
    
    if (!userId || !firstName || !lastName || !birthDate || !nationality || !rut || !issueDate) {
        return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ success: false, message: 'Missing required fields' })
        };
    }
    
    // Connect to database
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
        
        // Modificar la parte donde se crea la tabla id_cards
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS id_cards (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id VARCHAR(100) NOT NULL,
                first_name VARCHAR(100) NOT NULL,
                last_name VARCHAR(100) NOT NULL,
                birth_date VARCHAR(20) NOT NULL,
                age INT NOT NULL,
                nationality VARCHAR(100) NOT NULL,
                rut VARCHAR(50) NOT NULL UNIQUE,
                issue_date VARCHAR(20) NOT NULL,
                discord_name VARCHAR(100),
                has_photo BOOLEAN DEFAULT FALSE,
                photo_url LONGTEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        // Y modificar la parte donde se actualiza o inserta la cédula para incluir photo_url
        // Para actualización:
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
            [firstName, lastName, birthDate, age, nationality, rut, issueDate, discordName, hasPhoto, requestBody.photoUrl, userId]
        );
        
        // Para inserción:
        await connection.execute(
            `INSERT INTO id_cards 
            (user_id, first_name, last_name, birth_date, age, nationality, rut, issue_date, discord_name, has_photo, photo_url) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [userId, firstName, lastName, birthDate, age, nationality, rut, issueDate, discordName, hasPhoto, requestBody.photoUrl]
        );
        
        // Obtener el ID del usuario basado en el nombre de Roblox
        const [userRows] = await connection.execute(
            'SELECT id FROM usuario WHERE roblox_name = ?',
            [userId]
        );
        
        if (userRows.length === 0) {
            return {
                statusCode: 404,
                headers,
                body: JSON.stringify({ success: false, message: 'Usuario no encontrado' })
            };
        }
        
        const userIdNumber = userRows[0].id;
        
        // Verificar si el usuario ya tiene una cédula
        const [existingIdCards] = await connection.execute(
            'SELECT id FROM id_cards WHERE user_id = ?',
            [userIdNumber]
        );
        
        if (existingIdCards.length > 0) {
            // Actualizar la cédula existente en lugar de crear una nueva
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
                has_photo = ?
                WHERE user_id = ?`,
                [firstName, lastName, birthDate, age, nationality, rut, issueDate, discordName, hasPhoto, userIdNumber]
            );
            
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
        
        // Insertar datos en la tabla id_cards
        const [result] = await connection.execute(
            `INSERT INTO id_cards 
            (user_id, first_name, last_name, birth_date, age, nationality, rut, issue_date, discord_name, has_photo) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [userIdNumber, firstName, lastName, birthDate, age, nationality, rut, issueDate, discordName, hasPhoto]
        );
        
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
            await connection.end();
        }
    }
};