document.addEventListener('DOMContentLoaded', function() {
    const registrationForm = document.getElementById('registrationForm');
    const registrationMessage = document.getElementById('registrationMessage');
    
    // Validación de nombre de Roblox
    const robloxNameInput = document.getElementById('robloxName');
    const robloxNameValidation = document.getElementById('robloxNameValidation');
    
    if (robloxNameInput) {
        robloxNameInput.addEventListener('blur', async function() {
            const robloxName = this.value.trim();
            if (!robloxName) return;
            
            try {
                const response = await fetch('/.netlify/functions/check-user', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ type: 'roblox', username: robloxName })
                });
                
                const data = await response.json();
                
                if (data.success && data.exists) {
                    robloxNameValidation.textContent = 'Este nombre de Roblox ya está registrado';
                    robloxNameValidation.classList.add('error');
                } else {
                    robloxNameValidation.textContent = '';
                    robloxNameValidation.classList.remove('error');
                }
            } catch (error) {
                console.error('Error al verificar nombre de Roblox:', error);
            }
        });
    }
    
    // Validación de nombre de Discord
    const discordNameInput = document.getElementById('discordName');
    const discordNameValidation = document.getElementById('discordNameValidation');
    
    if (discordNameInput) {
        discordNameInput.addEventListener('blur', async function() {
            const discordName = this.value.trim();
            if (!discordName) return;
            
            try {
                const response = await fetch('/.netlify/functions/check-user', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ type: 'discord', username: discordName })
                });
                
                const data = await response.json();
                
                if (data.success && data.exists) {
                    discordNameValidation.textContent = 'Este nombre de Discord ya está registrado';
                    discordNameValidation.classList.add('error');
                } else {
                    discordNameValidation.textContent = '';
                    discordNameValidation.classList.remove('error');
                }
            } catch (error) {
                console.error('Error al verificar nombre de Discord:', error);
            }
        });
    }
    
    // Validación de contraseña
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const passwordMatchValidation = document.getElementById('passwordMatchValidation');
    const strengthMeter = document.getElementById('strengthMeter');
    const strengthText = document.getElementById('strengthText');
    
    if (passwordInput) {
        passwordInput.addEventListener('input', function() {
            const password = this.value;
            const strength = calculatePasswordStrength(password);
            
            // Actualizar medidor de seguridad
            if (strengthMeter && strengthText) {
                strengthMeter.style.width = `${strength}%`;
                
                if (strength < 30) {
                    strengthMeter.style.backgroundColor = '#ff4d4d';
                    strengthText.textContent = 'Débil';
                } else if (strength < 70) {
                    strengthMeter.style.backgroundColor = '#ffd633';
                    strengthText.textContent = 'Media';
                } else {
                    strengthMeter.style.backgroundColor = '#66cc66';
                    strengthText.textContent = 'Fuerte';
                }
            }
        });
    }
    
    if (confirmPasswordInput && passwordInput && passwordMatchValidation) {
        confirmPasswordInput.addEventListener('input', function() {
            if (this.value !== passwordInput.value) {
                passwordMatchValidation.textContent = 'Las contraseñas no coinciden';
                passwordMatchValidation.classList.add('error');
            } else {
                passwordMatchValidation.textContent = '';
                passwordMatchValidation.classList.remove('error');
            }
        });
    }
    
    // Manejar envío del formulario
    if (registrationForm) {
        registrationForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const robloxName = document.getElementById('robloxName').value;
            const discordName = document.getElementById('discordName').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            // Validar campos
            if (!robloxName || !discordName || !password || !confirmPassword) {
                showMessage(registrationMessage, 'Por favor completa todos los campos', 'error');
                return;
            }
            
            // Validar que las contraseñas coincidan
            if (password !== confirmPassword) {
                showMessage(registrationMessage, 'Las contraseñas no coinciden', 'error');
                return;
            }
            
            // Mostrar mensaje de carga
            showMessage(registrationMessage, 'Registrando usuario...', 'loading');
            
            try {
                const response = await fetch('/.netlify/functions/register-user', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ robloxName, discordName, password })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    // Registro exitoso
                    showMessage(registrationMessage, data.message, 'success');
                    
                    // Redirigir a la página de login después de un breve retraso
                    setTimeout(() => {
                        window.location.href = 'login.html';
                    }, 2000);
                } else {
                    // Error de registro
                    showMessage(registrationMessage, data.message, 'error');
                }
            } catch (error) {
                console.error('Error al registrar usuario:', error);
                showMessage(registrationMessage, 'Error al conectar con el servidor', 'error');
            }
        });
    }
    
    // Función para calcular la seguridad de la contraseña
    function calculatePasswordStrength(password) {
        if (!password) return 0;
        
        let strength = 0;
        
        // Longitud
        if (password.length >= 8) {
            strength += 25;
        } else {
            strength += (password.length / 8) * 25;
        }
        
        // Complejidad
        if (/[A-Z]/.test(password)) strength += 15; // Mayúsculas
        if (/[a-z]/.test(password)) strength += 15; // Minúsculas
        if (/[0-9]/.test(password)) strength += 15; // Números
        if (/[^A-Za-z0-9]/.test(password)) strength += 30; // Caracteres especiales
        
        return Math.min(100, strength);
    }
    
    // Función para mostrar mensajes
    function showMessage(element, message, type) {
        if (!element) return;
        
        element.textContent = message;
        element.className = 'form-message';
        
        // Añadir clase según el tipo de mensaje
        if (type === 'error') {
            element.classList.add('error');
        } else if (type === 'success') {
            element.classList.add('success');
        } else if (type === 'loading') {
            element.classList.add('loading');
        }
        
        element.style.display = 'block';
    }
    
    // Manejar botones para mostrar/ocultar contraseña
    const togglePasswordButtons = document.querySelectorAll('.toggle-password');
    togglePasswordButtons.forEach(button => {
        button.addEventListener('click', function() {
            const input = this.previousElementSibling;
            const icon = this.querySelector('i');
            
            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                input.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    });
});