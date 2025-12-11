document.addEventListener('DOMContentLoaded', () => {
    // --- CONFIGURATION ---
    const canvas = document.getElementById('wheelCanvas');
    const ctx = canvas.getContext('2d');
    
    // Scale for Retina
    const scale = window.devicePixelRatio || 1;
    canvas.width = 600 * scale;
    canvas.height = 600 * scale;
    ctx.scale(scale, scale);
    
    const cw = 600;
    const ch = 600;
    const cx = cw / 2;
    const cy = ch / 2;
    const radius = 280; // slightly less than 300 to fit padding

    // Initial Names
    let names = [
        "Ali", "Beatriz", "Charles", "Diya", 
        "Eric", "Fatima", "Gabriel", "Hanna"
    ];

    // Colors Palette (Vibrant)
    const colors = [
        '#FF6B6B', '#4ECDC4', '#FFE66D', '#1A535C', 
        '#FF9F43', '#54A0FF', '#5F27CD', '#C4E538'
    ];

    // State
    let currentRotation = 0; // in radians
    let isSpinning = false;
    let spinVelocity = 0;
    let spinFriction = 0.985; // Deceleration factor

    // Elements
    const namesInput = document.getElementById('names-input');
    const updateBtn = document.getElementById('update-btn');
    const clearBtn = document.getElementById('clear-btn');
    const spinBtn = document.getElementById('spin-btn');
    const shuffleBtn = document.getElementById('shuffle-btn');
    const entriesCount = document.getElementById('entries-count');
    
    // Modal Elements
    const winnerModal = document.getElementById('winner-modal');
    const winnerNameDisplay = document.getElementById('winner-name-display');
    const closeModalBtn = document.getElementById('modal-close-btn');
    const removeWinnerBtn = document.getElementById('modal-remove-btn');
    const closeXBtn = document.getElementById('close-winner-x');

    // --- INITIALIZATION ---
    function init() {
        namesInput.value = names.join('\n');
        updateUI();
        drawWheel();
        animate();
    }

    // --- DRAWING ---
    function drawWheel() {
        if (names.length === 0) {
            ctx.clearRect(0,0,cw,ch);
            ctx.font = "30px Outfit";
            ctx.fillStyle = "#ccc";
            ctx.textAlign = "center";
            ctx.fillText("Aggiungi nomi per iniziare", cx, cy);
            return;
        }

        const arcSize = (2 * Math.PI) / names.length;

        // Clear
        ctx.clearRect(0, 0, cw, ch);

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(currentRotation);

        names.forEach((name, i) => {
            const angle = i * arcSize;
            
            // Draw Slice
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.arc(0, 0, radius, angle, angle + arcSize);
            ctx.closePath();
            ctx.fillStyle = colors[i % colors.length];
            ctx.fill();
            ctx.stroke();

            // Draw Text
            ctx.save();
            ctx.rotate(angle + arcSize / 2);
            ctx.textAlign = "right";
            ctx.fillStyle = "#fff";
            ctx.font = "bold 24px Outfit, sans-serif";
            // shadow
            ctx.shadowColor = "rgba(0,0,0,0.3)";
            ctx.shadowBlur = 4;
            ctx.fillText(name, radius - 40, 10);
            ctx.restore();
        });

        // Center White Circle (Donut style)
        ctx.beginPath();
        ctx.arc(0, 0, 60, 0, 2 * Math.PI);
        ctx.fillStyle = "#ffffff";
        ctx.fill();
        ctx.restore();
    }

    // --- PHYSICS ---
    function animate() {
        if (isSpinning) {
            currentRotation += spinVelocity;
            spinVelocity *= spinFriction; // Apply friction

            // Stop condition
            if (spinVelocity < 0.002) {
                isSpinning = false;
                spinVelocity = 0;
                determineWinner();
            }
        }
        drawWheel();
        requestAnimationFrame(animate);
    }

    function determineWinner() {
        // Pointer is at RIGHT = 0 radians in Canvas by default (Standard Position)
        // But we rotated the wheel by `currentRotation`.
        // We need to find which slice is crossing the 0-degree line (Right side).
        
        // Normalize rotation to 0 - 2PI
        let normalizedRotation = currentRotation % (2 * Math.PI);
        if (normalizedRotation < 0) normalizedRotation += 2 * Math.PI;

        // The wheel rotates CLOCKWISE (positive angle).
        // The slice that is at angle A (starting at 0) will move to A + rotation.
        // We want to know which slice covers angle 0 (Right Pointer).
        // Since we are checking what is at 0, effectively we need to check: 
        // Index i where: (i * arc + rotation) contains 2PI (or 0).
        // A bit easier math: Reverse the rotation to find where the pointer "hits" the static wheel layout.
        
        const arcSize = (2 * Math.PI) / names.length;
        
        // Pointer is at 0 degrees.
        // Relative pointer angle on the wheel = (2PI - normalizedRotation) % 2PI
        let pointerAngle = (2 * Math.PI - normalizedRotation) % (2 * Math.PI);
        
        const winningIndex = Math.floor(pointerAngle / arcSize);
        const winner = names[winningIndex];

        showWinner(winner);
    }

    // --- CONTROLS LOGIC ---
    function triggerSpin() {
        if (isSpinning || names.length === 0) return;
        
        // Random massive spin
        const baseSpin = 20 + Math.random() * 10; // speed
        spinVelocity = baseSpin * 0.015; // impulse
        isSpinning = true;
    }

    // Tap to Spin
    canvas.addEventListener('click', triggerSpin);
    spinBtn.addEventListener('click', triggerSpin);

    // Live Update (No Button needed)
    namesInput.addEventListener('input', () => {
        const raw = namesInput.value;
        const newNames = raw.split('\n').map(n => n.trim()).filter(n => n.length > 0);
        
        // Only update if we have content, otherwise keep empty array but don't break
        names = newNames;
        updateUI();
        drawWheel();
    });

    // Remove explicit update logic if previously bound to button
    // updateBtn listener is removed

    clearBtn.addEventListener('click', () => {
        names = [];
        namesInput.value = "";
        updateUI();
        drawWheel();
    });

    shuffleBtn.addEventListener('click', () => {
        names.sort(() => Math.random() - 0.5);
        namesInput.value = names.join('\n');
        drawWheel();
    });

    function updateUI() {
        entriesCount.textContent = names.length;
    }

    // --- WINNER MODAL ---
    function showWinner(name) {
        winnerNameDisplay.textContent = name;
        winnerModal.classList.remove('hidden');
        // Simple confetti or pop effect could go here
    }

    function closeWinnerModal() {
        winnerModal.classList.add('hidden');
    }

    closeModalBtn.addEventListener('click', closeWinnerModal);
    closeXBtn.addEventListener('click', closeWinnerModal);

    removeWinnerBtn.addEventListener('click', () => {
        const winner = winnerNameDisplay.textContent;
        names = names.filter(n => n !== winner);
        namesInput.value = names.join('\n');
        updateUI();
        drawWheel();
        closeWinnerModal();
    });

    // Start
    init();
});
