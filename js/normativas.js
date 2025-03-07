document.addEventListener('DOMContentLoaded', function() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    // Añadir marca de agua y logo flotante
    const body = document.querySelector('body');
    const watermark = document.createElement('div');
    watermark.className = 'florida-watermark';
    body.appendChild(watermark);

    const floatingLogo = document.createElement('div');
    floatingLogo.className = 'floating-logo';
    floatingLogo.innerHTML = `<img src="imgs/FloridaRp.png" alt="FloridaRP">`;
    body.appendChild(floatingLogo);

    // Añadir efecto de brillo a elementos importantes
    const importantElements = document.querySelectorAll('.important-note, .rule-card, .faction-section');
    importantElements.forEach(el => {
        el.classList.add('glow-effect');
    });

    // Mejorar el título de la sección
    const sectionTitle = document.querySelector('.section-title');
    if (sectionTitle) {
        sectionTitle.innerHTML = `📜 Normativas <span class="title-accent">FloridaRP</span>`;
    }

    // Función para cambiar de pestaña
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remover clase active de todos los botones
            tabBtns.forEach(b => b.classList.remove('active'));
            // Añadir clase active al botón clickeado
            this.classList.add('active');
            
            // Obtener el id del contenido a mostrar
            const tabId = this.dataset.tab;
            
            // Ocultar todos los contenidos
            tabContents.forEach(content => {
                content.classList.remove('active');
                content.style.display = 'none';
            });
            
            // Mostrar el contenido seleccionado con animación
            const selectedContent = document.getElementById(tabId);
            if (selectedContent) {
                selectedContent.style.display = 'block';
                setTimeout(() => {
                    selectedContent.classList.add('active');
                }, 10);
            }
        });
    });

    // Activar la primera pestaña por defecto
    if (tabBtns.length > 0 && tabContents.length > 0) {
        tabBtns[0].click();
    }

    // Añadir animación de aparición a los elementos al hacer scroll
    const animateOnScroll = function() {
        const elements = document.querySelectorAll('.rule-card, .rule-item, .important-note, .faction-section, .safe-zones-list li, .robbery-category');
        
        elements.forEach(element => {
            const elementPosition = element.getBoundingClientRect().top;
            const screenPosition = window.innerHeight / 1.3;
            
            if (elementPosition < screenPosition) {
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }
        });
    };

    // Inicializar elementos con opacidad 0
    const elementsToAnimate = document.querySelectorAll('.rule-card, .rule-item, .important-note, .faction-section, .safe-zones-list li, .robbery-category');
    elementsToAnimate.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        element.style.transition = 'all 0.6s ease';
    });

    // Ejecutar animación al cargar la página y al hacer scroll
    animateOnScroll();
    window.addEventListener('scroll', animateOnScroll);

    // Añadir efecto de hover a los elementos de lista
    const listItems = document.querySelectorAll('.rule-details li, .sanction-list li, .ck-list li, .safe-zones-list li');
    listItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            const icon = this.querySelector('i');
            if (icon) {
                icon.style.transform = 'scale(1.2)';
                icon.style.color = '#ff69b4';
            }
        });
        // Añadir después del código existente
        // Mejorar la visualización de comandos de rol
        document.addEventListener('DOMContentLoaded', function() {
        // Convertir comandos de rol en elementos code
        const vehicleRules = document.querySelectorAll('.rule-details li span');
        vehicleRules.forEach(rule => {
        rule.innerHTML = rule.innerHTML.replace(/\/([a-z]+)/g, '<code>/$1</code>');
        });
        
        // Añadir tooltips a términos técnicos
        const technicalTerms = {
        '4x4': 'Vehículos con tracción a las cuatro ruedas, ideales para terrenos difíciles',
        'km/h': 'Kilómetros por hora, unidad de medida de velocidad',
        'rueda pinchada': 'Neumático dañado que impide el funcionamiento normal del vehículo'
        };
        
        for (const term in technicalTerms) {
        const regex = new RegExp(`(${term})`, 'gi');
        vehicleRules.forEach(rule => {
        rule.innerHTML = rule.innerHTML.replace(regex, `<span class="tooltip-term" data-tooltip="${technicalTerms[term]}">$1</span>`);
        });
        }
        
        // Añadir clase especial a los elementos de vehículos para animaciones
        const vehicleIcons = document.querySelectorAll('.rule-item:has(i.fa-car) i');
        vehicleIcons.forEach(icon => {
        icon.classList.add('vehicle-icon');
        });
        });
    });
    // Añadir efecto de pulsación al logo flotante
    floatingLogo.addEventListener('click', function() {
        this.style.transform = 'scale(1.5)';
        this.style.opacity = '1';
        
        setTimeout(() => {
            this.style.transform = '';
            this.style.opacity = '0.7';
        }, 500);
    });

    // Añadir badges de FloridaRP a las secciones importantes
    const importantSections = document.querySelectorAll('.rule-card, .faction-section');
    importantSections.forEach(section => {
        const badge = document.createElement('div');
        badge.className = 'florida-badge';
        section.appendChild(badge);
    });

    // Añadir efecto de partículas en el fondo (opcional, solo si el rendimiento lo permite)
    const createParticles = function() {
        const particlesContainer = document.createElement('div');
        particlesContainer.className = 'particles-container';
        body.appendChild(particlesContainer);
        
        for (let i = 0; i < 30; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            
            // Posición aleatoria
            const posX = Math.random() * 100;
            const posY = Math.random() * 100;
            
            // Tamaño aleatorio
            const size = Math.random() * 5 + 1;
            
            // Duración aleatoria
            const duration = Math.random() * 20 + 10;
            
            // Retraso aleatorio
            const delay = Math.random() * 5;
            
            particle.style.left = `${posX}%`;
            particle.style.top = `${posY}%`;
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            particle.style.animationDuration = `${duration}s`;
            particle.style.animationDelay = `${delay}s`;
            
            particlesContainer.appendChild(particle);
        }
    };
    
    // Verificar si el dispositivo tiene suficiente rendimiento para las partículas
    if (!(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent))) {
        createParticles();
    }

    // Añadir botón para volver arriba
    const scrollTopBtn = document.createElement('button');
    scrollTopBtn.className = 'scroll-top-btn';
    scrollTopBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
    body.appendChild(scrollTopBtn);
    
    scrollTopBtn.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    // Mostrar/ocultar botón según la posición del scroll
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            scrollTopBtn.style.opacity = '1';
            scrollTopBtn.style.transform = 'translateY(0)';
        } else {
            scrollTopBtn.style.opacity = '0';
            scrollTopBtn.style.transform = 'translateY(20px)';
        }
    });

    // Añadir efecto de resaltado a las palabras clave
    const highlightKeywords = function() {
        const textElements = document.querySelectorAll('.rule-details li span, .sanction-list li span, p');
        
        const keywords = ['FloridaRP', 'Staff', 'Baneo', 'Sanción', 'Permanente', 'Temporal', 'Advertencia', 'Prohibido', 'Obligatorio'];
        
        textElements.forEach(element => {
            keywords.forEach(keyword => {
                const regex = new RegExp(`(${keyword})`, 'gi');
                element.innerHTML = element.innerHTML.replace(regex, '<span class="keyword-highlight">$1</span>');
            });
        });
    };
    
    highlightKeywords();
});