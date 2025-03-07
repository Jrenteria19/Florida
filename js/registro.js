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
    messageContainer.style.padding = '10px 15px';
    messageContainer.style.borderRadius = '8px';
    messageContainer.style.marginTop = '10px';
    messageContainer.style.fontWeight = 'bold';
    messageContainer.style.textAlign = 'center';
    messageContainer.style.transition = 'all 0.3s ease';
    document.querySelector('.registration-form-wrapper').appendChild(messageContainer);
    
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
    
    // Form submission
    const form = document.getElementById('registrationForm');
    
    // Add Roblox check button
    const robloxInput = document.getElementById('robloxName');
    const robloxGroup = robloxInput.parentElement;
    
    // Create check button container
    const checkButtonContainer = document.createElement('div');
    checkButtonContainer.style.display = 'flex';
    checkButtonContainer.style.alignItems = 'center';
    checkButtonContainer.style.gap = '10px';
    checkButtonContainer.style.marginTop = '10px';
    
    // Create status indicator
    const statusIndicator = document.createElement('span');
    statusIndicator.className = 'status-indicator';
    statusIndicator.innerHTML = '<i class="fas fa-question-circle"></i>';
    statusIndicator.style.fontSize = '1.2rem';
    statusIndicator.style.color = '#bb86fc';
    
    // Create check button
    const checkButton = document.createElement('button');
    checkButton.type = 'button';
    checkButton.className = 'btn-check-roblox';
    checkButton.innerHTML = '<i class="fas fa-search"></i> Verificar Usuario';
    checkButton.style.backgroundColor = '#bb86fc';
    checkButton.style.color = 'white';
    checkButton.style.border = 'none';
    checkButton.style.borderRadius = '5px';
    checkButton.style.padding = '8px 15px';
    checkButton.style.cursor = 'pointer';
    checkButton.style.transition = 'all 0.3s ease';
    
    // Add hover effect
    checkButton.addEventListener('mouseenter', function() {
        this.style.backgroundColor = '#9d65f9';
    });
    
    checkButton.addEventListener('mouseleave', function() {
        this.style.backgroundColor = '#bb86fc';
    });
    
    // Add elements to container
    checkButtonContainer.appendChild(checkButton);
    checkButtonContainer.appendChild(statusIndicator);
    
    // Add container after roblox input
    robloxGroup.appendChild(checkButtonContainer);
    
    // Roblox validation status
    let isRobloxVerified = false;
    
    // Validate Roblox username
    async function validateRobloxUser(username) {
        try {
            const response = await fetch(`https://api.roblox.com/users/get-by-username?username=${username}`);
            const data = await response.json();
            return !data.errorMessage; // If there's no error message, the user exists
        } catch (error) {
            console.error('Error validating Roblox username:', error);
            return false;
        }
    }
    
    // Check Roblox button click handler
    checkButton.addEventListener('click', async function() {
        const robloxName = robloxInput.value.trim();
        
        if (!robloxName) {
            showMessage('⚠️ Por favor, ingresa un nombre de usuario de Roblox');
            return;
        }
        
        // Show loading state
        statusIndicator.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        statusIndicator.style.color = '#bb86fc';
        checkButton.disabled = true;
        checkButton.style.opacity = '0.7';
        
        const isValid = await validateRobloxUser(robloxName);
        
        if (isValid) {
            statusIndicator.innerHTML = '<i class="fas fa-check-circle"></i>';
            statusIndicator.style.color = '#4CAF50';
            showMessage('✅ Usuario de Roblox verificado correctamente', false);
            isRobloxVerified = true;
        } else {
            statusIndicator.innerHTML = '<i class="fas fa-times-circle"></i>';
            statusIndicator.style.color = '#ff5252';
            showMessage('❌ El usuario de Roblox no existe o no se pudo verificar');
            isRobloxVerified = false;
        }
        
        checkButton.disabled = false;
        checkButton.style.opacity = '1';
    });

    // Validate Discord username (without discriminator)
    function validateDiscordUsername(username) {
        // Discord usernames: 2-32 characters, alphanumeric and underscores
        const discordRegex = /^[a-zA-Z0-9_]{2,32}$/;
        return discordRegex.test(username);
    }

    // Validate password
    function validatePassword(password) {
        // At least 8 characters, 1 uppercase, and 1 number
        const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
        return passwordRegex.test(password);
    }
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const robloxName = document.getElementById('robloxName').value;
        const discordName = document.getElementById('discordName').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        // Check if Roblox username is verified
        if (!isRobloxVerified) {
            showMessage('⚠️ Por favor, verifica tu nombre de usuario de Roblox antes de continuar');
            return;
        }

        // Validate Discord username
        if (!validateDiscordUsername(discordName)) {
            showMessage('⚠️ El nombre de Discord no es válido. Debe tener entre 2 y 32 caracteres y solo puede contener letras, números y guiones bajos');
            return;
        }

        // Validate password
        if (!validatePassword(password)) {
            showMessage('⚠️ La contraseña debe tener al menos 8 caracteres, una mayúscula y un número');
            return;
        }

        // Check if passwords match
        if (password !== confirmPassword) {
            showMessage('⚠️ Las contraseñas no coinciden');
            return;
        }
        
        try {
            // For now, just show a success message
            showMessage('🎉 Registro exitoso! Redirigiendo al inicio de sesión...', false);
            
            // Redirect after a short delay
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
            
        } catch (error) {
            console.error('Error:', error);
            showMessage('❌ Error al registrar. Por favor, inténtalo de nuevo.');
        }
    });
});