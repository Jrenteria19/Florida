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
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const robloxName = document.getElementById('robloxName').value.trim();
        const discordName = document.getElementById('discordName').value.trim();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        // Validate Roblox username format
        if (!validateUsername(robloxName)) {
            showMessage('⚠️ El nombre de Roblox debe tener al menos 3 caracteres y solo puede contener letras, números y guiones bajos');
            return;
        }

        // Validate Discord username format
        if (!validateUsername(discordName)) {
            showMessage('⚠️ El nombre de Discord debe tener al menos 3 caracteres y solo puede contener letras, números y guiones bajos');
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