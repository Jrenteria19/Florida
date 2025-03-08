document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.querySelector('.search-input');
    const filterButtons = document.querySelectorAll('.filter-btn');
    let currentCategory = 'all';
    let currentSearch = '';
    
    // Initial render
    renderArticles(articles);
    
    // Handle search functionality
    searchInput.addEventListener('input', function(e) {
        currentSearch = e.target.value.toLowerCase();
        filterAndRenderArticles();
    });
    
    // Handle filter buttons
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            currentCategory = this.dataset.category;
            filterAndRenderArticles();
        });
    });
    
    function filterAndRenderArticles() {
        let filteredArticles = articles;
        
        // Filter by category
        if (currentCategory !== 'all') {
            filteredArticles = filteredArticles.filter(article => article.category === currentCategory);
        }
        
        // Filter by search term
        if (currentSearch) {
            filteredArticles = filteredArticles.filter(article => 
                article.id.toLowerCase().includes(currentSearch) || 
                article.description.toLowerCase().includes(currentSearch) ||
                article.sanction.toLowerCase().includes(currentSearch)
            );
        }
        
        renderArticles(filteredArticles);
    }
});

const articles = [
    // Delitos graves (major)
    {
        id: "Art. 1",
        description: "Homicidio",
        sanction: "30 años de prisión + $10,000,000 CLP",
        category: "major"
    },
    {
        id: "Art. 2",
        description: "Robo a mano armada",
        sanction: "10 años de prisión + $5,000,000 CLP + Retención del vehículo",
        category: "major"
    },
    {
        id: "Art. 3",
        description: "Secuestro",
        sanction: "20 años de prisión + $8,000,000 CLP",
        category: "major"
    },
    {
        id: "Art. 4",
        description: "Agresión con arma blanca",
        sanction: "15 años de prisión + $6,000,000 CLP + Retención del arma",
        category: "major"
    },
    {
        id: "Art. 5",
        description: "Huida de la justicia",
        sanction: "5 años de prisión + $3,000,000 CLP + Retención del vehículo",
        category: "major"
    },
    {
        id: "Art. 6",
        description: "Conducción temeraria",
        sanction: "2 años de prisión + $2,000,000 CLP + Suspensión de licencia de conducir por 1 año",
        category: "major"
    },
    {
        id: "Art. 7",
        description: "Suplantación de identidad",
        sanction: "5 años de prisión + $4,000,000 CLP",
        category: "major"
    },

    // Delitos menores (minor)
    {
        id: "Art. 8",
        description: "Hurto menor",
        sanction: "6 meses de prisión + $500,000 CLP",
        category: "minor"
    },
    {
        id: "Art. 9",
        description: "Vandalismo",
        sanction: "1 año de prisión + $1,000,000 CLP",
        category: "minor"
    },
    {
        id: "Art. 10",
        description: "Agresión física leve",
        sanction: "6 meses de prisión + $500,000 CLP",
        category: "minor"
    },
    {
        id: "Art. 11",
        description: "Daño a propiedad privada",
        sanction: "1 año de prisión + $2,000,000 CLP",
        category: "minor"
    },
    {
        id: "Art. 12",
        description: "Falsificación de documentos",
        sanction: "2 años de prisión + $3,000,000 CLP",
        category: "minor"
    },
    {
        id: "Art. 13",
        description: "Intento de robo",
        sanction: "1 año de prisión + $1,000,000 CLP",
        category: "minor"
    },
    {
        id: "Art. 14",
        description: "Evitar ser identificado",
        sanction: "6 meses de prisión + $500,000 CLP",
        category: "minor"
    },

    // Infracciones (infraction)
    {
        id: "Art. 15",
        description: "Conducir bajo los efectos del alcohol",
        sanction: "Multa de $5,000,000 CLP + Suspensión de licencia de conducir por 1 año",
        category: "infraction"
    },
    {
        id: "Art. 16",
        description: "Exceso de velocidad",
        sanction: "Multa de $1,000,000 CLP",
        category: "infraction"
    },
    {
        id: "Art. 17",
        description: "Estacionamiento en zona prohibida",
        sanction: "Multa $200,000 CLP",
        category: "infraction"
    },
    {
        id: "Art. 18",
        description: "No usar cinturón de seguridad",
        sanction: "Multa $100,000 CLP",
        category: "infraction"
    },
    {
        id: "Art. 19",
        description: "No respetar señales de tránsito",
        sanction: "Multa $150,000 CLP",
        category: "infraction"
    },
    {
        id: "Art. 20",
        description: "Uso excesivo del claxon",
        sanction: "Multa $50,000 CLP",
        category: "infraction"
    },
    {
        id: "Art. 21",
        description: "Circular sin luces en la noche",
        sanction: "Multa $100,000 CLP",
        category: "infraction"
    },
    {
        id: "Art. 22",
        description: "No respetar el paso peatonal",
        sanction: "Multa $200,000 CLP",
        category: "infraction"
    },
    {
        id: "Art. 23",
        description: "Conducir sin licencia",
        sanction: "Multa $1,000,000 CLP + Retención del vehículo",
        category: "infraction"
    },
    {
        id: "Art. 24",
        description: "No portar documentación del vehículo",
        sanction: "Multa $80,000 CLP",
        category: "infraction"
    },
    {
        id: "Art. 25",
        description: "Circular en sentido contrario",
        sanction: "Multa $300,000 CLP + Suspensión de licencia de conducir por 3 meses",
        category: "infraction"
    },
    {
        id: "Art. 26",
        description: "Evadir un control policial",
        sanction: "Multa $500,000 CLP + Retención del vehículo",
        category: "infraction"
    }
];

// Function to render articles
function renderArticles(filteredArticles) {
    const container = document.querySelector('#codigo-penal-content');
    
    if (filteredArticles.length === 0) {
        container.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search-minus"></i>
                <p>No se encontraron artículos que coincidan con tu búsqueda. Intenta con otros términos o categoría.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>Artículo</th>
                    <th>Descripción</th>
                    <th>Sanción</th>
                </tr>
            </thead>
            <tbody>
                ${filteredArticles.map(article => `
                    <tr data-category="${article.category}">
                        <td class="article-id">${article.id}</td>
                        <td class="article-description">${article.description}</td>
                        <td class="article-sanction">${article.sanction}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    
    // Añadir efecto de aparición gradual a las filas
    const rows = container.querySelectorAll('tbody tr');
    rows.forEach((row, index) => {
        row.style.opacity = '0';
        row.style.transform = 'translateY(20px)';
        setTimeout(() => {
            row.style.transition = 'all 0.3s ease';
            row.style.opacity = '1';
            row.style.transform = 'translateY(0)';
        }, 50 * index);
    });
}

// Single DOMContentLoaded event listener
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.querySelector('.search-input');
    const filterButtons = document.querySelectorAll('.filter-btn');
    let currentCategory = 'all';
    let currentSearch = '';
    
    // Initial render
    renderArticles(articles);
    
    // Handle search functionality
    searchInput.addEventListener('input', function(e) {
        currentSearch = e.target.value.toLowerCase();
        filterAndRenderArticles();
    });
    
    // Handle filter buttons
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            currentCategory = this.dataset.category;
            filterAndRenderArticles();
        });
    });
    
    function filterAndRenderArticles() {
        let filteredArticles = articles;
        
        // Filter by category
        if (currentCategory !== 'all') {
            filteredArticles = filteredArticles.filter(article => article.category === currentCategory);
        }
        
        // Filter by search term
        if (currentSearch) {
            filteredArticles = filteredArticles.filter(article => 
                article.id.toLowerCase().includes(currentSearch) || 
                article.description.toLowerCase().includes(currentSearch) ||
                article.sanction.toLowerCase().includes(currentSearch)
            );
        }
        
        renderArticles(filteredArticles);
    }
});