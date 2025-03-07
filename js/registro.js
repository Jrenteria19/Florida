document.addEventListener('DOMContentLoaded', function() {
    // Get form elements
    const registroForm = document.getElementById('registroForm');
    const robloxUsername = document.getElementById('robloxUsername');
    const discordUsername = document.getElementById('discordUsername');
    const password = document.getElementById('password');
    const confirmPassword = document.getElementById('confirmPassword');
    const termsCheck = document.getElementById('termsCheck');
    
    // Get error message elements
    const robloxError = document.getElementById('robloxError');
    const discordError = document.getElementById('discordError');
    const passwordError = document.getElementById('passwordError');
    const confirmError = document.getElementById('confirmError');
    const termsError = document.getElementById('termsError');
    
    // Toggle password visibility
    const toggleButtons = document.querySelectorAll('.toggle-password');
    toggleButtons.forEach(button => {
        button.addEventListener('click', function() {
            const input = this.previousElementSibling;
            const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
            input.setAttribute('type', type);
            
            // Change icon
            const icon = this.querySelector('i');
            if (type === 'text') {
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    });
    
    // Add password strength meter
    if (password) {
        // Create password strength elements
        const strengthContainer = document.createElement('div');
        strengthContainer.className = 'password-strength';
        
        const strengthMeter = document.createElement('div');
        strengthMeter.className = 'strength-meter';
        
        strengthContainer.appendChild(strengthMeter);
        password.parentNode.parentNode.insertBefore(strengthContainer, password.parentNode.nextSibling);
        
        // Check password strength on input
        password.addEventListener('input', function() {
            checkPasswordStrength(this.value, strengthMeter);
        });
    }
   
    // Validate Discord username
    if (!discordUsername.value.trim()) {
        showError(discordUsername, discordError, 'Por favor, ingresa tu nombre de usuario de Discord');
        isValid = false;
    }
    
    // Validate password
    if (!password.value) {
        showError(password, passwordError, 'Por favor, ingresa una contraseña');
        isValid = false;
    } else if (password.value.length < 8) {
        showError(password, passwordError, 'La contraseña debe tener al menos 8 caracteres');
        isValid = false;
    } else if (!validatePasswordStrength(password.value)) {
        showError(password, passwordError, 'La contraseña debe incluir letras, números y caracteres especiales');
        isValid = false;
    }
    
    // Validate confirm password
    if (!confirmPassword.value) {
        showError(confirmPassword, confirmError, 'Por favor, confirma tu contraseña');
        isValid = false;
    } else if (password.value !== confirmPassword.value) {
        showError(confirmPassword, confirmError, 'Las contraseñas no coinciden');
        isValid = false;
    }
    
    // Validate terms checkbox
    if (!termsCheck.checked) {
        showError(termsCheck, termsError, 'Debes aceptar los términos y condiciones');
        isValid = false;
    }
    
    // If form is valid, submit
    if (isValid) {
        showSuccessMessage();
    }
});
    function resetErrors() {
        // Remove all error messages
        robloxError.textContent = '';
        discordError.textContent = '';
        passwordError.textContent = '';
        confirmError.textContent = '';
        termsError.textContent = '';
        
        // Remove error class from all inputs
        robloxUsername.classList.remove('input-error');
        discordUsername.classList.remove('input-error');
        password.classList.remove('input-error');
        confirmPassword.classList.remove('input-error');
        
        // Remove error styling from terms checkbox container
        document.querySelector('.checkbox-group').classList.remove('error');
    }
    
    function showError(inputElement, errorElement, message) {
        errorElement.textContent = message;
        
        // Special handling for checkbox
        if (inputElement === termsCheck) {
            document.querySelector('.checkbox-group').classList.add('error');
        } else {
            inputElement.classList.add('input-error');
        }
        
        // Make error message visible
        errorElement.style.display = 'block';
        errorElement.style.color = 'var(--error-color)';
    }
    
    function validatePasswordStrength(password) {
        // Check if password has letters, numbers, and special characters
        const hasLetters = /[a-zA-Z]/.test(password);
        const hasNumbers = /\d/.test(password);
        const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
        
        return hasLetters && hasNumbers && hasSpecial;
    }
    function checkPasswordStrength(password, meter) {
        // Calculate password strength
        let strength = 0;
        
        // Length check
        if (password.length >= 8) strength += 1;
        
        // Complexity checks
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 1;
        if (/\d/.test(password)) strength += 1;
        if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength += 1;
        
        // Update meter
        meter.className = 'strength-meter';
        if (strength === 0) {
            meter.style.width = '0';
        } else if (strength <= 2) {
            meter.classList.add('weak');
            meter.style.width = '33%';
        } else if (strength === 3) {
            meter.classList.add('medium');
            meter.style.width = '66%';
        } else {
            meter.classList.add('strong');
            meter.style.width = '100%';
        }
    }
    // Modificar la función showSuccessMessage para enviar datos al backend
    function showSuccessMessage() {
        // Obtener datos del formulario
        const userData = {
            robloxUsername: robloxUsername.value.trim(),
            discordUsername: discordUsername.value.trim(),
            password: password.value
        };
        
        // Mostrar carga en el botón
        const submitButton = document.querySelector('.btn-submit');
        const originalButtonText = submitButton.innerHTML;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Registrando...';
        submitButton.disabled = true;
        
        // Enviar datos a la función de Netlify
        fetch('/.netlify/functions/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(data => {
                    throw new Error(data.message || 'Error en la respuesta del servidor: ' + response.status);
                });
            }
            return response.json();
        })
        .then(data => {
            // Restablecer botón
            submitButton.innerHTML = originalButtonText;
            submitButton.disabled = false;
            
            if (data.success) {
                // Mostrar modal de éxito
                const successModal = document.getElementById('successModal');
                const successMessage = document.querySelector('.success-content p');
                successMessage.textContent = 'Tu cuenta ha sido registrada correctamente. Serás redirigido al inicio de sesión.';
                successModal.classList.add('show');
                
                // Redireccionar después de 3 segundos
                setTimeout(function() {
                    window.location.href = 'login.html';
                }, 3000);
            } else {
                // Mostrar mensaje de error en el modal
                const successModal = document.getElementById('successModal');
                const successTitle = document.querySelector('.success-content h3');
                const successIcon = document.querySelector('.success-content i');
                const successMessage = document.querySelector('.success-content p');
                
                successTitle.textContent = 'Error en el registro';
                successIcon.className = 'fas fa-times-circle';
                successIcon.style.color = 'var(--error-color)';
                successMessage.textContent = data.message || 'No se pudo completar el registro. Por favor, intenta nuevamente.';
                
                successModal.classList.add('show');
                
                // Cerrar el modal después de 4 segundos
                setTimeout(function() {
                    successModal.classList.remove('show');
                }, 4000);
            }
        })
        .catch(error => {
            // Restablecer botón
            submitButton.innerHTML = originalButtonText;
            submitButton.disabled = false;
            
            // Mostrar mensaje de error en el modal
            const successModal = document.getElementById('successModal');
            const successTitle = document.querySelector('.success-content h3');
            const successIcon = document.querySelector('.success-content i');
            const successMessage = document.querySelector('.success-content p');
            
            successTitle.textContent = 'Error de conexión';
            successIcon.className = 'fas fa-wifi';
            successIcon.style.color = 'var(--error-color)';
            successMessage.textContent = error.message || 'No se pudo conectar con el servidor. Por favor, verifica tu conexión e intenta nuevamente.';
            
            successModal.classList.add('show');
            
            // Cerrar el modal después de 4 segundos
            setTimeout(function() {
                successModal.classList.remove('show');
            }, 4000);
            
            console.error('Error al conectar con el servidor:', error);
        });
    }
    // Add input event listeners for real-time validation
    robloxUsername.addEventListener('input', function() {
        if (this.value.trim().length >= 3) {
            robloxError.textContent = '';
            this.classList.remove('input-error');
        }
    });

    discordUsername.addEventListener('input', function() {
        if (this.value.trim()) {
            discordError.textContent = '';
            this.classList.remove('input-error');
        }
    });

    password.addEventListener('input', function() {
        if (this.value.length >= 8 && validatePasswordStrength(this.value)) {
            passwordError.textContent = '';
            this.classList.remove('input-error');
        }
    });

    confirmPassword.addEventListener('input', function() {
        if (this.value === password.value) {
            confirmError.textContent = '';
            this.classList.remove('input-error');
        }
    });
    termsCheck.addEventListener('change', function() {
        if (this.checked) {
            termsError.textContent = '';
            document.querySelector('.checkbox-group').classList.remove('error');
            document.querySelector('.checkbox-group').classList.add('checked');
        } else {
            document.querySelector('.checkbox-group').classList.remove('checked');
        }
    });