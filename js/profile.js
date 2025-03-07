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

// Función para guardar la foto de perfil
function saveProfilePhoto(photoUrl) {
    const userData = JSON.parse(localStorage.getItem('floridaRPUser') || '{}');
    
    if (userData && userData.isLoggedIn) {
        // Guardar en localStorage
        userData.avatarUrl = photoUrl;
        localStorage.setItem('floridaRPUser', JSON.stringify(userData));
        
        // Actualizar la foto en la cédula si existe
        updateIdCardPhoto(photoUrl);
        
        // Guardar en la base de datos
        fetch('/.netlify/functions/update-user-photo', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId: userData.robloxName,
                photoUrl: photoUrl
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showNotification('Foto actualizada correctamente en la base de datos', 'success');
            } else {
                throw new Error(data.message || 'Error al guardar la foto');
            }
        })
        .catch(error => {
            console.error('Error al guardar la foto:', error);
            showNotification('Error al guardar la foto en la base de datos', 'error');
        });
    }
}

// Función para cargar la foto de perfil
function loadProfilePhoto() {
    const userData = JSON.parse(localStorage.getItem('floridaRPUser') || '{}');
    const profileAvatar = document.getElementById('profileAvatar');
    
    if (userData && userData.avatarUrl && profileAvatar) {
        profileAvatar.src = userData.avatarUrl;
    }
}

// Función para actualizar la foto en la cédula
function updateIdCardPhoto(photoUrl) {
    const userData = JSON.parse(localStorage.getItem('floridaRPUser') || '{}');
    
    if (userData && userData.idCard) {
        userData.idCard.photoUrl = photoUrl;
        localStorage.setItem('floridaRPUser', JSON.stringify(userData));
    }
}

// Función para mostrar notificaciones
function showNotification(message, type = 'info') {
    // Verificar si ya existe una notificación
    let notification = document.querySelector('.notification');
    
    // Si existe, eliminarla para mostrar la nueva
    if (notification) {
        notification.remove();
    }
    
    // Crear nueva notificación
    notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    // Icono según el tipo
    let icon = 'info-circle';
    if (type === 'success') icon = 'check-circle';
    if (type === 'error') icon = 'exclamation-circle';
    if (type === 'warning') icon = 'exclamation-triangle';
    
    notification.innerHTML = `
        <i class="fas fa-${icon}"></i>
        <span>${message}</span>
    `;
    
    // Agregar al DOM
    document.body.appendChild(notification);
    
    // Mostrar con animación
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Ocultar después de 3 segundos
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}