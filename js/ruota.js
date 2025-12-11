document.addEventListener('DOMContentLoaded', () => {
    // --- CONFIGURAZIONE CANVAS ---
    const canvas = document.getElementById('wheelCanvas');
    const ctx = canvas.getContext('2d', { alpha: false }); // Performance boost

    // --- STATO DEL GIOCO (MOVED UP) ---
    let currentRotation = 0;
    let isSpinning = false;
    let spinVelocity = 0;
    let initialVelocity = 0; // Per easing dinamico
    let needsRedraw = true; // Flag per rendering ottimizzato
    let inputTimeout; // Per debouncing
    
    // Gestione Risoluzione Retina (HiDPI) - Ottimizzato
    const setupCanvas = () => {
        const dpr = window.devicePixelRatio || 1;
        // Usa getBoundingClientRect per ottenere la grandezza reale visualizzata (controllata da CSS)
        const rect = canvas.getBoundingClientRect();
        
        // Imposta la dimensione del buffer interno
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        
        // Scala il contesto per disegnare usando coordinate logiche
        // NOTA: Calcoliamo lo scale factor basato sulla dimensione base desiderata (600x600)
        // in modo che drawWheel possa usare sempre coordinate fisse (radius=270, etc)
        const scaleX = (rect.width * dpr) / 600;
        const scaleY = (rect.height * dpr) / 600;
        ctx.setTransform(scaleX, 0, 0, scaleY, 0, 0); // Use setTransform to reset and scale
        
        // NON impostare style.width/height qui, lascia che sia il CSS a gestirlo
        // canvas.style.width = ... (RIMOSSO)
        
        needsRedraw = true;
    };
    
    // Chiamata iniziale e al resize
    setupCanvas();
    
    const baseSize = 600;
    const cw = baseSize;
    const ch = baseSize;
    const cx = cw / 2;
    const cy = ch / 2;
    const radius = 270;

    // --- DATI INIZIALI ---
    let names = [
        "Ali", "Beatriz", "Carlo", "Diya", 
        "Eric", "Fatima", "Gabriele", "Hanna"
    ];

    // Palette Colori (Vividi e Moderni)
    const colors = [
        '#FF3F34', '#0BE881', '#3C40C6', '#FFC048',
        '#17c0eb', '#8E44AD', '#ffb8b8', '#fff200'
    ];

    const lightColors = ['#0BE881', '#FFC048', '#17c0eb', '#ffb8b8', '#fff200'];

    // --- ELEMENTI DOM ---
    // const namesInput = document.getElementById('names-input'); (REMOVED)
    // const entriesCount = document.getElementById('entries-count'); (REMOVED)
    const clearBtn = document.getElementById('clear-btn');
    // const shuffleBtn = document.getElementById('shuffle-btn'); (REMOVED)
    
    const winnerModal = document.getElementById('winner-modal');
    const winnerNameDisplay = document.getElementById('winner-name-display');
    const closeXBtn = document.getElementById('close-winner-x');
    const closeModalBtn = document.getElementById('modal-close-btn');
    const removeWinnerBtn = document.getElementById('modal-remove-btn');

    // --- INIZIALIZZAZIONE ---
    function init() {
        // namesInput.value = names.join('\n'); (REMOVED)
        updateUI();
        drawWheel();
        animate(); // Avvia il loop
    }

    // --- MOTORE GRAFICO OTTIMIZZATO ---
    function drawWheel() {
        // Pulisci il canvas
        ctx.clearRect(0, 0, cw, ch);

        // Caso: Nessun nome
        if (names.length === 0) {
            ctx.save();
            ctx.beginPath();
            ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
            ctx.fillStyle = "#f5f5f5";
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
        // Sposta al centro LOGICO (300, 300) dato che abbiamo scalato il contesto
        ctx.translate(300, 300);
        ctx.rotate(currentRotation);

        // Disegna spicchi e testo
        names.forEach((name, i) => {
            const angle = i * arcSize;
            const color = colors[i % colors.length];
            
            // 1. Spicchio
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.arc(0, 0, radius, angle, angle + arcSize);
            ctx.closePath();
            ctx.fillStyle = color;
            ctx.fill();
            
            // Bordo bianco
            ctx.lineWidth = 4;
            ctx.strokeStyle = "#ffffff";
            ctx.stroke();

            // 2. Testo - OTTIMIZZATO
            ctx.save();
            ctx.rotate(angle + arcSize / 2);
            ctx.textAlign = "right";
            ctx.textBaseline = "middle";
            ctx.font = "bold 28px Outfit, sans-serif";

            // Colore testo pre-calcolato
            const textColor = lightColors.includes(color) ? "#1a1a1a" : "#ffffff";
            ctx.fillStyle = textColor;

            // Shadow solo per testo bianco (performance)
            if (textColor === "#ffffff") {
                ctx.shadowColor = "rgba(0,0,0,0.3)";
                ctx.shadowBlur = 3;
                ctx.shadowOffsetX = 1;
                ctx.shadowOffsetY = 1;
            } else {
                ctx.shadowColor = "transparent";
                ctx.shadowBlur = 0;
            }

            // Tronca testo se necessario
            const displayName = name.length > 14 ? name.substring(0, 12) + "..." : name;
            ctx.fillText(displayName, radius - 30, 0);
            ctx.restore();
        });

        ctx.restore();

        // 3. Cerchio Centrale
        ctx.beginPath();
        ctx.arc(300, 300, 50, 0, 2 * Math.PI);
        ctx.fillStyle = "#ffffff";
        ctx.shadowColor = "transparent"; // Reset shadow
        ctx.fill();
        ctx.shadowColor = "rgba(0,0,0,0.15)";
        ctx.shadowBlur = 10;
        ctx.stroke();
        
        // Reset shadow
        ctx.shadowColor = "transparent";
        ctx.shadowBlur = 0;
    }

    // --- SOUND ENGINE (WEB AUDIO API) ---
    const SoundEngine = {
        ctx: null,
        init: function() {
            window.AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();
        },
        playTick: function() {
            if (!this.ctx) this.init();
            if (this.ctx.state === 'suspended') this.ctx.resume();
            
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            
            // Crisp high-pitch click
            osc.frequency.setValueAtTime(800, this.ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(1200, this.ctx.currentTime + 0.01);
            
            gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);
            
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            
            osc.type = 'triangle';
            osc.start();
            osc.stop(this.ctx.currentTime + 0.05);
        },
        playWin: function() {
            if (!this.ctx) this.init();
            if (this.ctx.state === 'suspended') this.ctx.resume();
            
            const now = this.ctx.currentTime;
            
            // Chord: C Major (C5, E5, G5)
            [523.25, 659.25, 783.99].forEach((freq, i) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                
                osc.frequency.setValueAtTime(freq, now + i * 0.1);
                
                gain.gain.setValueAtTime(0, now + i * 0.1);
                gain.gain.linearRampToValueAtTime(0.1, now + i * 0.1 + 0.05);
                gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 1.5);
                
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                
                osc.type = 'sine';
                osc.start(now + i * 0.1);
                osc.stop(now + i * 0.1 + 1.5);
            });
        }
    };

    // --- PHYSICS STATE ---
    let spinType = 'classic';
    let spinDuration = 0;
    let spinStartTime = 0;
    
    // 5 Spin Presets (Physics Logic)
    const spinPresets = [
        { name: 'classic', friction: 0.985, initialMult: 1.0 }, // Standard
        { name: 'long_suspense', friction: 0.992, initialMult: 1.4 }, // Very long spin
        { name: 'quick_brake', friction: 0.96, initialMult: 1.2 }, // Fasts then sudden stop
        { name: 'chaos', friction: 0.98, initialMult: 1.1, chaos: true }, // Unstable friction
        { name: 'smooth_operator', friction: 0.99, initialMult: 0.9 } // Slow and steady
    ];

    let currentPreset = spinPresets[0];

    // --- LOOP DI ANIMAZIONE OTTIMIZZATO ---
    let lastRotationC = 0; // Per tracking ticks sui bordi

    function animate(timestamp) {
        if (isSpinning) {
            // Applica fisica dello spin corrente
            if (currentPreset.name === 'chaos') {
                 // Random fluctionation in friction
                 spinVelocity *= (currentPreset.friction - (Math.random() * 0.01));
            } else {
                 spinVelocity *= currentPreset.friction;
            }

            currentRotation += spinVelocity;
            needsRedraw = true;
            
            // Audio Ticks Logic
            // Calcola se abbiamo attraversato un 'bordo' di spicchio
            const arcSize = (2 * Math.PI) / names.length;
            const normalizedRot = currentRotation % (2 * Math.PI);
            
            // Semplice check: se (angolo / arcSize) integer changes
            // Note: This logic needs to be robust for any speed
            // Use angle difference
            if (Math.floor(currentRotation / arcSize) !== Math.floor(lastRotationC / arcSize)) {
                SoundEngine.playTick();
            }
            lastRotationC = currentRotation;

            // Stop condition
            if (Math.abs(spinVelocity) < 0.002) {
                isSpinning = false;
                spinVelocity = 0;
                needsRedraw = true;
                
                SoundEngine.playWin();
                setTimeout(() => determineWinner(), 300);
            }
        }
        
        if (needsRedraw) {
            drawWheel();
            needsRedraw = false;
        }
        
        requestAnimationFrame(animate);
    }

    // --- TRIGGER SPIN MIGLIORATO ---
    function triggerSpin() {
        if (isSpinning || names.length === 0) return;
        
        // Init Audio Context on user interaction
        SoundEngine.init();
        if (SoundEngine.ctx && SoundEngine.ctx.state === 'suspended') SoundEngine.ctx.resume();

        // 1. Pick Random Preset
        currentPreset = spinPresets[Math.floor(Math.random() * spinPresets.length)];
        console.log("Spin Type:", currentPreset.name);

        // 2. Base Velocity randomized
        // Base speed around 0.3 - 0.5 rad/frame
        const baseSpeed = (0.25 + Math.random() * 0.25) * currentPreset.initialMult;
        
        spinVelocity = baseSpeed;
        initialVelocity = spinVelocity;
        
        isSpinning = true;
        needsRedraw = true;
        lastRotationC = currentRotation; 
    }

    // Event listeners per spin
    canvas.addEventListener('click', () => triggerSpin());
    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        triggerSpin();
    }, {passive: false});

    // --- LOGICA VINCITORE (Invariata) ---
    function determineWinner() {
        const arcSize = (2 * Math.PI) / names.length;
        let normalizedRotation = currentRotation % (2 * Math.PI);
        if (normalizedRotation < 0) normalizedRotation += 2 * Math.PI;
        
        let pointerAngle = (2 * Math.PI - normalizedRotation) % (2 * Math.PI);
        const winningIndex = Math.floor(pointerAngle / arcSize);
        
        if (winningIndex >= 0 && winningIndex < names.length) {
            const winnerName = names[winningIndex];
            showWinnerModal(winnerName);
        }
    }

    // --- GESTIONE UI ---
    // (Input listener rimosso - ora gestito dal tasto Salva nel modale)

    // --- ELEMENTI DOM NEW MODAL ---
    const openManageBtn = document.getElementById('open-manage-modal');
    const entriesCountBtn = document.getElementById('entries-count-btn');
    
    const manageModal = document.getElementById('manage-modal');
    const closeManageX = document.getElementById('close-manage-x');
    const saveCloseBtn = document.getElementById('save-close-btn');
    
    const newNameInput = document.getElementById('new-name-input');
    const addNameBtn = document.getElementById('add-name-btn');
    const namesListEl = document.getElementById('names-list');
    
    // Temp names array for editing
    let tempNames = [];

    // --- GESTIONE MANAGE MODAL ---
    function openManageModal() {
        tempNames = [...names]; // Clone array
        renderNamesList();
        manageModal.classList.remove('hidden');
        newNameInput.focus();
    }
    
    function closeManageModal() {
        manageModal.classList.add('hidden');
    }
    
    // Render List
    function renderNamesList() {
        namesListEl.innerHTML = '';
        tempNames.forEach((name, index) => {
            const li = document.createElement('li');
            li.className = 'name-item';
            
            const span = document.createElement('span');
            span.textContent = name;
            
            const delBtn = document.createElement('button');
            delBtn.className = 'delete-item-btn';
            delBtn.innerHTML = '&times;'; // X symbo
            delBtn.onclick = () => removeTempName(index);
            
            li.appendChild(span);
            li.appendChild(delBtn);
            namesListEl.appendChild(li);
        });
        
        // Auto scroll to bottom
        namesListEl.scrollTop = namesListEl.scrollHeight;
    }

    function addTempName() {
        const val = newNameInput.value.trim();
        if (val) {
            tempNames.push(val);
            newNameInput.value = '';
            renderNamesList();
            newNameInput.focus();
        }
    }

    function removeTempName(index) {
        tempNames.splice(index, 1);
        renderNamesList();
    }
    
    // Save logic
    function saveAndClose() {
        names = [...tempNames]; // Apply changes
        updateUI();
        needsRedraw = true; 
        closeManageModal();
    }

    // Input Enter Key
    newNameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTempName();
    });

    addNameBtn.addEventListener('click', addTempName);
    openManageBtn.addEventListener('click', openManageModal);
    closeManageX.addEventListener('click', closeManageModal);
    saveCloseBtn.addEventListener('click', saveAndClose);
    
    // Chiudi modale cliccando fuori
    manageModal.addEventListener('click', (e) => {
        if (e.target === manageModal) closeManageModal();
    });

    // Button Listeners all'interno del modale
    clearBtn.addEventListener('click', () => {
        // No confirmation needed as per user request
        tempNames = [];
        renderNamesList();
        newNameInput.focus();
    });

    // Main Shuffle Button (External)
    const mainShuffleBtn = document.getElementById('shuffle-btn-main'); // NEW
    
    if(mainShuffleBtn) {
        mainShuffleBtn.addEventListener('click', () => {
             if (names.length < 2) return;
             
             // Haptic feedback
             if (navigator.vibrate) navigator.vibrate(30);
             
             // Shuffle main array directly
             names.sort(() => Math.random() - 0.5);
             updateUI();
             needsRedraw = true;
             
             // Optional: visual feedback via toast or animation could be added here
        });
    }

    function updateUI() {
        entriesCountBtn.textContent = names.length;
    }

    // --- GESTIONE VINCITORE MODALE (Invariata) ---
    function showWinnerModal(name) {
        winnerNameDisplay.textContent = name;
        winnerModal.classList.remove('hidden');
    }

    function hideWinnerModal() {
        winnerModal.classList.add('hidden');
    }

    closeXBtn.addEventListener('click', hideWinnerModal);
    closeModalBtn.addEventListener('click', hideWinnerModal);

    removeWinnerBtn.addEventListener('click', () => {
        const winner = winnerNameDisplay.textContent;
        const index = names.indexOf(winner);
        if (index > -1) {
            names.splice(index, 1);
        }
        updateUI();
        needsRedraw = true;
        hideWinnerModal();
    });

    winnerModal.addEventListener('click', (e) => {
        if (e.target === winnerModal) {
            hideWinnerModal();
        }
    });

    // Resize handler con debouncing
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            setupCanvas();
            needsRedraw = true;
        }, 250);
    });

    // Avvio
    init();
});