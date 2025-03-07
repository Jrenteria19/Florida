document.addEventListener('DOMContentLoaded', function() {
    // Referencias a elementos del DOM
    const createIdButton = document.getElementById('createIdButton');
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
            const fullName = document.getElementById('fullName').value;
            const birthDate = document.getElementById('birthDate').value;
            const nationality = document.getElementById('nationality').value;
            
            // Generar ID único
            const idNumber = generateIdNumber();
            
            // Obtener fecha actual para la emisión
            const issueDate = new Date().toLocaleDateString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
            
            // Mostrar datos en la previsualización
            document.getElementById('idCardName').textContent = fullName;
            document.getElementById('idCardBirthDate').textContent = formatDate(birthDate);
            document.getElementById('idCardNationality').textContent = nationality;
            document.getElementById('idCardNumber').textContent = idNumber;
            document.getElementById('idCardIssueDate').textContent = issueDate;
            
            // Mostrar foto en la previsualización
            const reader = new FileReader();
            reader.onload = function(e) {
                document.getElementById('idCardPhoto').innerHTML = `<img src="${e.target.result}" alt="Foto de ID">`;
            }
            reader.readAsDataURL(photoInput.files[0]);
            
            // Guardar datos en localStorage
            saveIdCardData({
                fullName,
                birthDate,
                nationality,
                idNumber,
                issueDate,
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
    
    // Funciones auxiliares
    
    // Generar número de ID único
    function generateIdNumber() {
        // Formato: FL-XXXXX-YYYY (donde XXXXX es un número aleatorio y YYYY es el año actual)
        const randomNum = Math.floor(10000 + Math.random() * 90000);
        const year = new Date().getFullYear();
        return `FL-${randomNum}-${year}`;
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
        }
    }
    
    // Obtener datos de la cédula del localStorage
    function getIdCardData() {
        const userData = JSON.parse(localStorage.getItem('floridaRPUser') || '{}');
        return (userData && userData.idCard) ? userData.idCard : null;
    }
    
    // Ocultar el botón de crear cédula
    function hideCreateIdButton() {
        const createIdButton = document.getElementById('createIdButton');
        if (createIdButton) {
            createIdButton.style.display = 'none';
        }
    }
    
    // Cargar cédula si existe
    function loadIdCard() {
        const idCardData = getIdCardData();
        
        if (idCardData) {
            // Ocultar el botón de crear cédula ya que el usuario ya tiene una
            hideCreateIdButton();
            
            // Agregar botón para ver cédula en el perfil
            const profileActions = document.querySelector('.profile-actions');
            
            if (profileActions && !document.getElementById('viewIdButton')) {
                const viewIdButton = document.createElement('button');
                viewIdButton.id = 'viewIdButton';
                viewIdButton.className = 'btn-view-id';
                viewIdButton.innerHTML = '<i class="fas fa-id-card"></i> Ver Cédula';
                
                // Insertar después del botón de crear cédula
                const createIdButton = document.getElementById('createIdButton');
                if (createIdButton) {
                    profileActions.insertBefore(viewIdButton, createIdButton.nextSibling);
                } else {
                    profileActions.appendChild(viewIdButton);
                }
                
                // Agregar estilos para el botón
                if (!document.getElementById('view-id-button-styles')) {
                    const style = document.createElement('style');
                    style.id = 'view-id-button-styles';
                    style.textContent = `
                        .btn-view-id {
                            padding: 0.8rem 2rem;
                            border-radius: 10px;
                            border: none;
                            background: linear-gradient(45deg, #ff9800, #f57c00);
                            color: white;
                            font-weight: 600;
                            font-size: 1rem;
                            cursor: pointer;
                            transition: all 0.3s ease;
                            display: flex;
                            align-items: center;
                            gap: 0.5rem;
                        }
                        .btn-view-id:hover {
                            transform: translateY(-3px);
                            box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3);
                            background: linear-gradient(45deg, #fb8c00, #ef6c00);
                        }
                    `;
                    document.head.appendChild(style);
                }
                
                // Agregar evento para mostrar la cédula
                viewIdButton.addEventListener('click', function() {
                    showIdCard(idCardData);
                });
            }
        }
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