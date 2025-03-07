const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

exports.handler = async (event, context) => {
  // Enable CORS for frontend requests
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // Ensure this is a POST request
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ success: false, message: 'Método no permitido' })
    };
  }

  try {
    // Parse request body
    const data = JSON.parse(event.body);
    
    // Validate required fields
    if (!data.robloxUsername || !data.discordUsername || !data.password) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ success: false, message: 'Faltan campos requeridos' })
      };
    }

    // TiDB Cloud connection configuration
    const connection = await mysql.createConnection({
      host: process.env.TIDB_HOST,
      port: process.env.TIDB_PORT || 4000,
      user: process.env.TIDB_USER,
      password: process.env.TIDB_PASSWORD,
      database: process.env.TIDB_DATABASE,
      ssl: {
        minVersion: 'TLSv1.2',
        rejectUnauthorized: true
      }
    });

    console.log('Connected to TiDB Cloud');

    // Check if user already exists
    const [existingUsers] = await connection.execute(
      'SELECT * FROM usuarios WHERE roblox_username = ?',
      [data.robloxUsername]
    );

    if (existingUsers.length > 0) {
      await connection.end();
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ success: false, message: 'Este usuario de Roblox ya está registrado' })
      };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Insert new user
    await connection.execute(
      'INSERT INTO usuarios (roblox_username, discord_username, password, fecha_registro) VALUES (?, ?, ?, NOW())',
      [data.robloxUsername, data.discordUsername, hashedPassword]
    );

    await connection.end();
    console.log('User registered successfully');

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true, 
        message: 'Usuario registrado correctamente' 
      })
    };
  } catch (error) {
    console.error('Error in registration function:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        success: false, 
        message: 'Error del servidor: ' + error.message 
      })
    };
  }
};