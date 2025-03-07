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
        return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ success: false, message: 'Invalid request body' })
        };
    }
    
    const { type, username } = requestBody;
    
    if (!type || !username) {
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
            body: JSON.stringify({ success: false, message: 'Database error' })
        };
    } finally {
        if (connection) {
            await connection.end();
        }
    }
};