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
    hasMoved = false; // Reset move flag
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    cardContainer.style.cursor = 'grabbing';
}, { passive: false });

scene.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    
    const x = e.touches[0].clientX;
    const y = e.touches[0].clientY;
    
    // Check if we actually moved significantly (> 5px) to consider it a drag
    const moveDist = Math.hypot(x - startX, y - startY);
    if (moveDist > 5) {
        hasMoved = true;
        e.preventDefault(); // Prevent scrolling only if dragging card
        performTilt(x, y);
    }
}, { passive: false });

scene.addEventListener('touchend', () => {
    isDragging = false;
    cardContainer.style.cursor = 'grab';
    
    // If we didn't move properly, it's a tap -> FLIP
    if (!hasMoved) {
        toggleFlip();
    }
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
    if (isDragging && !hasMoved) {
        toggleFlip();
    }
    isDragging = false;
    cardContainer.style.cursor = 'grab';
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