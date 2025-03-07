document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
});

function checkAuth() {
    const userData = JSON.parse(localStorage.getItem('floridaRPUser') || '{}');
    
    if (!userData || !userData.isLoggedIn) {
        // Redirigir a login si no está autenticado
        // Solo redirigir si estamos en una página protegida
        const protectedPages = ['dashboard.html'];
        const currentPage = window.location.pathname.split('/').pop();
        
        if (protectedPages.includes(currentPage)) {
            window.location.href = 'login.html';
        }
    }
}