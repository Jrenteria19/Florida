const { createConnection } = require('./db-connect');

exports.handler = async function(event, context) {
  context.callbackWaitsForEmptyEventLoop = false;
  
  try {
    const connection = await createConnection();
    const [rows] = await connection.execute('SELECT * FROM tu_tabla LIMIT 10');
    await connection.end();
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        success: true, 
        data: rows 
      })
    };
  } catch (error) {
    console.error('Error en la función:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        success: false, 
        error: 'Error al obtener datos' 
      })
    };
  }
};