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
            return;
        }
        
        // Preparar datos para enviar
        const dataToSend = {
            userId: userData.id || userData.robloxName, // Identificador único del usuario
            robloxName: userData.robloxName,
            discordName: userData.discordName,
            idCard: {
                firstName: idCardData.firstName,
                lastName: idCardData.lastName,
                birthDate: idCardData.birthDate,
                age: idCardData.age,
                nationality: idCardData.nationality,
                rut: idCardData.rut,
                issueDate: idCardData.issueDate,
                // No enviamos la imagen completa a la base de datos por su tamaño
                hasPhoto: !!idCardData.photoUrl
            }
        };
        
        // Aquí iría el código para enviar a la base de datos
        // Por ejemplo, usando fetch para una API:
        /*
        fetch('https://tu-api.com/idcards', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(dataToSend)
        })
        .then(response => response.json())
        .then(data => {
            console.log('Éxito:', data);
        })
        .catch((error) => {
            console.error('Error:', error);
            showNotification('Error al guardar en la base de datos', 'error');
        });
        */
        
        // Por ahora, solo registramos en consola
        console.log('Datos enviados a la base de datos:', dataToSend);
    }
    
    // Cargar cédula si existe
    function loadIdCard() {
        const idCardData = getIdCardData();
        
        if (idCardData) {
            // Ocultar el botón de crear cédula ya que el usuario ya tiene una
            if (createIdButton) createIdButton.style.display = 'none';
            if (viewIdButton) {
                viewIdButton.style.display = 'flex';
                
                // Agregar evento para mostrar la cédula existente
                viewIdButton.addEventListener('click', function() {
                    showExistingIdCard(idCardData);
                });
            }
        }
    }
    
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
            
            // Verificar si existe el elemento para la firma
            const signatureElement = document.getElementById('idCardSignature');
            if (signatureElement) {
                signatureElement.textContent = discordName;
            }
            
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
    // Verificar si el usuario ya tiene una cédula
    const userData = JSON.parse(localStorage.getItem('floridaRPUser') || '{}');
    if (userData && userData.idCard) {
        // Si tiene cédula, ocultar botón de crear y mostrar botón de ver
        if (createIdButton) createIdButton.style.display = 'none';
        if (viewIdButton) {
            viewIdButton.style.display = 'flex';
            
            // Agregar evento para mostrar la cédula existente
            viewIdButton.addEventListener('click', function() {
                showExistingIdCard(userData.idCard);
            });
        }
    }
    
    // Llamar a la función para cargar la cédula si existe
    loadIdCard();
});