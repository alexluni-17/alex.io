const scene = document.querySelector('.scene');
const cardContainer = document.querySelector('.card-container');

// State
let isDragging = false;
let startX = 0;
let startY = 0;
let currentRotationX = 0;
let currentRotationY = 0;
let isFlipped = false;
let hasMoved = false;

// --- Touch Handling ---
scene.addEventListener('touchstart', (e) => {
    isDragging = true;
    hasMoved = false;
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    cardContainer.style.cursor = 'grabbing';
}, { passive: false });

scene.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    
    // Check for drag
    const x = e.touches[0].clientX;
    const y = e.touches[0].clientY;
    const moveDist = Math.hypot(x - startX, y - startY);
    
    if (moveDist > 5) {
        hasMoved = true;
        e.preventDefault(); // Prevent scrolling if dragging card
        performTilt(x, y);
    }
}, { passive: false });

scene.addEventListener('touchend', () => {
    isDragging = false;
    cardContainer.style.cursor = 'grab';
    // We do NOT flip here. We let the 'click' event handle it if no drag occurred.
});

// --- Mouse Handling ---
scene.addEventListener('mousedown', (e) => {
    isDragging = true;
    hasMoved = false;
    startX = e.clientX;
    startY = e.clientY;
    cardContainer.style.cursor = 'grabbing';
});

document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    
    const x = e.clientX;
    const y = e.clientY;
    const moveDist = Math.hypot(x - startX, y - startY);
    
    if (moveDist > 5) {
        hasMoved = true;
        performTilt(x, y);
    }
});

document.addEventListener('mouseup', () => {
    isDragging = false;
    cardContainer.style.cursor = 'grab';
});

// --- Unified Click Handler (Desktop & Mobile) ---
// This listener runs for both Mouse Click and Touch Tap
cardContainer.addEventListener('click', (e) => {
    // Only flip if we haven't dragged significantly
    if (!hasMoved) {
        toggleFlip();
    }
    // If we did drag, 'click' might still fire (depending on browser), but hasMoved will block it.
    // Note: 'hasMoved' is reset on start. It persists until next start.
    // Click always happens after end. reliable.
});

// --- Logic ---
function toggleFlip() {
    isFlipped = !isFlipped;
    if (isFlipped) {
        cardContainer.classList.add('is-flipped');
    } else {
        cardContainer.classList.remove('is-flipped');
    }
}

function performTilt(x, y) {
    const deltaX = x - startX;
    const deltaY = y - startY;

    // Dampening
    currentRotationY += deltaX * 0.3; // Increased sensitivity slightly
    currentRotationX -= deltaY * 0.3;

    // Hard Limits
    currentRotationX = Math.max(-45, Math.min(45, currentRotationX));
    currentRotationY = Math.max(-45, Math.min(45, currentRotationY));

    updateTransform();
    
    startX = x;
    startY = y;
}

function updateTransform() {
    // Only apply tilt to container. Flip handles inner.
    cardContainer.style.transform = `rotateX(${currentRotationX}deg) rotateY(${currentRotationY}deg)`;
}