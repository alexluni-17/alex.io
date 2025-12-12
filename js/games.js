// Game Data
const gamesData = [
    {
        id: 'tris',
        title: 'Tris',
        category: 'Strategy',
        image: 'https://i.pinimg.com/1200x/5e/03/d6/5e03d66f11fe9d6e806c8f1b6e2da35c.jpg',
        link: '#', // Placeholder or specific page if it exists
        is18Plus: false,
        rating: 4.5
    },
    {
        id: 'jeopardy',
        title: 'Jeopardy',
        category: 'Trivia',
        image: 'https://i.pinimg.com/1200x/5e/03/d6/5e03d66f11fe9d6e806c8f1b6e2da35c.jpg', // Using same placeholder for now as seen in index.html
        link: '#',
        is18Plus: false,
        rating: 4.8
    },
    {
        id: 'mr-white',
        title: 'Mr. White',
        category: 'Arcade',
        image: 'https://i.pinimg.com/1200x/5e/03/d6/5e03d66f11fe9d6e806c8f1b6e2da35c.jpg',
        link: '#',
        is18Plus: false,
        rating: 4.2
    },
    {
        id: 'asso',
        title: 'Asso',
        category: 'Card',
        image: 'https://i.pinimg.com/1200x/5e/03/d6/5e03d66f11fe9d6e806c8f1b6e2da35c.jpg',
        link: '#',
        is18Plus: false,
        rating: 4.0
    },
    // Placeholder for 18+ to test filter
    {
        id: 'poker-night',
        title: 'Poker Night',
        category: 'Casino',
        image: 'https://i.pinimg.com/236x/8e/18/d1/8e18d172088f6154564c48971f1146d9.jpg', // Random generic placeholder
        link: '#',
        is18Plus: true,
        rating: 4.9
    }
];

// Current filter state
let currentFilter = 'normal'; // 'normal' or '18+'

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initGames();
});

function initGames() {
    setupFilters();
    renderGames(currentFilter);
}

function setupFilters() {
    const filterTags = document.querySelectorAll('.filter-tag');
    filterTags.forEach(tag => {
        tag.addEventListener('click', (e) => {
            // Update active state
            document.querySelector('.filter-tag.active')?.classList.remove('active');
            e.target.classList.add('active');

            // Update filter
            const filterType = e.target.dataset.filter; // 'normal' or '18+'
            currentFilter = filterType;
            renderGames(currentFilter);
        });
    });
}

function renderGames(filter) {
    const grid = document.getElementById('games-grid');
    if (!grid) return;

    grid.innerHTML = ''; // Clear existing

    // Filter logic
    const filteredGames = gamesData.filter(game => {
        if (filter === 'normal') return !game.is18Plus;
        if (filter === '18+') return game.is18Plus;
        return true; // 'all'
    });

    // Render cards
    filteredGames.forEach(game => {
        const cardHTML = `
            <a href="${game.link}" class="modern-card fade-in">
                <div class="card-image-area">
                    <img src="${game.image}" alt="${game.title}" loading="lazy">
                </div>
                <div class="card-badge" style="display: ${game.is18Plus ? 'block' : 'none'}; background: #000;">18+</div>
                <div class="card-info">
                    <h4 class="card-title">${game.title}</h4>
                    <div class="card-meta">
                        <span>${game.category}</span>
                    </div>
                </div>
            </a>
        `;
        grid.insertAdjacentHTML('beforeend', cardHTML);
    });
    
    // Trigger animations
    const cards = grid.querySelectorAll('.fade-in');
    cards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
    });
}
