const { createConnection } = require('./db-connect');

exports.handler = async function(event, context) {
  context.callbackWaitsForEmptyEventLoop = false;
  
  try {
    // Intentar establecer conexión
    const connection = await createConnection();
    
    // Ejecutar una consulta simple para verificar que funciona
    await connection.execute('SELECT 1');
    
    // Cerrar la conexión
    await connection.end();
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        success: true, 
        message: 'Conexión exitosa a la base de datos' 
      })
    };
  } catch (error) {
    console.error('Error al probar la conexión:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        success: false, 
        error: 'Error al conectar con la base de datos: ' + error.message 
      })
    };
  }
};