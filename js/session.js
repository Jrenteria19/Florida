document.addEventListener('DOMContentLoaded', function() {
    // Verificar si el usuario ha iniciado sesión
    function checkUserSession() {
        const userData = localStorage.getItem('floridaRPUser');
        
        if (userData) {
            try {
                const user = JSON.parse(userData);
                
                if (user.isLoggedIn) {
                    // Usuario ha iniciado sesión, actualizar navegación
                    updateNavForLoggedInUser(user);
                    return true;
                }
            } catch (error) {
                console.error('Error al analizar datos del usuario:', error);
                localStorage.removeItem('floridaRPUser');
            }
        }
        
        return false;
    }
    
    // Actualizar navegación para usuario con sesión iniciada
    function updateNavForLoggedInUser(user) {
        const navLinks = document.querySelector('.nav-links');
        if (!navLinks) {
            console.error('No se encontró el elemento .nav-links');
            return;
        }
        
        // Buscar el contenedor de botones de autenticación
        const guestButtons = document.getElementById('guestButtons');
        
        // Si no existe, no mostrar error y continuar
        if (!guestButtons) {
            console.log('Nota: No se encontró el contenedor de botones de autenticación en esta página');
        } else {
            // Ocultar botones de invitado
            guestButtons.style.display = 'none';
            
            // Crear elemento para usuario logueado
            const userElement = document.createElement('div');
            userElement.className = 'user-logged';
            userElement.innerHTML = `
                <div class="user-name">${user.robloxName}</div>
                <button id="logoutButton" class="logout-button">Cerrar sesión</button>
            `;
            
            // Agregar estilos para el elemento de usuario
            if (!document.getElementById('user-logged-styles')) {
                const style = document.createElement('style');
                style.id = 'user-logged-styles';
                style.textContent = `
                    .user-logged {
                        display: flex;
                        align-items: center;
                        padding: 0 15px;
                        gap: 10px;
                    }
                    .user-name {
                        color: white;
                        font-weight: 500;
                    }
                    .logout-button {
                        background: #ff5252;
                        color: white;
                        border: none;
                        padding: 5px 10px;
                        border-radius: 4px;
                        cursor: pointer;
                        font-size: 0.8rem;
                    }
                    .logout-button:hover {
                        background: #ff1a1a;
                    }
                    @media (max-width: 768px) {
                        .user-logged {
                            padding: 10px 15px;
                            width: 100%;
                        }
                    }
                `;
                document.head.appendChild(style);
            }
            
            // Reemplazar el contenedor de botones de autenticación con el elemento de usuario
            guestButtons.parentNode.replaceChild(userElement, guestButtons);
            
            // Agregar event listener para cerrar sesión
            document.getElementById('logoutButton').addEventListener('click', function() {
                localStorage.removeItem('floridaRPUser');
                window.location.reload();
            });
        }
    }
    
    // Inicializar verificación de sesión
    checkUserSession();
});