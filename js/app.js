/**
 * APP.JS - Logica Principale
 * Struttura:
 * 1. Dati (Mock Data)
 * 2. Gestione Navigazione (Menu Inferiore)
 * 3. Gestione Ricerca (Overlay & Filtri)
 * 4. Inizializzazione
 */

document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initSearch();
    initLoader();
});

// ============================================================
// 0. LOADER SYSTEM
// ============================================================
function initLoader() {
    const loader = document.getElementById('app-loader');
    if (!loader) return;

    // Tempo minimo di visualizzazione (per evitare flash troppo rapidi)
    const minLoadTime = new Promise(resolve => setTimeout(resolve, 1500));

    // Promise che attende le immagini O un timeout di sicurezza (es. 5s)
    const imagesPromise = new Promise(resolve => {
        const images = Array.from(document.querySelectorAll('img'));
        const validImages = images.filter(img => img.src && !img.complete);

        if (validImages.length === 0) {
            resolve(); 
            return;
        }

        let loadedCount = 0;
        const total = validImages.length;
        const checkDone = () => {
            loadedCount++;
            if (loadedCount === total) resolve();
        };

        validImages.forEach(img => {
            img.onload = checkDone;
            img.onerror = checkDone; 
        });
    });

    // Timeout di sicurezza: se le immagini non caricano entro 5 secondi, sblocca comunque
    const safetyTimeout = new Promise(resolve => setTimeout(resolve, 5000));

    // Vinci chi arriva prima tra ImmaginiComplete e TimeoutSicurezza
    const resourceLoading = Promise.race([imagesPromise, safetyTimeout]);

    // Attendi sia il tempo minimo (1.5s) SIA il caricamento (o timeout 5s)
    Promise.all([minLoadTime, resourceLoading]).then(() => {
        loader.classList.add('hidden');
        setTimeout(() => {
             loader.style.display = 'none';
        }, 500);
    });
}

// ============================================================
// 1. MOCK DATA (Contenuto per la ricerca)
// ============================================================
const appData = [
    { id: 1, title: "Torneo Pro", type: "Esports", icon: "🎮", link: "index.html" },
    { id: 2, title: "Sfida Live", type: "Multiplayer", icon: "⚔️", link: "giochi.html" },
    { id: 3, title: "Arcade", type: "Endless Run", icon: "🕹️", link: "giochi.html" },
    { id: 4, title: "VR World", type: "Immersive", icon: "🥽", link: "giochi.html" },
    { id: 5, title: "Poker Night", type: "Card Game", icon: "♠️", link: "giochi.html" },
    { id: 6, title: "Scacchi 3D", type: "Strategy", icon: "♟️", link: "giochi.html" }
];

// ============================================================
// 2. GESTIONE NAVIGAZIONE (Nuova Tab Bar)
// ============================================================
function initNavigation() {
    // La navigazione è gestita nativamente tramite href nei file HTML.
    // Manteniamo questa funzione solo per eventuali logiche future o per gestire
    // lo stato "active" se volessimo farlo via JS (ma ora è hardcoded nelle pagine).
    console.log("Navigation initialized (Native Mode)");
}

// ============================================================
// 3. GESTIONE RICERCA (Overlay & Logic)
// ============================================================
function initSearch() {
    // Elementi DOM
    // Selettore aggiornato per il nuovo tasto nella header (o fallback se esiste ancora altrove)
    const fab = document.querySelector('.search-trigger-btn') || document.querySelector('.center-btn'); 
    
    const overlay = document.getElementById('search-overlay');
    const closeBtn = document.getElementById('close-search-btn');
    const input = document.getElementById('global-search-input');
    const resultsArea = document.getElementById('search-results-container');

    // Guard Clause: Verifica che TUTTI gli elementi necessari esistano
    if (!fab || !overlay || !closeBtn || !input) return;

    // 3a. Apri Ricerca
    fab.addEventListener('click', () => {
        overlay.classList.remove('hidden');
        input.value = ''; // Reset input
        resultsArea.innerHTML = ''; // Reset risultati
        setTimeout(() => input.focus(), 100); // Focus dopo animazione
    });

    // 3b. Chiudi Ricerca
    closeBtn.addEventListener('click', () => {
        overlay.classList.add('hidden');
    });

    // 3c. Logica di Filtro (Live Search)
    input.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        
        // Pulisci area se vuoto
        if (query.length === 0) {
            resultsArea.innerHTML = '';
            return;
        }

        // Filtra Array
        const matches = appData.filter(item => 
            item.title.toLowerCase().includes(query) || 
            item.type.toLowerCase().includes(query)
        );

        // Renderizza Risultati
        renderResults(matches, resultsArea);
    });
}

// Funzione Helper per HTML dei risultati
function renderResults(items, container) {
    if (items.length === 0) {
        container.innerHTML = `<div style="text-align:center; color:#888; margin-top:20px;">Nessun risultato trovato.</div>`;
        return;
    }

    const html = items.map((item, index) => `
        <a href="${item.link}" class="result-row" style="animation-delay: ${index * 0.05}s; text-decoration: none;">
            <div style="font-size: 1.5rem;">${item.icon}</div>
            <div>
                <h4 style="margin:0; font-weight:700; color:#1a1a1a;">${item.title}</h4>
                <p style="margin:0; font-size:0.8rem; color:#666;">${item.type}</p>
            </div>
        </a>
    `).join('');

    container.innerHTML = html;
}