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
    
    // Abrir modal de creación de cédula
    if (createIdButton) {
        createIdButton.addEventListener('click', function() {
            idCardModal.style.display = 'block';
            document.body.style.overflow = 'hidden'; // Prevenir scroll
        });
    }
    
    // Cerrar modales
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            idCardModal.style.display = 'none';
            idCardPreview.style.display = 'none';
            document.body.style.overflow = 'auto'; // Restaurar scroll
        });
    });
    
    // Botón cancelar
    if (cancelButton) {
        cancelButton.addEventListener('click', function() {
            idCardModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        });
    }
    
    // Previsualización de foto
    if (photoInput) {
        photoInput.addEventListener('change', function(e) {
            if (e.target.files && e.target.files[0]) {
                const reader = new FileReader();
                
                reader.onload = function(e) {
                    photoPreview.innerHTML = `<img src="${e.target.result}" alt="Foto de personaje">`;
                }
                
                reader.readAsDataURL(e.target.files[0]);
            }
        });
        
        // Hacer clic en el área de previsualización para abrir el selector de archivos
        photoPreview.addEventListener('click', function() {
            photoInput.click();
        });
    }
    // Manejar envío del formulario
    if (idCardForm) {
        idCardForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Validar que se haya subido una foto
            if (!photoInput.files || !photoInput.files[0]) {
                alert('Por favor, sube una foto de tu personaje.');
                return;
            }
            
            // Obtener datos del formulario
            const firstName = document.getElementById('firstName').value;
            const lastName = document.getElementById('lastName').value;
            const birthDate = document.getElementById('birthDate').value;
            const nationality = document.getElementById('nationality').value;
            
            // Calcular edad basada en la fecha de nacimiento
            const age = calculateAge(birthDate);
            
            // Generar RUT único
            const rut = generateRUT();
            
            // Obtener fecha actual para la emisión
            const issueDate = new Date().toLocaleDateString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
            
            // Obtener nombre de Discord del usuario
            const userData = JSON.parse(localStorage.getItem('floridaRPUser') || '{}');
            const discordName = userData.discordName || 'No disponible';
            
            // Mostrar datos en la previsualización
            document.getElementById('idCardName').textContent = `${firstName} ${lastName}`;
            document.getElementById('idCardBirthDate').textContent = formatDate(birthDate);
            document.getElementById('idCardAge').textContent = `${age} años`;
            document.getElementById('idCardNationality').textContent = nationality;
            document.getElementById('idCardRut').textContent = rut;
            document.getElementById('idCardIssueDate').textContent = issueDate;
            document.getElementById('idCardSignature').textContent = discordName;
            
            // Mostrar foto en la previsualización
            const reader = new FileReader();
            reader.onload = function(e) {
                document.getElementById('idCardPhoto').innerHTML = `<img src="${e.target.result}" alt="Foto de ID">`;
            }
            reader.readAsDataURL(photoInput.files[0]);
            
            // Guardar datos en localStorage
            saveIdCardData({
                firstName,
                lastName,
                birthDate,
                age,
                nationality,
                rut,
                issueDate,
                discordName,
                photoUrl: null // Se actualizará después de guardar la imagen
            });
            
            // Cerrar modal de formulario y mostrar previsualización
            idCardModal.style.display = 'none';
            idCardPreview.style.display = 'block';
        });
    }
    // Botón para descargar la cédula
    if (downloadButton) {
        downloadButton.addEventListener('click', function() {
            // Usar html2canvas para capturar la cédula como imagen
            const idCard = document.querySelector('.id-card');
            
            html2canvas(idCard, {
                scale: 2, // Mayor calidad
                backgroundColor: null,
                logging: false
            }).then(canvas => {
                // Convertir canvas a imagen
                const imgData = canvas.toDataURL('image/png');
                
                // Crear enlace de descarga
                const link = document.createElement('a');
                link.href = imgData;
                link.download = `cedula_${document.getElementById('idCardName').textContent.replace(/\s+/g, '_')}.png`;
                link.click();
            });
        });
    }
    // Botón para guardar la cédula
    if (saveButton) {
        saveButton.addEventListener('click', function() {
            // Actualizar datos en localStorage con la imagen
            const userData = JSON.parse(localStorage.getItem('floridaRPUser') || '{}');
            
            if (userData && userData.isLoggedIn) {
                // Capturar la cédula como imagen
                const idCard = document.querySelector('.id-card');
                
                html2canvas(idCard, {
                    scale: 2,
                    backgroundColor: null,
                    logging: false
                }).then(canvas => {
                    // Convertir canvas a imagen
                    const imgData = canvas.toDataURL('image/png');
                    
                    // Obtener datos de la cédula
                    const idCardData = getIdCardData();
                    
                    // Actualizar con la URL de la imagen
                    idCardData.photoUrl = imgData;
                    
                    // Guardar en localStorage
                    saveIdCardData(idCardData);
                    
                    // Enviar datos a la base de datos
                    sendToDatabase(idCardData);
                    
                    // Mostrar mensaje de éxito
                    showNotification('Cédula guardada correctamente', 'success');
                    
                    // Cerrar modal
                    setTimeout(() => {
                        idCardPreview.style.display = 'none';
                        document.body.style.overflow = 'auto';
                    }, 1500);
                });
            } else {
                showNotification('Debes iniciar sesión para guardar tu cédula', 'error');
            }
        });
    }
    // Cargar cédula si existe
    loadIdCard();
    
    // Función para mostrar la cédula existente
    function showExistingIdCard(idCardData) {
        // Mostrar datos en la previsualización
        document.getElementById('idCardName').textContent = `${idCardData.firstName} ${idCardData.lastName}`;
        document.getElementById('idCardBirthDate').textContent = formatDate(idCardData.birthDate);
        document.getElementById('idCardAge').textContent = `${idCardData.age} años`;
        document.getElementById('idCardNationality').textContent = idCardData.nationality;
        document.getElementById('idCardRut').textContent = idCardData.rut;
        document.getElementById('idCardIssueDate').textContent = idCardData.issueDate;
        
        // Mostrar foto en la previsualización si existe
        if (idCardData.photoUrl) {
            document.getElementById('idCardPhoto').innerHTML = `<img src="${idCardData.photoUrl}" alt="Foto de ID">`;
        }
        
        // Mostrar modal de previsualización
        idCardPreview.style.display = 'block';
        document.body.style.overflow = 'hidden'; // Prevenir scroll
    }
    // Mostrar cédula existente
    function showIdCard(data) {
        // Mostrar datos en la previsualización
        document.getElementById('idCardName').textContent = data.fullName;
        document.getElementById('idCardBirthDate').textContent = formatDate(data.birthDate);
        document.getElementById('idCardNationality').textContent = data.nationality;
        document.getElementById('idCardNumber').textContent = data.idNumber;
        document.getElementById('idCardIssueDate').textContent = data.issueDate;
        
        // Mostrar foto en la previsualización
        if (data.photoUrl) {
            document.getElementById('idCardPhoto').innerHTML = `<img src="${data.photoUrl}" alt="Foto de ID">`;
        }
        
        // Mostrar modal de previsualización
        idCardPreview.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
    // Mostrar notificación
    function showNotification(message, type = 'info') {
        // Crear elemento de notificación
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;
        
        // Agregar estilos si no existen
        if (!document.getElementById('notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                .notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    padding: 15px 20px;
                    border-radius: 8px;
                    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
                    z-index: 9999;
                    animation: slideIn 0.3s ease-out, fadeOut 0.5s ease-out 2.5s forwards;
                    max-width: 300px;
                }
                
                .notification.success {
                    background: linear-gradient(45deg, #4caf50, #2e7d32);
                    color: white;
                }
                
                .notification.error {
                    background: linear-gradient(45deg, #f44336, #c62828);
                    color: white;
                }
                
                .notification.info {
                    background: linear-gradient(45deg, #2196f3, #1565c0);
                    color: white;
                }
                
                .notification-content {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                
                @keyframes slideIn {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                
                @keyframes fadeOut {
                    from {
                        opacity: 1;
                    }
                    to {
                        opacity: 0;
                        visibility: hidden;
                    }
                }
            `;
            document.head.appendChild(style);
        }
        
        // Agregar al DOM
        document.body.appendChild(notification);
        
        // Eliminar después de 3 segundos
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
});

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