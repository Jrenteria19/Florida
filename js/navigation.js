document.addEventListener('DOMContentLoaded', function() {
    const navbar = document.querySelector('.navbar');
    const toggleBtn = document.querySelector('.menu-toggle');
    
    // Asegurarse de que el botón de menú exista
    if (!toggleBtn) {
        console.error('Menu toggle button not found');
        return;
    }
    
    // Toggle menu function
    toggleBtn.addEventListener('click', function() {
        navbar.classList.toggle('collapsed');
        
        const mainSections = document.querySelectorAll('.hero, .section');
        mainSections.forEach(section => {
            section.classList.toggle('menu-collapsed');
        });
        
        // Change icon based on state
        const icon = toggleBtn.querySelector('i');
        if (navbar.classList.contains('collapsed')) {
            icon.className = 'fas fa-bars';
        } else {
            icon.className = 'fas fa-times';
        }
        
        // Guardar el estado del menú en localStorage
        localStorage.setItem('menuCollapsed', navbar.classList.contains('collapsed'));
    });
    
    // Restaurar el estado del menú desde localStorage
    const menuCollapsed = localStorage.getItem('menuCollapsed') === 'true';
    if (menuCollapsed) {
        navbar.classList.add('collapsed');
        document.querySelectorAll('.hero, .section').forEach(el => {
            el.classList.add('menu-collapsed');
        });
        toggleBtn.querySelector('i').className = 'fas fa-bars';
    } else if (window.innerWidth <= 768) {
        // En móviles, colapsar por defecto
        navbar.classList.add('collapsed');
        document.querySelectorAll('.hero, .section').forEach(el => {
            el.classList.add('menu-collapsed');
        });
        toggleBtn.querySelector('i').className = 'fas fa-bars';
    }
    document.addEventListener('DOMContentLoaded', function() {
        // Manejar el botón de menú en dispositivos móviles
        const menuToggle = document.querySelector('.menu-toggle');
        const navLinks = document.querySelector('.nav-links');
        
        if (menuToggle && navLinks) {
            menuToggle.addEventListener('click', function() {
                navLinks.classList.toggle('active');
                this.classList.toggle('active');
            });
        }
        
        // Cerrar menú al hacer clic en un enlace
        const navLinkElements = document.querySelectorAll('.nav-link');
        navLinkElements.forEach(link => {
            link.addEventListener('click', function() {
                if (navLinks && navLinks.classList.contains('active')) {
                    navLinks.classList.remove('active');
                    if (menuToggle) {
                        menuToggle.classList.remove('active');
                    }
                }
            });
        });
        
        // Marcar enlace activo
        const currentPage = window.location.pathname.split('/').pop();
        navLinkElements.forEach(link => {
            const href = link.getAttribute('href');
            if (href === currentPage) {
                link.classList.add('active');
            }
        });
    });
});