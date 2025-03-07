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

// Añadir el corchete de cierre que falta para el evento DOMContentLoaded
});
