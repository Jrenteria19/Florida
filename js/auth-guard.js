document.addEventListener('DOMContentLoaded', function() {
    function checkAuth() {
        const userData = JSON.parse(localStorage.getItem('floridaRPUser'));
        
        if (!userData || !userData.isLoggedIn) {
            // Redirigir a login si no está autenticado
            window.location.href = 'login.html';
        }
    }
    
    // Verificar autenticación al cargar la página
    checkAuth();
});