document.addEventListener('DOMContentLoaded', () => {
    // --- CONFIGURAZIONE CANVAS ---
    const canvas = document.getElementById('wheelCanvas');
    const ctx = canvas.getContext('2d');
    
    // Gestione Risoluzione Retina (HiDPI)
    // Manteniamo la risoluzione interna alta (600x600) anche se il CSS la scala visivamente
    const scale = window.devicePixelRatio || 1;
    const baseSize = 600; 
    
    canvas.width = baseSize * scale;
    canvas.height = baseSize * scale;
    ctx.scale(scale, scale);
    
    const cw = baseSize;
    const ch = baseSize;
    const cx = cw / 2;
    const cy = ch / 2;
    const radius = 270; // Raggio leggermente ridotto per lasciare margine

    // --- DATI INIZIALI ---
    let names = [
        "Ali", "Beatriz", "Carlo", "Diya", 
        "Eric", "Fatima", "Gabriele", "Hanna"
    ];

    // Palette Colori (Vividi e Moderni)
    const colors = [
        '#FF3F34', // Red (Scuro)
        '#0BE881', // Green (Chiaro) -> TESTO NERO
        '#3C40C6', // Blue (Scuro)
        '#FFC048', // Orange (Chiaro) -> TESTO NERO
        '#17c0eb', // Cyan (Chiaro) -> TESTO NERO
        '#8E44AD', // Purple (Scuro)
        '#ffb8b8', // Pink (Chiaro) -> TESTO NERO
        '#fff200'  // Yellow (Chiaro) -> TESTO NERO
    ];

    // Lista dei colori che richiedono testo scuro per leggibilità
    const lightColors = ['#0BE881', '#FFC048', '#17c0eb', '#ffb8b8', '#fff200'];

    // --- STATO DEL GIOCO ---
    let currentRotation = 0; // Angolo attuale
    let isSpinning = false;
    let spinVelocity = 0;
    let spinFriction = 0.980; // Decelerazione (più basso = frena prima)

    // --- ELEMENTI DOM ---
    const namesInput = document.getElementById('names-input');
    const entriesCount = document.getElementById('entries-count');
    const clearBtn = document.getElementById('clear-btn');
    const shuffleBtn = document.getElementById('shuffle-btn');
    
    // Elementi Modale Vincitore
    const winnerModal = document.getElementById('winner-modal');
    const winnerNameDisplay = document.getElementById('winner-name-display');
    const closeXBtn = document.getElementById('close-winner-x');     // La X in alto
    const closeModalBtn = document.getElementById('modal-close-btn'); // Bottone "Chiudi"
    const removeWinnerBtn = document.getElementById('modal-remove-btn'); // Bottone "Rimuovi"

    // --- INIZIALIZZAZIONE ---
    function init() {
        // Popola la textarea con i nomi iniziali
        namesInput.value = names.join('\n');
        updateUI();
        drawWheel();
        animate(); // Avvia il loop di animazione
    }

    // --- MOTORE GRAFICO (DRAW) ---
    function drawWheel() {
        // Pulisci il canvas
        ctx.clearRect(0, 0, cw, ch);

        // Caso: Nessun nome inserito
        if (names.length === 0) {
            ctx.save();
            ctx.beginPath();
            ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
            ctx.fillStyle = "#f5f5f5"; // Sfondo grigio vuoto
            ctx.fill();
            ctx.strokeStyle = "#e0e0e0";
            ctx.lineWidth = 2;
            ctx.stroke();
            
            ctx.font = "bold 30px Outfit, sans-serif";
            ctx.fillStyle = "#ccc";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("Aggiungi nomi", cx, cy);
            ctx.restore();
            return;
        }

        const arcSize = (2 * Math.PI) / names.length;

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(currentRotation);

        names.forEach((name, i) => {
            const angle = i * arcSize;
            const color = colors[i % colors.length];
            
            // 1. Disegna Spicchio
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.arc(0, 0, radius, angle, angle + arcSize);
            ctx.closePath();
            ctx.fillStyle = color;
            ctx.fill();
            
            // Bordo bianco tra gli spicchi per pulizia visiva
            ctx.lineWidth = 4;
            ctx.strokeStyle = "#ffffff";
            ctx.stroke();

            // 2. Disegna Testo
            ctx.save();
            // Ruota per allineare il testo al centro dello spicchio
            ctx.rotate(angle + arcSize / 2);
            ctx.textAlign = "right";
            ctx.textBaseline = "middle";
            ctx.font = "bold 28px Outfit, sans-serif";

            // LOGICA COLORE TESTO (Bianco vs Nero)
            if (lightColors.includes(color)) {
                ctx.fillStyle = "#1a1a1a"; // Nero per sfondi chiari
                ctx.shadowColor = "transparent";
            } else {
                ctx.fillStyle = "#ffffff"; // Bianco per sfondi scuri
                ctx.shadowColor = "rgba(0,0,0,0.3)";
                ctx.shadowBlur = 4;
                ctx.shadowOffsetX = 1;
                ctx.shadowOffsetY = 1;
            }

            // TRONCAMENTO TESTO (Se > 14 caratteri)
            let displayName = name;
            if (name.length > 14) {
                displayName = name.substring(0, 12) + "...";
            }

            // Disegna il testo leggermente staccato dal bordo esterno
            ctx.fillText(displayName, radius - 30, 0);
            ctx.restore();
        });

        ctx.restore();

        // 3. Cerchio Centrale (Donut Style)
        // Crea l'effetto "buco" al centro
        ctx.beginPath();
        ctx.arc(cx, cy, 50, 0, 2 * Math.PI);
        ctx.fillStyle = "#ffffff";
        ctx.fill();
        // Ombra interna leggera
        ctx.shadowColor = "rgba(0,0,0,0.15)";
        ctx.shadowBlur = 10;
        ctx.stroke();
    }

    // --- FISICA E ANIMAZIONE ---
    function animate() {
        if (isSpinning) {
            currentRotation += spinVelocity;
            spinVelocity *= spinFriction; // Applica attrito

            // Condizione di arresto
            if (spinVelocity < 0.002) {
                isSpinning = false;
                spinVelocity = 0;
                determineWinner();
            }
        }
        drawWheel(); // Ridisegna sempre
        requestAnimationFrame(animate);
    }

    function triggerSpin() {
        if (isSpinning || names.length === 0) return;
        
        // Calcola una forza casuale
        // Random tra 25 e 45 (velocità)
        const baseSpeed = 25 + Math.random() * 20; 
        spinVelocity = baseSpeed * 0.015; // Scala per i radianti
        isSpinning = true;
    }

    // Tap sulla ruota per girare
    canvas.addEventListener('click', triggerSpin);
    // Supporto touch per mobile (spesso click basta, ma questo migliora la reattività)
    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault(); // Evita doppio evento click
        triggerSpin();
    }, {passive: false});

    // --- LOGICA VINCITORE ---
    function determineWinner() {
        // La freccia è a ORE 3 (0 radianti in Canvas standard)
        // Ma noi ruotiamo l'intero contesto.
        
        const arcSize = (2 * Math.PI) / names.length;
        
        // Normalizza la rotazione tra 0 e 2PI
        let normalizedRotation = currentRotation % (2 * Math.PI);
        if (normalizedRotation < 0) normalizedRotation += 2 * Math.PI;
        
        // Calcolo inverso: Quale spicchio tocca l'angolo 0?
        // Formula: (2PI - rotazione) % 2PI
        let pointerAngle = (2 * Math.PI - normalizedRotation) % (2 * Math.PI);
        
        const winningIndex = Math.floor(pointerAngle / arcSize);
        
        // Controllo di sicurezza sull'indice
        if (winningIndex >= 0 && winningIndex < names.length) {
            const winnerName = names[winningIndex];
            showWinnerModal(winnerName);
        }
    }

    // --- GESTIONE INTERFACCIA (UI) ---
    
    // 1. Aggiornamento Live dalla Textarea
    namesInput.addEventListener('input', () => {
        const raw = namesInput.value;
        // Filtra righe vuote
        const newNames = raw.split('\n').map(n => n.trim()).filter(n => n.length > 0);
        
        names = newNames;
        updateUI();
        drawWheel();
    });

    // 2. Bottone Pulisci
    clearBtn.addEventListener('click', () => {
        if(confirm("Vuoi cancellare tutti i nomi?")) {
            names = [];
            namesInput.value = "";
            updateUI();
            drawWheel();
        }
    });

    // 3. Bottone Shuffle (Mischia)
    shuffleBtn.addEventListener('click', () => {
        if (names.length < 2) return;
        // Algoritmo Fisher-Yates semplificato
        names.sort(() => Math.random() - 0.5);
        namesInput.value = names.join('\n');
        drawWheel();
    });

    function updateUI() {
        entriesCount.textContent = names.length;
        // Disabilita shuffle se pochi nomi
        if (names.length < 2) shuffleBtn.style.opacity = "0.5";
        else shuffleBtn.style.opacity = "1";
    }

    // --- GESTIONE MODALE VINCITORE ---
    function showWinnerModal(name) {
        winnerNameDisplay.textContent = name;
        winnerModal.classList.remove('hidden');
        // Qui potresti lanciare coriandoli JS se volessi
    }

    function hideWinnerModal() {
        winnerModal.classList.add('hidden');
    }

    // Listener per chiusura modale
    closeXBtn.addEventListener('click', hideWinnerModal);
    closeModalBtn.addEventListener('click', hideWinnerModal);

    // Listener per rimozione vincitore
    removeWinnerBtn.addEventListener('click', () => {
        const winner = winnerNameDisplay.textContent;
        
        // Rimuovi il nome dall'array
        // Nota: Rimuove solo la prima occorrenza se ce ne sono doppi
        const index = names.indexOf(winner);
        if (index > -1) {
            names.splice(index, 1);
        }
        
        // Aggiorna Textarea e UI
        namesInput.value = names.join('\n');
        updateUI();
        drawWheel();
        
        hideWinnerModal();
    });

    // Chiudi modale cliccando fuori dalla card (Overlay)
    winnerModal.addEventListener('click', (e) => {
        if (e.target === winnerModal) {
            hideWinnerModal();
        }
    });

    // Avvio applicazione
    init();
});