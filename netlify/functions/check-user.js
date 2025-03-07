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
    
    const { type, username } = requestBody;
    
    if (!type || !username) {
        return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ 
                success: false, 
                message: 'Missing required fields' 
            })
        };
    }
    
    // Connect to database
    let connection;
    try {
        // Log environment variables (without exposing sensitive data)
        console.log('Environment check:', {
            TIDB_HOST_exists: !!process.env.TIDB_HOST,
            TIDB_PORT_exists: !!process.env.TIDB_PORT,
            TIDB_USER_exists: !!process.env.TIDB_USER,
            TIDB_PASSWORD_exists: !!process.env.TIDB_PASSWORD,
            TIDB_DATABASE_exists: !!process.env.TIDB_DATABASE
        });
        
        connection = await mysql.createConnection({
            host: process.env.TIDB_HOST,
            port: process.env.TIDB_PORT,
            user: process.env.TIDB_USER,
            password: process.env.TIDB_PASSWORD,
            database: process.env.TIDB_DATABASE,
            ssl: process.env.TIDB_SSL === 'true' ? { rejectUnauthorized: true } : false
        });
        
        // Check if username exists
        let query;
        if (type === 'roblox') {
            query = 'SELECT COUNT(*) as count FROM usuario WHERE roblox_name = ?';
        } else if (type === 'discord') {
            query = 'SELECT COUNT(*) as count FROM usuario WHERE discord_name = ?';
        } else {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ success: false, message: 'Invalid type' })
            };
        }
        
        const [rows] = await connection.execute(query, [username]);
        const exists = rows[0].count > 0;
        
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ success: true, exists })
        };
    } catch (error) {
        console.error('Database error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
                success: false, 
                message: 'Database error', 
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