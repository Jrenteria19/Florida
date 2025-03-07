const { createConnection } = require('./db-connect');

exports.handler = async function(event, context) {
  context.callbackWaitsForEmptyEventLoop = false;
  
  try {
    console.log('Iniciando prueba de conexión...');
    const connection = await createConnection();
    
    const [result] = await connection.execute('SELECT 1 as test');
    await connection.end();
    
    console.log('Prueba completada:', result);
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ 
        success: true, 
        message: 'Conexión exitosa a la base de datos',
        data: result
      })
    };
  } catch (error) {
    console.error('Error en prueba de conexión:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ 
        success: false, 
        error: `Error de conexión: ${error.message}`
      })
    };
  }
};