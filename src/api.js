async function obtenerDatos() {
  try {
    const respuesta = await fetch('/.netlify/functions/get-data');
    const datos = await respuesta.json();
    
    if (datos.success) {
      console.log('Datos obtenidos:', datos.data);
      // Mostrar mensaje de conexión exitosa
      alert('Conexión exitosa con la base de datos');
      return datos.data;
    } else {
      console.error('Error:', datos.error);
      alert('Error al conectar con la base de datos: ' + datos.error);
      return null;
    }
  } catch (error) {
    console.error('Error al llamar a la función:', error);
    alert('Error de conexión: ' + error.message);
    return null;
  }
}

// Función para probar la conexión
async function probarConexion() {
  try {
    const respuesta = await fetch('/.netlify/functions/test-connection');
    const resultado = await respuesta.json();
    
    if (resultado.success) {
      console.log('Conexión exitosa a la base de datos');
      return true;
    } else {
      console.error('Error de conexión:', resultado.error);
      return false;
    }
  } catch (error) {
    console.error('Error al probar la conexión:', error);
    return false;
  }
}

// Exportar las funciones
export { obtenerDatos, probarConexion };