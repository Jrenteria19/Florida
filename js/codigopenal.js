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

// Define articles array at the top level
const articles = [
    {
        id: "Art. 1",
        description: "Homicidio en primer grado",
        sanction: "30 años de prisión",
        category: "major"
    },
    {
        id: "Art. 2",
        description: "Robo con violencia",
        sanction: "10 años de prisión",
        category: "major"
    },
    {
        id: "Art. 3",
        description: "Hurto menor",
        sanction: "6 meses de prisión",
        category: "minor"
    },
    {
        id: "Art. 4",
        description: "Conducir bajo los efectos del alcohol",
        sanction: "Multa de $5,000",
        category: "infraction"
    },
    {
        id: "Art. 5",
        description: "Vandalismo",
        sanction: "1 año de prisión",
        category: "minor"
    },
    {
        id: "Art. 6",
        description: "Exceso de velocidad",
        sanction: "Multa de $1,000",
        category: "infraction"
    },
    {
        id: "Art. 1.1",
        description: "Asesinato premeditado",
        sanction: "Cadena perpetua",
        category: "major"
    },
    {
        id: "Art. 1.2",
        description: "Homicidio involuntario",
        sanction: "15 años de prisión",
        category: "major"
    },
    {
        id: "Art. 2.1",
        description: "Robo a mano armada",
        sanction: "20 años de prisión",
        category: "major"
    },
    {
        id: "Art. 2.2",
        description: "Hurto menor ($500 o menos)",
        sanction: "1 año de prisión + Multa $1,000",
        category: "minor"
    },
    {
        id: "Art. 3.1",
        description: "Tráfico de drogas",
        sanction: "25 años de prisión",
        category: "major"
    },
    {
        id: "Art. 3.2",
        description: "Posesión de drogas",
        sanction: "5 años de prisión",
        category: "minor"
    },
    {
        id: "Art. 4.1",
        description: "Conducción temeraria",
        sanction: "Multa $2,000 + Suspensión de licencia",
        category: "infraction"
    },
    {
        id: "Art. 4.2",
        description: "Estacionamiento en zona prohibida",
        sanction: "Multa $200",
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