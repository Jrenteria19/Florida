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

// Función para verificar si el usuario ya tiene una cédula en la base de datos
function checkExistingIdCard() {
    const userData = JSON.parse(localStorage.getItem('floridaRPUser') || '{}');
    
    if (!userData || !userData.isLoggedIn) {
        return false;
    }
    
    // Verificar primero si hay datos locales
    const localIdCard = getIdCardData();
    if (localIdCard) {
        return true;
    }
    // Si no hay datos locales, devolvemos false y la verificación con la base de datos
    // se hará de forma asíncrona cuando se necesite
    return false;
}
// Función para verificar cédula en la base de datos (asíncrona)
function checkIdCardInDatabase() {
    return new Promise((resolve, reject) => {
        const userData = JSON.parse(localStorage.getItem('floridaRPUser') || '{}');
        
        if (!userData || !userData.isLoggedIn) {
            resolve({ exists: false });
            return;
        }
        
        fetch('/.netlify/functions/check-id-card', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId: userData.robloxName,
                discordName: userData.discordName
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error de red: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.exists) {
                // El usuario ya tiene una cédula en la base de datos
                console.log('Cédula encontrada en la base de datos');
                resolve({ exists: true, idCard: data.idCard });
            } else {
                resolve({ exists: false });
            }
        })
        .catch(error => {
            console.error('Error al verificar cédula existente:', error);
            reject(error);
        });
    });
}
// Modificar la función saveIdCardData para que no oculte el botón de crear
function saveIdCardData(data) {
    const userData = JSON.parse(localStorage.getItem('floridaRPUser') || '{}');
    
    if (userData && userData.isLoggedIn) {
        userData.idCard = data;
        localStorage.setItem('floridaRPUser', JSON.stringify(userData));
    }
}

// Función para obtener los datos de la cédula del localStorage
function getIdCardData() {
    const userData = JSON.parse(localStorage.getItem('floridaRPUser') || '{}');
    
    if (userData && userData.isLoggedIn && userData.idCard) {
        return userData.idCard;
    }
    
    return null;
}

// Modificar el evento DOMContentLoaded para configurar los botones
document.addEventListener('DOMContentLoaded', function() {
    // Referencias a elementos del DOM
    const createIdButton = document.getElementById('createIdButton');
    const viewIdButton = document.getElementById('viewIdButton');
    const idCardModal = document.getElementById('idCardModal');
    const idCardPreview = document.getElementById('idCardPreview');
    const idCardForm = document.getElementById('idCardForm');
    const photoInput = document.getElementById('characterPhoto');
    const photoPreview = document.getElementById('photoPreview');
    const downloadButton = document.getElementById('downloadIdCard');
    const saveButton = document.getElementById('saveIdCard');
    
    // Mostrar ambos botones (quitar el display:none del viewIdButton)
    if (viewIdButton) {
        viewIdButton.style.display = 'flex';
    }
    // Configurar evento para el botón Crear Cédula
    if (createIdButton) {
        console.log('Configurando evento para botón Crear Cédula');
        createIdButton.addEventListener('click', function() {
            console.log('Clic en Crear Cédula');
            
            // Verificar si ya existe una cédula en la base de datos
            checkIdCardInDatabase()
                .then(result => {
                    if (result.exists) {
                        // Ya tiene cédula, mostrar mensaje y sugerir ver cédula
                        showNotification('Ya tienes una cédula registrada. Puedes verla con el botón "Ver Cédula".', 'info');
                    } else {
                        // No tiene cédula, mostrar el modal para crear
                        if (idCardModal) {
                            idCardModal.style.display = 'block';
                            document.body.style.overflow = 'hidden'; // Prevenir scroll
                        }
                    }
                })
                .catch(error => {
                    console.error('Error al verificar cédula:', error);
                    // En caso de error, permitir crear de todos modos
                    if (idCardModal) {
                        idCardModal.style.display = 'block';
                        document.body.style.overflow = 'hidden';
                    }
                });
        });
    }
    // Configurar evento para el botón Ver Cédula
    if (viewIdButton) {
        viewIdButton.addEventListener('click', function() {
            console.log('Clic en Ver Cédula');
            
            // Verificar si hay datos locales primero
            const localIdCard = getIdCardData();
            
            if (localIdCard) {
                // Mostrar la cédula local
                showExistingIdCard(localIdCard);
                return;
            }
            // Si no hay datos locales, verificar en la base de datos
            checkIdCardInDatabase()
                .then(result => {
                    if (result.exists) {
                        // Mostrar la cédula
                        showExistingIdCard(result.idCard);
                    } else {
                        // No tiene cédula, mostrar mensaje y sugerir crear
                        showNotification('No tienes una cédula registrada. Puedes crear una con el botón "Crear Cédula".', 'info');
                    }
                })
                .catch(error => {
                    console.error('Error al verificar cédula:', error);
                    showNotification('Error al verificar tu cédula. Intenta de nuevo más tarde.', 'error');
                });
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
                discordName
            };
            // Guardar solo en la base de datos
            sendToDatabase(idCardData);
            // Mostrar la cédula
            showExistingIdCard(idCardData);
            // Cerrar el modal de creación
            idCardModal.style.display = 'none';
            document.body.style.overflow = 'auto'; // Restaurar scroll
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
        // Update UI to show view button instead of create button
        if (createIdButton) createIdButton.style.display = 'none';
        if (viewIdButton) viewIdButton.style.display = 'flex';
    }
}); // Close the DOMContentLoaded event listener

// Modificar la función showExistingIdCard para usar la foto de perfil
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
    
    // Mostrar la foto del perfil en la cédula
    const photoContainer = document.getElementById('idCardPhoto');
    if (photoContainer) {
        // Obtener la foto de perfil del usuario
        const userData = JSON.parse(localStorage.getItem('floridaRPUser') || '{}');
        const photoUrl = userData.avatarUrl || 'imgs/default-avatar.png';
        
        photoContainer.innerHTML = `<img src="${photoUrl}" alt="Foto de perfil">`;
    }
    
    // Show the preview modal
    idCardPreview.style.display = 'block';
    document.body.style.overflow = 'hidden'; // Prevent scroll
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

// Función para formatear la fecha
function formatDate(dateString) {
    const date = new Date(dateString);
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
}

// Función para calcular la edad
function calculateAge(birthDate) {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    
    return age;
}

// Función para generar un RUT aleatorio
function generateRUT() {
    const randomNum = Math.floor(10000000 + Math.random() * 90000000);
    return `${randomNum}-${Math.floor(Math.random() * 10)}`;
}
// Función para enviar datos a la base de datos
function sendToDatabase(idCardData) {
    const userData = JSON.parse(localStorage.getItem('floridaRPUser') || '{}');
    
    if (!userData || !userData.isLoggedIn) {
        showNotification('Debes iniciar sesión para guardar tu cédula', 'error');
        return;
    }
    
    showNotification('Guardando cédula...', 'info');
    
    // Convertir la fecha de nacimiento a formato ISO para enviar a la base de datos
    const birthDateObj = new Date(idCardData.birthDate);
    const formattedBirthDate = birthDateObj.toISOString().split('T')[0];
    
    fetch('/.netlify/functions/save-id-card', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            userId: userData.robloxName,
            firstName: idCardData.firstName,
            lastName: idCardData.lastName,
            birthDate: formattedBirthDate, // Usar formato ISO para la fecha
            age: idCardData.age,
            nationality: idCardData.nationality,
            rut: idCardData.rut,
            issueDate: idCardData.issueDate,
            discordName: userData.discordName || idCardData.discordName,
            photoUrl: userData.avatarUrl || null
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
            showNotification('Cédula guardada correctamente en la base de datos', 'success');
        } else {
            throw new Error(data.message || 'Error al guardar la cédula');
        }
    })
    .catch(error => {
        console.error('Error al guardar la cédula:', error);
        showNotification('Error al guardar la cédula. Intenta de nuevo más tarde.', 'error');
    }); // Close the sendToDatabase fetch request
}
