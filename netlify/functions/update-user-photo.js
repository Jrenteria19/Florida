const { createConnection } = require('./db-connect');

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
        connection = await createConnection();
        
        // Actualizar la foto en la tabla de usuarios
        await connection.execute(
            'UPDATE users SET avatarUrl = ? WHERE robloxName = ?',
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
                message: 'Error al actualizar la foto en la base de datos'
            })
        };
    } finally {
        if (connection) {
            await connection.end();
        }
    }
};