document.addEventListener('DOMContentLoaded', function() {
    // Verificar si el usuario ha iniciado sesión
    function checkAuth() {
        const userData = localStorage.getItem('floridaRPUser');
        
        if (!userData) {
            // Redirigir a login si no hay datos de usuario
            window.location.href = 'login.html';
            return;
        }
        
        try {
            const user = JSON.parse(userData);
            
            if (!user.isLoggedIn) {
                // Redirigir a login si no ha iniciado sesión
                window.location.href = 'login.html';
                return;
            }
            
            // Mostrar datos del usuario
            displayUserData(user);
        } catch (error) {
            console.error('Error al analizar datos del usuario:', error);
            localStorage.removeItem('floridaRPUser');
            window.location.href = 'login.html';
        }
    }
    
    // Mostrar datos del usuario en la página
    function displayUserData(user) {
        const profileName = document.getElementById('profileName');
        const profileDate = document.getElementById('profileDate');
        
        if (profileName) {
            profileName.textContent = user.robloxName;
        }
        
        if (profileDate) {
            // Si no hay fecha de registro, usar la fecha actual
            const registrationDate = user.registrationDate || new Date().toISOString();
            const formattedDate = new Date(registrationDate).toLocaleDateString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
            profileDate.textContent = formattedDate;
        }
    }
    
    // Configurar el botón de cerrar sesión
    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {
        logoutButton.addEventListener('click', function() {
            // Eliminar datos de sesión
            localStorage.removeItem('floridaRPUser');
            
            // Mostrar mensaje de cierre de sesión
            const logoutMessage = document.createElement('div');
            logoutMessage.className = 'logout-message';
            logoutMessage.textContent = 'Cerrando sesión...';
            document.body.appendChild(logoutMessage);
            
            // Agregar estilos para el mensaje
            const messageStyle = document.createElement('style');
            messageStyle.textContent = `
                .logout-message {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    background: rgba(30, 41, 59, 0.9);
                    color: white;
                    padding: 15px 30px;
                    border-radius: 8px;
                    z-index: 9999;
                    font-weight: 500;
                    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
                    animation: fadeIn 0.3s ease-out;
                }
                
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translate(-50%, -60%);
                    }
                    to {
                        opacity: 1;
                        transform: translate(-50%, -50%);
                    }
                }
            `;
            document.head.appendChild(messageStyle);
            
            // Recargar la página después de un breve retraso
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        });
    }
    
    // Iniciar verificación de autenticación
    checkAuth();
});