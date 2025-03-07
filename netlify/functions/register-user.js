const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
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
    
    const { robloxName, discordName, password } = requestBody;
    
    if (!robloxName || !discordName || !password) {
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
        
        // Verificar si la tabla usuario existe, si no crearla
        try {
            await connection.execute(`
                CREATE TABLE IF NOT EXISTS usuario (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    roblox_name VARCHAR(255) NOT NULL UNIQUE,
                    discord_name VARCHAR(255) NOT NULL UNIQUE,
                    password VARCHAR(255) NOT NULL,
                    created_at DATETIME NOT NULL
                )
            `);
        } catch (tableError) {
            console.error('Error al crear tabla:', tableError);
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ 
                    success: false, 
                    message: 'Error al crear tabla en la base de datos', 
                    error: tableError.message 
                })
            };
        }
        
        // Verificar si el nombre de Roblox ya existe
        const [robloxRows] = await connection.execute(
            'SELECT COUNT(*) as count FROM usuario WHERE roblox_name = ?',
            [robloxName]
        );
        
        if (robloxRows[0].count > 0) {
            return {
                statusCode: 409,
                headers,
                body: JSON.stringify({ 
                    success: false, 
                    message: 'Este nombre de usuario de Roblox ya está registrado' 
                })
            };
        }
        
        // Verificar si el nombre de Discord ya existe
        const [discordRows] = await connection.execute(
            'SELECT COUNT(*) as count FROM usuario WHERE discord_name = ?',
            [discordName]
        );
        
        if (discordRows[0].count > 0) {
            return {
                statusCode: 409,
                headers,
                body: JSON.stringify({ 
                    success: false, 
                    message: 'Este nombre de usuario de Discord ya está registrado' 
                })
            };
        }
        
        // Hashear la contraseña
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        // Insertar el nuevo usuario
        const [result] = await connection.execute(
            'INSERT INTO usuario (roblox_name, discord_name, password, created_at) VALUES (?, ?, ?, NOW())',
            [robloxName, discordName, hashedPassword]
        );
        
        return {
            statusCode: 201,
            headers,
            body: JSON.stringify({ 
                success: true, 
                message: 'Usuario registrado exitosamente',
                userId: result.insertId
            })
        };
        
    } catch (error) {
        console.error('Database error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
                success: false, 
                message: 'Error al registrar el usuario', 
                error: error.message,
                stack: error.stack
            })
        };
    } finally {
        if (connection) {
            try {
                await connection.end();
            } catch (err) {
                console.error('Error closing connection:', err);
            }
        }
    }
};