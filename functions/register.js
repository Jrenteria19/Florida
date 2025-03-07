const mysql = require('mysql2/promise');

exports.handler = async (event, context) => {
  // Asegurarse de que es una solicitud POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ success: false, message: 'Método no permitido' })
    };
  }

  try {
    // Obtener datos del cuerpo de la solicitud
    const data = JSON.parse(event.body);
    
    // Validar campos requeridos
    if (!data.robloxUsername || !data.discordUsername || !data.password) {
      return {
        statusCode: 400,
        body: JSON.stringify({ success: false, message: 'Faltan campos requeridos' })
      };
    }

    // Crear conexión a la base de datos
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    // Verificar si el usuario ya existe
    const [rows] = await connection.execute(
      'SELECT * FROM ciudadanos WHERE roblox_username = ?',
      [data.robloxUsername]
    );

    if (rows.length > 0) {
      await connection.end();
      return {
        statusCode: 400,
        body: JSON.stringify({ success: false, message: 'Este usuario de Roblox ya está registrado' })
      };
    }

    // Encriptar la contraseña
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Insertar nuevo usuario
    await connection.execute(
      'INSERT INTO ciudadanos (roblox_username, discord_username, password, fecha_registro) VALUES (?, ?, ?, NOW())',
      [data.robloxUsername, data.discordUsername, hashedPassword]
    );

    await connection.end();

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, message: 'Usuario registrado correctamente' })
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, message: 'Error del servidor: ' + error.message })
    };
  }
};