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
    // NUEVO: Configurar el botón de cambiar foto
    const changePhotoButton = document.getElementById('changePhotoButton');
    const photoModal = document.getElementById('photoModal');
    const photoForm = document.getElementById('photoForm');
    const newPhotoPreview = document.getElementById('newPhotoPreview');
    // Cargar foto de perfil si existe
    loadProfilePhoto();
    // Evento para abrir el modal de cambio de foto
    if (changePhotoButton) {
        console.log('Configurando evento para botón Cambiar Foto');
        changePhotoButton.addEventListener('click', function() {
            console.log('Clic en Cambiar Foto');
            if (photoModal) {
                photoModal.style.display = 'block';
                document.body.style.overflow = 'hidden'; // Prevenir scroll
            }
        });
    }
    // Previsualizar foto desde URL
    const photoUrlInput = document.getElementById('photoUrlInput');
    if (photoUrlInput) {
        photoUrlInput.addEventListener('input', function() {
            const url = this.value.trim();
            if (url) {
                previewImageFromUrl(url);
            } else {
                newPhotoPreview.innerHTML = '';
                newPhotoPreview.classList.remove('has-photo');
            }
        });
    }
    // Función para previsualizar imagen desde URL
    function previewImageFromUrl(url) {
        const img = new Image();
        img.onload = function() {
            newPhotoPreview.innerHTML = `<img src="${url}" alt="Vista previa">`;
            newPhotoPreview.classList.add('has-photo');
            newPhotoPreview.dataset.valid = 'true';
        };
        img.onerror = function() {
            newPhotoPreview.innerHTML = `<div class="error-preview">La imagen no se pudo cargar</div>`;
            newPhotoPreview.classList.add('has-photo');
            newPhotoPreview.dataset.valid = 'false';
        };
        img.src = url;
    }
    // Procesar el formulario de foto
    if (photoForm) {
        photoForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const photoUrl = photoUrlInput.value.trim();
            if (!photoUrl) {
                showNotification('Por favor ingresa un enlace a una imagen', 'error');
                return;
            }
            
            // Verificar si la imagen se cargó correctamente
            if (newPhotoPreview.dataset.valid !== 'true') {
                showNotification('La imagen no se pudo cargar. Por favor verifica el enlace', 'error');
                return;
            }
            
            // Mostrar notificación de carga
            showNotification('Guardando imagen...', 'info');
            
            // Guardar la foto
            saveProfilePhoto(photoUrl);
            
            // Actualizar avatar en la página
            const profileAvatar = document.getElementById('profileAvatar');
            if (profileAvatar) {
                profileAvatar.src = photoUrl;
            }
            
            // Cerrar el modal
            photoModal.style.display = 'none';
            document.body.style.overflow = 'auto'; // Restaurar scroll
        });
    }
    // NUEVO: Configurar eventos para cerrar modales
    const closeModalButtons = document.querySelectorAll('.close-modal, .btn-cancel');
    closeModalButtons.forEach(button => {
        button.addEventListener('click', function() {
            const modal = this.closest('.modal');
            if (modal) {
                modal.style.display = 'none';
                document.body.style.overflow = 'auto'; // Restaurar scroll
            }
        });
    });
    // Cerrar modal al hacer clic fuera del contenido
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
            document.body.style.overflow = 'auto'; // Restaurar scroll
        }
    });
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
        
        // Mostrar notificación de carga
        showNotification('Guardando foto...', 'info');
        
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
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error de red: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                showNotification('Foto actualizada correctamente en la base de datos', 'success');
            } else {
                throw new Error(data.message || 'Error al guardar la foto');
            }
        })
        .catch(error => {
            console.error('Error al guardar la foto:', error);
            showNotification('Error al guardar la foto en la base de datos: ' + error.message, 'error');
        });
    }
}
// Función para comprimir imágenes
function compressImage(dataUrl, maxWidth, quality) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = function() {
            // Calcular nuevas dimensiones manteniendo la proporción
            let width = img.width;
            let height = img.height;
            
            if (width > maxWidth) {
                height = (height * maxWidth) / width;
                width = maxWidth;
            }
            
            // Crear canvas para la compresión
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            
            // Dibujar imagen en el canvas
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            
            // Obtener la imagen comprimida
            const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
            
            // Verificar tamaño
            const sizeInBytes = compressedDataUrl.length * 0.75; // Aproximación del tamaño en bytes
            const sizeInKB = sizeInBytes / 1024;
            
            console.log(`Tamaño de imagen comprimida: ${sizeInKB.toFixed(2)} KB`);
            
            if (sizeInKB > 100) {
                // Si sigue siendo grande, comprimir más
                return compressImage(compressedDataUrl, maxWidth * 0.8, quality * 0.8)
                    .then(resolve)
                    .catch(reject);
            }
            
            resolve(compressedDataUrl);
        };
        
        img.onerror = function() {
            reject(new Error('Error al cargar la imagen para compresión'));
        };
        
        img.src = dataUrl;
    });
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
// Función para verificar si el usuario tiene cédula y mostrar/ocultar botones
function checkIdCardStatus() {
    const userData = JSON.parse(localStorage.getItem('floridaRPUser') || '{}');
    const viewIdButton = document.getElementById('viewIdButton');
    const createIdButton = document.getElementById('createIdButton');
    
    if (userData && userData.idCard) {
        // El usuario tiene cédula
        if (viewIdButton) viewIdButton.style.display = 'flex';
        if (createIdButton) createIdButton.textContent = 'Actualizar Cédula';
    } else {
        // El usuario no tiene cédula
        if (viewIdButton) viewIdButton.style.display = 'none';
    }
}

// Llamar a esta función cuando se cargue la página
document.addEventListener('DOMContentLoaded', function() {
    // Verificar estado de la cédula
    checkIdCardStatus();
});