const mysql = require('mysql2/promise');

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
    
    const { userId, discordName } = requestBody;
    
    if (!userId && !discordName) {
        return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ success: false, message: 'Se requiere userId o discordName' })
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
            ssl: {
                minVersion: 'TLSv1.2',
                rejectUnauthorized: true
            }
        });
        
        // Buscar por userId o discordName
        let query = 'SELECT * FROM id_cards WHERE ';
        let params = [];
        
        if (userId) {
            query += 'userId = ?';
            params.push(userId);
            
            if (discordName) {
                query += ' OR discordName = ?';
                params.push(discordName);
            }
        } else {
            query += 'discordName = ?';
            params.push(discordName);
        }
        
        const [rows] = await connection.execute(query, params);
        
        if (rows.length > 0) {
            // Encontró una cédula existente
            const idCard = rows[0];
            
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    exists: true,
                    idCard: {
                        firstName: idCard.firstName,
                        lastName: idCard.lastName,
                        birthDate: idCard.birthDate,
                        age: idCard.age,
                        nationality: idCard.nationality,
                        rut: idCard.rut,
                        issueDate: idCard.issueDate,
                        discordName: idCard.discordName
                    }
                })
            };
        } else {
            // No encontró cédula
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    exists: false
                })
            };
        }
    } catch (error) {
        console.error('Database error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                success: false,
                message: 'Error de base de datos',
                error: error.message
            })
        };
    } finally {
        if (connection) {
            await connection.end();
        }
    }
};