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
        messageContainer.className = `validation-message ${isError ? 'error' : 'success'}`;
        
        // Auto hide after 5 seconds
        setTimeout(() => {
            messageContainer.style.display = 'none';
        }, 5000);
    }
    
    // Form elements
    const robloxInput = document.getElementById('robloxName');
    const passwordInput = document.getElementById('password');
    const form = document.getElementById('loginForm');
    
    // Form submission
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const robloxName = robloxInput.value.trim();
        const password = passwordInput.value;
        
        // Basic validation
        if (!robloxName || !password) {
            showMessage('Por favor, completa todos los campos');
            return;
        }
        
        try {
            // Show loading state
            const submitButton = form.querySelector('.btn-login-submit');
            const originalButtonText = submitButton.innerHTML;
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Iniciando sesión...';
            submitButton.disabled = true;
            
            // Send login request
            const response = await fetch('/.netlify/functions/login-user', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    robloxName,
                    password
                })
            });
            
            const data = await response.json();
            
            if (response.ok && data.success) {
                // Save user session
                const userData = {
                    id: data.userId,
                    robloxName: data.robloxName,
                    discordName: data.discordName,
                    isLoggedIn: true
                };
                
                localStorage.setItem('floridaRPUser', JSON.stringify(userData));
                
                // Show success message
                showMessage('¡Inicio de sesión exitoso! Redirigiendo...', false);
                
                // Redirect to home page
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1500);
            } else {
                showMessage(data.message || 'Error al iniciar sesión');
                
                // Reset button state
                submitButton.innerHTML = originalButtonText;
                submitButton.disabled = false;
            }
        } catch (error) {
            console.error('Error:', error);
            showMessage('Error de conexión. Por favor, intenta de nuevo.');
            
            // Reset button state
            const submitButton = form.querySelector('.btn-login-submit');
            submitButton.innerHTML = '<i class="fas fa-sign-in-alt"></i> Iniciar Sesión';
            submitButton.disabled = false;
        }
    });
    
    // Add loading animation to form
    const formWrapper = document.querySelector('.form-wrapper');
    formWrapper.style.opacity = '0';
    
    setTimeout(() => {
        formWrapper.style.transition = 'opacity 0.5s ease-in-out';
        formWrapper.style.opacity = '1';
    }, 100);
});