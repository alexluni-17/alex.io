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
    { id: 1, title: "Poker Texas", type: "Game", icon: "♠️" },
    { id: 2, title: "Blackjack Live", type: "Game", icon: "♦️" },
    { id: 3, title: "Slot Arcade", type: "Game", icon: "🎰" },
    { id: 4, title: "Profilo Utente", type: "Setting", icon: "👤" },
    { id: 5, title: "Impostazioni Privacy", type: "Setting", icon: "⚙️" },
    { id: 6, title: "Torneo Settimanale", type: "Event", icon: "🏆" },
    { id: 7, title: "Amici Online", type: "Social", icon: "🟢" },
    { id: 8, title: "Negozio", type: "Shop", icon: "🛒" },
    { id: 9, title: "Torneo Pro", type: "Event", icon: "🎮" },
    { id: 10, title: "Sfida Live", type: "Event", icon: "⚔️" },
    { id: 11, title: "Arcade Infinity", type: "Game mode", icon: "🕹️" },
    { id: 12, title: "VR World", type: "Map", icon: "🥽" },
    { id: 13, title: "Livello 12", type: "Stat", icon: "⭐" },
    { id: 14, title: "Vittorie (504)", type: "Stat", icon: "🏅" },
    { id: 15, title: "Rank Gold", type: "Stat", icon: "🥇" }
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
    const fab = document.querySelector('.center-btn'); 
    
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
        container.innerHTML = `<div style="text-align:center; color:#b2bec3; margin-top:20px;">Nessun risultato trovato.</div>`;
        return;
    }

    const html = items.map((item, index) => `
        <div class="result-row" style="animation-delay: ${index * 0.05}s">
            <div style="font-size: 1.5rem;">${item.icon}</div>
            <div>
                <h4 style="margin:0; font-weight:600; color:#2d3436;">${item.title}</h4>
                <p style="margin:0; font-size:0.8rem; color:#b2bec3;">${item.type}</p>
            </div>
        </div>
    `).join('');

    container.innerHTML = html;
}