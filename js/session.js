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
        const authButtons = document.getElementById('guestButtons');
        if (authButtons) {
            // Crear elemento de perfil de usuario
            const userProfileElement = document.createElement('div');
            userProfileElement.className = 'user-profile';
            userProfileElement.innerHTML = `
                <div class="user-avatar">
                    <img src="imgs/default-avatar.png" alt="Avatar">
                </div>
                <div class="user-name">${user.robloxName}</div>
                <div class="user-dropdown">
                    <a href="profile.html" class="dropdown-item">
                        <i class="fas fa-user-circle"></i> Perfil
                    </a>
                    <a href="settings.html" class="dropdown-item">
                        <i class="fas fa-cog"></i> Configuración
                    </a>
                    <a href="#" class="dropdown-item logout-link">
                        <i class="fas fa-sign-out-alt"></i> Cerrar Sesión
                    </a>
                </div>
            `;
            
            // Agregar estilos para el perfil de usuario
            if (!document.getElementById('user-profile-styles')) {
                const style = document.createElement('style');
                style.id = 'user-profile-styles';
                style.textContent = `
                    .user-profile {
                        display: flex;
                        align-items: center;
                        position: relative;
                        cursor: pointer;
                        padding: 0 15px;
                    }
                    .user-avatar {
                        width: 32px;
                        height: 32px;
                        border-radius: 50%;
                        overflow: hidden;
                        margin-right: 10px;
                        border: 2px solid #9c27b0;
                    }
                    .user-avatar img {
                        width: 100%;
                        height: 100%;
                        object-fit: cover;
                    }
                    .user-name {
                        color: white;
                        font-weight: 500;
                    }
                    .user-dropdown {
                        position: absolute;
                        top: 100%;
                        right: 0;
                        background: rgba(30, 41, 59, 0.95);
                        border-radius: 8px;
                        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
                        padding: 10px 0;
                        min-width: 150px;
                        z-index: 100;
                        display: none;
                        backdrop-filter: blur(10px);
                        border: 1px solid rgba(255, 255, 255, 0.1);
                    }
                    .user-profile:hover .user-dropdown {
                        display: block;
                    }
                    .dropdown-item {
                        display: block;
                        padding: 8px 15px;
                        color: white;
                        text-decoration: none;
                        transition: background-color 0.3s;
                    }
                    .dropdown-item:hover {
                        background-color: rgba(156, 39, 176, 0.3);
                    }
                    @media (max-width: 768px) {
                        .user-profile {
                            padding: 10px 15px;
                            width: 100%;
                        }
                        .user-dropdown {
                            width: 100%;
                            position: static;
                            margin-top: 10px;
                        }
                        .user-profile:hover .user-dropdown {
                            display: none;
                        }
                        .user-profile.active .user-dropdown {
                            display: block;
                        }
                    }
                `;
                document.head.appendChild(style);
            }
            // Reemplazar el contenedor de botones de autenticación con el perfil de usuario
            authButtons.parentNode.replaceChild(userProfileElement, authButtons);
            // Agregar event listeners
            const logoutLink = userProfileElement.querySelector('.logout-link');
            logoutLink.addEventListener('click', function(e) {
                e.preventDefault();
                localStorage.removeItem('floridaRPUser');
                window.location.reload();
            });
            // Para toggle en móvil
            userProfileElement.addEventListener('click', function(e) {
                if (window.innerWidth <= 768) {
                    if (!e.target.closest('.dropdown-item')) {
                        this.classList.toggle('active');
                    }
                }
            });
        } else {
            console.warn('No se encontró el contenedor de botones de autenticación (#guestButtons)');
        }
    }
    // Inicializar verificación de sesión
    checkUserSession();
});