document.addEventListener('DOMContentLoaded', function() {
    // Toggle password visibility
    const toggleButtons = document.querySelectorAll('.toggle-password');
    
    toggleButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            const passwordInput = document.getElementById(targetId);
            
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                this.innerHTML = '<i class="fas fa-eye-slash"></i>';
            } else {
                passwordInput.type = 'password';
                this.innerHTML = '<i class="fas fa-eye"></i>';
            }
        });
    });
    
    // Create validation message container
    const messageContainer = document.createElement('div');
    messageContainer.className = 'validation-message';
    messageContainer.style.display = 'none';
    document.querySelector('.form-header').appendChild(messageContainer);
    // Show validation message
    function showMessage(message, isError = true) {
        messageContainer.textContent = message;
        messageContainer.style.display = 'block';
        
        if (isError) {
            messageContainer.style.backgroundColor = '#ff5252';
            messageContainer.style.color = 'white';
            messageContainer.style.border = '1px solid #ff0000';
        } else {
            messageContainer.style.backgroundColor = '#4CAF50';
            messageContainer.style.color = 'white';
            messageContainer.style.border = '1px solid #45a049';
        }
        // Auto hide after 5 seconds
        setTimeout(() => {
            messageContainer.style.display = 'none';
        }, 5000);
    }
    // Form elements
    const robloxInput = document.getElementById('robloxName');
    const discordInput = document.getElementById('discordName');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const form = document.getElementById('registrationForm');
    // Add validation status indicators
    function addValidationIndicator(inputElement) {
        const container = inputElement.parentElement;
        const indicator = document.createElement('span');
        indicator.className = 'validation-indicator';
        
        if (container.classList.contains('password-input-container')) {
            container.appendChild(indicator);
        } else {
            const wrapper = document.createElement('div');
            wrapper.className = 'input-wrapper';
            
            // Move the input to the wrapper
            inputElement.parentNode.insertBefore(wrapper, inputElement);
            wrapper.appendChild(inputElement);
            wrapper.appendChild(indicator);
        }
        
        return indicator;
    }
    // Create indicators
    const robloxIndicator = addValidationIndicator(robloxInput);
    const discordIndicator = addValidationIndicator(discordInput);
    const passwordIndicator = addValidationIndicator(passwordInput);
    const confirmPasswordIndicator = addValidationIndicator(confirmPasswordInput);
    // Basic validation for usernames
    function validateUsername(username) {
        // At least 3 characters, alphanumeric and underscores
        const usernameRegex = /^[a-zA-Z0-9_]{3,32}$/;
        return usernameRegex.test(username);
    }
    // Validate password
    function validatePassword(password) {
        // At least 8 characters, 1 uppercase, and 1 number
        const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
        return passwordRegex.test(password);
    }
    // Update indicator
    function updateIndicator(indicator, isValid) {
        if (isValid) {
            indicator.innerHTML = '<i class="fas fa-check-circle"></i>';
            indicator.style.color = '#4CAF50';
        } else {
            indicator.innerHTML = '<i class="fas fa-times-circle"></i>';
            indicator.style.color = '#ff5252';
        }
    }
    // Check if username already exists
    async function checkUsernameExists(type, username) {
        try {
            console.log(`Checking if ${type} username exists: ${username}`);
            const response = await fetch('/.netlify/functions/check-user', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    type: type,
                    username: username
                })
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
                console.error(`Server error checking ${type}:`, errorData);
                showMessage(`Error al verificar el nombre de usuario: ${errorData.message || 'Error del servidor'}`);
                return false;
            }
            
            const data = await response.json();
            return data.exists;
        } catch (error) {
            console.error(`Error checking ${type} username:`, error);
            showMessage(`Error de conexión: ${error.message}`);
            return false;
        }
    }
    // Real-time validation for Roblox username
    robloxInput.addEventListener('input', function() {
        const isValid = validateUsername(this.value.trim());
        updateIndicator(robloxIndicator, isValid);
    });
    // Real-time validation for Discord username
    discordInput.addEventListener('input', function() {
        const isValid = validateUsername(this.value.trim());
        updateIndicator(discordIndicator, isValid);
    });
    // Real-time validation for password
    passwordInput.addEventListener('input', function() {
        const isValid = validatePassword(this.value);
        updateIndicator(passwordIndicator, isValid);
        
        // Also check confirm password if it has a value
        if (confirmPasswordInput.value) {
            const passwordsMatch = this.value === confirmPasswordInput.value;
            updateIndicator(confirmPasswordIndicator, passwordsMatch);
        }
    });
    // Real-time validation for confirm password
    confirmPasswordInput.addEventListener('input', function() {
        const passwordsMatch = this.value === passwordInput.value;
        updateIndicator(confirmPasswordIndicator, passwordsMatch);
    });
    // Form submission
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const robloxName = robloxInput.value.trim();
        const discordName = discordInput.value.trim();
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        
        // Validate all fields
        const isRobloxValid = validateUsername(robloxName);
        const isDiscordValid = validateUsername(discordName);
        const isPasswordValid = validatePassword(password);
        const passwordsMatch = password === confirmPassword;
        
        // Show appropriate message for the first validation error
        if (!isRobloxValid) {
            showMessage('⚠️ El nombre de Roblox debe tener al menos 3 caracteres y solo puede contener letras, números y guiones bajos');
            return;
        }
        
        if (!isDiscordValid) {
            showMessage('⚠️ El nombre de Discord debe tener al menos 3 caracteres y solo puede contener letras, números y guiones bajos');
            return;
        }
        
        if (!isPasswordValid) {
            showMessage('⚠️ La contraseña debe tener al menos 8 caracteres, una mayúscula y un número');
            return;
        }
        
        if (!passwordsMatch) {
            showMessage('⚠️ Las contraseñas no coinciden');
            return;
        }
        
        try {
            // Show loading message
            showMessage('Procesando registro...', false);
            
            // Check if Roblox username already exists
            const robloxExists = await checkUsernameExists('roblox', robloxName);
            if (robloxExists) {
                showMessage('⚠️ Este nombre de usuario de Roblox ya está registrado');
                return;
            }
            
            // Check if Discord username already exists
            const discordExists = await checkUsernameExists('discord', discordName);
            if (discordExists) {
                showMessage('⚠️ Este nombre de usuario de Discord ya está registrado');
                return;
            }
            
            // Register the user
            const response = await fetch('/.netlify/functions/register-user', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    robloxName,
                    discordName,
                    password
                })
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
                console.error('Registration error:', errorData);
                showMessage(`❌ Error al registrar: ${errorData.message || 'Error del servidor'}`);
                return;
            }
            const result = await response.json();
            
            if (result.success) {
                showMessage('🎉 Registro exitoso! Redirigiendo al inicio de sesión...', false);
                
                // Redirect after a short delay
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);
            } else {
                showMessage(`❌ Error: ${result.message}`);
            }
        } catch (error) {
            console.error('Error:', error);
            showMessage('❌ Error al registrar. Por favor, inténtalo de nuevo.');
        }
    });
});