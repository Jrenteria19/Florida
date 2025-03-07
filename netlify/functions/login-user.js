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
        return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ 
                success: false, 
                message: 'Invalid request body' 
            })
        };
    }
    
    const { robloxName, password } = requestBody;
    
    // Validate required fields
    if (!robloxName || !password) {
        return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ 
                success: false, 
                message: 'Nombre de usuario y contraseña son requeridos' 
            })
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
        
        // Get user by Roblox name
        const [rows] = await connection.execute(
            'SELECT * FROM usuario WHERE roblox_name = ?',
            [robloxName]
        );
        
        if (rows.length === 0) {
            return {
                statusCode: 401,
                headers,
                body: JSON.stringify({ 
                    success: false, 
                    message: 'Nombre de usuario o contraseña incorrectos' 
                })
            };
        }
        
        const user = rows[0];
        
        // Compare passwords
        const isPasswordValid = await bcrypt.compare(password, user.password);
        
        if (!isPasswordValid) {
            return {
                statusCode: 401,
                headers,
                body: JSON.stringify({ 
                    success: false, 
                    message: 'Nombre de usuario o contraseña incorrectos' 
                })
            };
        }
        
        // Login successful
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                message: 'Inicio de sesión exitoso',
                userId: user.id,
                robloxName: user.roblox_name,
                discordName: user.discord_name
            })
        };
        
    } catch (error) {
        console.error('Login error:', error);
        
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
                success: false, 
                message: 'Error del servidor', 
                error: error.message 
            })
        };
    } finally {
        if (connection) {
            await connection.end();
        }
    }
};