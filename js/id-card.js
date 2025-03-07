// Cargar html2canvas para la captura de la cédula
function loadHtml2Canvas() {
    if (!window.html2canvas) {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
        script.integrity = 'sha512-BNaRQnYJYiPSqHHDb58B0yaPfCu+Wgds8Gp/gU33kqBtgNS4tSPHuGibyoeqMV/TJlSKda6FXzoEyYGjTe+vXA==';
        script.crossOrigin = 'anonymous';
        script.referrerPolicy = 'no-referrer';
        document.head.appendChild(script);
    }
}

// Cargar html2canvas al iniciar
loadHtml2Canvas();

document.addEventListener('DOMContentLoaded', function() {
    // Referencias a elementos del DOM
    const createIdButton = document.getElementById('createIdButton');
    const viewIdButton = document.getElementById('viewIdButton');
    const idCardModal = document.getElementById('idCardModal');
    const idCardPreview = document.getElementById('idCardPreview');
    const closeButtons = document.querySelectorAll('.close-modal');
    const cancelButton = document.querySelector('.btn-cancel');
    const photoInput = document.getElementById('characterPhoto');
    const photoPreview = document.getElementById('photoPreview');
    const idCardForm = document.getElementById('idCardForm');
    const downloadButton = document.getElementById('downloadIdCard');
    const saveButton = document.getElementById('saveIdCard');
    
    // Añadir event listeners para los botones
    if (createIdButton) {
        createIdButton.addEventListener('click', function() {
            // Mostrar el modal para crear cédula
            idCardModal.style.display = 'block';
            document.body.style.overflow = 'hidden'; // Prevenir scroll
        });
    }
    
    if (viewIdButton) {
        viewIdButton.addEventListener('click', function() {
            // Mostrar la cédula existente
            const idCardData = getIdCardData();
            showExistingIdCard(idCardData);
        });
    }
    
    // Cerrar modales con los botones de cierre
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            idCardModal.style.display = 'none';
            idCardPreview.style.display = 'none';
            document.body.style.overflow = 'auto'; // Restaurar scroll
        });
    });
    
    // Cerrar modal con el botón de cancelar
    if (cancelButton) {
        cancelButton.addEventListener('click', function() {
            idCardModal.style.display = 'none';
            document.body.style.overflow = 'auto'; // Restaurar scroll
        });
    }
    
    // Funciones auxiliares
    
    // Calcular edad basada en la fecha de nacimiento
    function calculateAge(birthDateString) {
        const today = new Date();
        const birthDate = new Date(birthDateString);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        
        return age;
    }
    
    // Generar RUT único
    function generateRUT() {
        // Formato: XX.XXX.XXX-X (donde X son números aleatorios)
        const part1 = Math.floor(10 + Math.random() * 90);
        const part2 = Math.floor(100 + Math.random() * 900);
        const part3 = Math.floor(100 + Math.random() * 900);
        const verifier = "0123456789K"[Math.floor(Math.random() * 11)];
        
        return `${part1}.${part2}.${part3}-${verifier}`;
    }
    
    // Formatear fecha de YYYY-MM-DD a DD/MM/YYYY
    function formatDate(dateString) {
        if (!dateString) return '';
        
        const parts = dateString.split('-');
        if (parts.length !== 3) return dateString;
        
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    // Guardar datos de la cédula en localStorage
    function saveIdCardData(data) {
        const userData = JSON.parse(localStorage.getItem('floridaRPUser') || '{}');
        
        if (userData && userData.isLoggedIn) {
            userData.idCard = data;
            localStorage.setItem('floridaRPUser', JSON.stringify(userData));
            
            // Actualizar la interfaz: ocultar botón de crear y mostrar botón de ver
            if (createIdButton) createIdButton.style.display = 'none';
            if (viewIdButton) viewIdButton.style.display = 'flex';
        }
    }
    // Obtener datos de la cédula del localStorage
    function getIdCardData() {
        const userData = JSON.parse(localStorage.getItem('floridaRPUser') || '{}');
        return (userData && userData.idCard) ? userData.idCard : null;
    }
    // Enviar datos a la base de datos
    function sendToDatabase(idCardData) {
        // Obtener datos del usuario
        const userData = JSON.parse(localStorage.getItem('floridaRPUser') || '{}');
        
        if (!userData || !userData.isLoggedIn) {
            console.error('No hay usuario autenticado');
            showNotification('Debes iniciar sesión para guardar tu cédula', 'error');
            return;
        }
        
        // Preparar datos para enviar a la tabla id_cards
        const dataToSend = {
            userId: userData.robloxName, // Usar robloxName como identificador
            firstName: idCardData.firstName,
            lastName: idCardData.lastName,
            birthDate: idCardData.birthDate,
            age: idCardData.age,
            nationality: idCardData.nationality,
            rut: idCardData.rut,
            issueDate: idCardData.issueDate,
            discordName: userData.discordName || idCardData.discordName,
            hasPhoto: !!idCardData.photoUrl,
            photoUrl: idCardData.photoUrl // Enviamos la URL de la foto para actualizar el avatar
        };
        
        console.log('Enviando datos a la base de datos:', dataToSend);
        
        // Enviar a la API para guardar en la tabla id_cards
        fetch('/.netlify/functions/save-id-card', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(dataToSend)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error de red: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                console.log('Cédula guardada con éxito:', data);
                showNotification('Cédula guardada correctamente', 'success');
                
                // Actualizar el avatar del usuario en localStorage
                if (idCardData.photoUrl) {
                    userData.avatarUrl = idCardData.photoUrl;
                    localStorage.setItem('floridaRPUser', JSON.stringify(userData));
                    
                    // Actualizar avatar en la interfaz si estamos en la página de perfil
                    const profileAvatar = document.getElementById('profileAvatar');
                    if (profileAvatar) {
                        profileAvatar.src = idCardData.photoUrl;
                    }
                    
                    // Actualizar avatar en la barra de navegación
                    const navAvatar = document.querySelector('.user-avatar img');
                    if (navAvatar) {
                        navAvatar.src = idCardData.photoUrl;
                    }
                }
                
                // Actualizar la interfaz después de guardar
                setTimeout(() => {
                    idCardPreview.style.display = 'none';
                    document.body.style.overflow = 'auto';
                }, 1500);
            } else {
                console.error('Error al guardar la cédula:', data.message);
                showNotification('Error: ' + data.message, 'error');
            }
        })
        .catch((error) => {
            console.error('Error al guardar la cédula:', error);
            showNotification('Error al guardar en la base de datos', 'error');
        });
    }
// Add this function at the beginning of the file, after loadHtml2Canvas
function showNotification(message, type = 'info') {
    // Check if notification container exists, if not create it
    let notificationContainer = document.getElementById('notification-container');
    if (!notificationContainer) {
        notificationContainer = document.createElement('div');
        notificationContainer.id = 'notification-container';
        notificationContainer.style.position = 'fixed';
        notificationContainer.style.top = '20px';
        notificationContainer.style.right = '20px';
        notificationContainer.style.zIndex = '9999';
        document.body.appendChild(notificationContainer);
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    // Style the notification
    notification.style.backgroundColor = type === 'success' ? '#4caf50' : type === 'error' ? '#f44336' : '#2196f3';
    notification.style.color = 'white';
    notification.style.padding = '12px 16px';
    notification.style.marginBottom = '10px';
    notification.style.borderRadius = '4px';
    notification.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
    notification.style.display = 'flex';
    notification.style.alignItems = 'center';
    notification.style.animation = 'slideIn 0.3s ease-out forwards';
    
    // Add animation styles if not already added
    if (!document.getElementById('notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes fadeOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Add to container
    notificationContainer.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'fadeOut 0.3s ease-out forwards';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Add this function to show existing ID card
function showExistingIdCard(idCardData) {
    // Make sure we have data to display
    if (!idCardData) {
        showNotification('No se encontró información de la cédula', 'error');
        return;
    }
    
    // Display data in the preview
    document.getElementById('idCardName').textContent = `${idCardData.firstName} ${idCardData.lastName}`;
    document.getElementById('idCardBirthDate').textContent = formatDate(idCardData.birthDate);
    document.getElementById('idCardAge').textContent = `${idCardData.age} años`;
    document.getElementById('idCardNationality').textContent = idCardData.nationality;
    document.getElementById('idCardRut').textContent = idCardData.rut;
    document.getElementById('idCardIssueDate').textContent = idCardData.issueDate;
    
    // Display signature if element exists
    const signatureElement = document.getElementById('idCardSignature');
    if (signatureElement) {
        signatureElement.textContent = idCardData.discordName;
    }
    
    // Display photo if available
    if (idCardData.photoUrl) {
        document.getElementById('idCardPhoto').innerHTML = `<img src="${idCardData.photoUrl}" alt="Foto de ID">`;
    }
    
    // Show the preview modal
    idCardPreview.style.display = 'block';
    document.body.style.overflow = 'hidden'; // Prevent scroll
}

// Manejar la subida de fotos
if (photoInput) {
    photoInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                photoPreview.innerHTML = `<img src="${e.target.result}" alt="Vista previa">`;
                photoPreview.classList.add('has-photo');
            };
            reader.readAsDataURL(file);
        }
    });
}

// Procesar el formulario de cédula
if (idCardForm) {
    idCardForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Obtener datos del formulario
        const formData = new FormData(idCardForm);
        const firstName = formData.get('firstName');
        const lastName = formData.get('lastName');
        const birthDate = formData.get('birthDate');
        const nationality = formData.get('nationality');
        
        // Calcular edad y generar RUT
        const age = calculateAge(birthDate);
        const rut = generateRUT();
        
        // Fecha de emisión (hoy)
        const today = new Date();
        const issueDate = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`;
        
        // Obtener URL de la foto si existe
        let photoUrl = '';
        if (photoPreview.classList.contains('has-photo')) {
            const img = photoPreview.querySelector('img');
            if (img) {
                photoUrl = img.src;
            }
        }
        
        // Obtener nombre de Discord del usuario
        const userData = JSON.parse(localStorage.getItem('floridaRPUser') || '{}');
        const discordName = userData.discordName || '';
        
        // Crear objeto con datos de la cédula
        const idCardData = {
            firstName,
            lastName,
            birthDate,
            age,
            nationality,
            rut,
            issueDate,
            discordName,
            photoUrl
        };
        
        // Guardar datos en localStorage
        saveIdCardData(idCardData);
        
        // Mostrar la cédula
        showExistingIdCard(idCardData);
        
        // Cerrar el modal de creación
        idCardModal.style.display = 'none';
    });
}

// Botón para descargar la cédula
if (downloadButton) {
    downloadButton.addEventListener('click', function() {
        // Asegurarse de que html2canvas esté cargado
        if (!window.html2canvas) {
            showNotification('Cargando herramientas de captura...', 'info');
            loadHtml2Canvas();
            setTimeout(() => {
                downloadIdCard();
            }, 1000);
            return;
        }
        
        downloadIdCard();
    });
}

// Función para descargar la cédula como imagen
function downloadIdCard() {
    const idCard = document.querySelector('.id-card');
    if (!idCard) {
        showNotification('No se pudo encontrar la cédula para descargar', 'error');
        return;
    }
    
    showNotification('Generando imagen...', 'info');
    
    html2canvas(idCard, {
        scale: 2,
        logging: false,
        useCORS: true
    }).then(canvas => {
        const link = document.createElement('a');
        link.download = 'cedula-identidad-floridarp.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
        
        showNotification('Cédula descargada correctamente', 'success');
    }).catch(error => {
        console.error('Error al generar la imagen:', error);
        showNotification('Error al generar la imagen', 'error');
    });
}

// Botón para guardar la cédula en la base de datos
if (saveButton) {
    saveButton.addEventListener('click', function() {
        const idCardData = getIdCardData();
        if (idCardData) {
            sendToDatabase(idCardData);
        } else {
            showNotification('No hay datos de cédula para guardar', 'error');
        }
    });
}

// Verificar si el usuario ya tiene una cédula y actualizar la interfaz
const existingIdCard = getIdCardData();
if (existingIdCard) {
    if (createIdButton) createIdButton.style.display = 'none';
    if (viewIdButton) viewIdButton.style.display = 'flex';
}

// Añadir el corchete de cierre que falta para el evento DOMContentLoaded
});
