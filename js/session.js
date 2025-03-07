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
            
            // Crear elemento de perfil de usuario
            const userProfileElement = document.createElement('div');
            userProfileElement.className = 'user-profile';
            userProfileElement.innerHTML = `
                <div class="user-avatar">
                    <img src="${user.avatarUrl || 'imgs/default-avatar.png'}" alt="Avatar" onerror="this.src='imgs/default-avatar.png'">
                </div>
                <div class="user-name">${user.robloxName}</div>
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
                        transition: all 0.3s ease;
                    }
                    .user-profile:hover {
                        background: rgba(255, 255, 255, 0.1);
                        border-radius: 8px;
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
                    @media (max-width: 768px) {
                        .user-profile {
                            padding: 10px 15px;
                            width: 100%;
                        }
                    }
                `;
                document.head.appendChild(style);
            }
            
            // Reemplazar el contenedor de botones de autenticación con el perfil de usuario
            guestButtons.parentNode.replaceChild(userProfileElement, guestButtons);
            
            // Agregar event listener para redirigir a la página de perfil
            userProfileElement.addEventListener('click', function() {
                window.location.href = 'profile.html';
            });
        }
    }
    
    // Inicializar verificación de sesión
    checkUserSession();
});