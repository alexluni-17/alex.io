const scene = document.querySelector('.scene');
const cards = document.querySelectorAll('.card-container');
// const cardSelector ... removed

let currentIndex = 0;

// Update UI to show current card
function updateGallery() {
    cards.forEach((card, index) => {
        if (index === currentIndex) {
            card.classList.add('active');
            // Reset transform when becoming active to avoid weird jumps
            card.style.transform = 'translate(0) rotate(0)'; 
        } else {
            card.classList.remove('active');
        }
    });
    // Reset state for new card
    isFlipped = false; 
    cards[currentIndex].classList.remove('is-flipped');
    currentRotationX = 0;
    currentRotationY = 0;
}

// Custom Dropdown Logic
const customSelect = document.getElementById('customSelect');
const triggerText = document.getElementById('triggerText');
const options = document.querySelectorAll('.custom-option');
const headers = document.querySelectorAll('.category-header');

// Toggle Main Dropdown
customSelect.addEventListener('click', (e) => {
    // Only toggle if clicking the trigger itself or its children (not submenu items)
    if (e.target.closest('.select-trigger')) {
        customSelect.classList.toggle('open');
    }
});

// Toggle Categories (Accordion)
headers.forEach(header => {
    header.addEventListener('click', (e) => {
        e.stopPropagation(); // Don't close main dropdown
        const parent = header.parentElement;
        
        // Optional: Close others
        document.querySelectorAll('.category-item.expanded').forEach(item => {
            if (item !== parent) item.classList.remove('expanded');
        });

        parent.classList.toggle('expanded');
    });
});

// Handle Selection
options.forEach(option => {
    option.addEventListener('click', (e) => {
        e.stopPropagation(); // prevent bubbling 
        
        // Remove old selected
        document.querySelector('.custom-option.selected')?.classList.remove('selected');
        options.forEach(opt => opt.classList.remove('selected')); // ensure clean state
        
        // Add new
        option.classList.add('selected');
        
        // Update Text
        triggerText.textContent = option.textContent;
        
        // Update Gallery
        currentIndex = parseInt(option.getAttribute('data-value'));
        updateGallery();
        
        // Close Main Dropdown
        customSelect.classList.remove('open');
    });
});

// Close when clicking outside
document.addEventListener('click', (e) => {
    if (!customSelect.contains(e.target)) {
        customSelect.classList.remove('open');
    }
});

// --- Interaction State ---
let isDragging = false;
let startX = 0;
let startY = 0;
let currentRotationX = 0;
let currentRotationY = 0;
let isFlipped = false;
let hasMoved = false;

// Helper to get active card
function getActiveCard() {
    return cards[currentIndex];
}

// --- Touch Handling ---
scene.addEventListener('touchstart', (e) => {
    // Ignore if touching controls
    if (e.target.closest('#cardSelector')) return;

    isDragging = true;
    hasMoved = false;
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    getActiveCard().style.cursor = 'grabbing';
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
    getActiveCard().style.cursor = 'grab';
    // Click handles flip
});

// --- Mouse Handling ---
scene.addEventListener('mousedown', (e) => {
    if (e.target.closest('#cardSelector')) return;

    isDragging = true;
    hasMoved = false;
    startX = e.clientX;
    startY = e.clientY;
    getActiveCard().style.cursor = 'grabbing';
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
    if(getActiveCard()) getActiveCard().style.cursor = 'grab';
});

// --- Unified Click Handler ---
// Bind click to the scene, check target
scene.addEventListener('click', (e) => {
    if (e.target.closest('#cardSelector')) return; // let selector work

    // Check if we clicked on the active card
    const activeCard = getActiveCard();
    if (activeCard && activeCard.contains(e.target)) {
        if (!hasMoved) {
            toggleFlip();
        }
    }
});

// --- Logic ---
function toggleFlip() {
    const card = getActiveCard();
    isFlipped = !card.classList.contains('is-flipped'); // Toggle based on class state
    if (isFlipped) {
        card.classList.add('is-flipped');
    } else {
        card.classList.remove('is-flipped');
    }
}

function performTilt(x, y) {
    const deltaX = x - startX;
    const deltaY = y - startY;

    // Dampening
    currentRotationY += deltaX * 0.3;
    currentRotationX -= deltaY * 0.3;

    // Hard Limits
    currentRotationX = Math.max(-45, Math.min(45, currentRotationX));
    currentRotationY = Math.max(-45, Math.min(45, currentRotationY));

    updateTransform();
    
    startX = x;
    startY = y;
}

function updateTransform() {
    // Apply tilt to active card
    getActiveCard().style.transform = `rotateX(${currentRotationX}deg) rotateY(${currentRotationY}deg)`;
}

// Init
updateGallery();