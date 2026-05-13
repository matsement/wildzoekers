// ===== LOCAL STORAGE MANAGEMENT =====

const INSECTS = {
    kever: 'kever',
    citroenvlinder: 'citroenvlinder',
    lieveheersbeestje: 'lieveheersbeestje'
};

function markInsectAsFound(insect) {
    const found = getFoundInsects();
    if (!found.includes(insect)) {
        found.push(insect);
        localStorage.setItem('foundInsects', JSON.stringify(found));
    }
}

function getFoundInsects() {
    const found = localStorage.getItem('foundInsects');
    return found ? JSON.parse(found) : [];
}

function isInsectFound(insect) {
    return getFoundInsects().includes(insect);
}

// ===== PAGE INITIALIZATION =====

function initializePage() {
    const path = window.location.pathname;
    
    if (path.includes('kever')) {
        markInsectAsFound(INSECTS.kever);
        initializeBeetlePage();
    } else if (path.includes('citroenvlinder')) {
        markInsectAsFound(INSECTS.citroenvlinder);
    } else if (path.includes('lieveheersbeestje')) {
        markInsectAsFound(INSECTS.lieveheersbeestje);
    }
}

// ===== BEETLE PAGE SPECIFIC =====

function setFoundDate() {
    const today = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate = today.toLocaleDateString('nl-NL', options);
    const dateElement = document.getElementById('found-date');
    if (dateElement) {
        dateElement.textContent = `Gevonden op: ${formattedDate}`;
    }
}

function updateProgressTrackers() {
    const found = getFoundInsects();
    
    // Update butterfly progress
    const butterflyElement = document.getElementById('butterfly-progress');
    if (butterflyElement) {
        if (found.includes(INSECTS.citroenvlinder)) {
            butterflyElement.classList.add('found');
            butterflyElement.querySelector('.progress-icon').textContent = '✓';
            butterflyElement.querySelector('.progress-status').textContent = 'Gevonden!';
        }
    }
    
    // Update ladybug progress
    const ladybugElement = document.getElementById('ladybug-progress');
    if (ladybugElement) {
        if (found.includes(INSECTS.lieveheersbeestje)) {
            ladybugElement.classList.add('found');
            ladybugElement.querySelector('.progress-icon').textContent = '✓';
            ladybugElement.querySelector('.progress-status').textContent = 'Gevonden!';
        }
    }
}

// ===== EXPANDABLE SECTIONS =====

function toggleSection(button) {
    const content = button.nextElementSibling;
    const isVisible = content.style.display !== 'none';
    
    // Close all other sections
    document.querySelectorAll('.expand-content').forEach(section => {
        if (section !== content) {
            section.style.display = 'none';
            section.previousElementSibling.textContent = section.previousElementSibling.textContent.replace('➖', '➕');
        }
    });
    
    // Toggle current section
    if (isVisible) {
        content.style.display = 'none';
        button.innerHTML = button.innerHTML.replace('➖', '➕');
    } else {
        content.style.display = 'block';
        button.innerHTML = button.innerHTML.replace('➕', '➖');
    }
}

// ===== COUNTER FUNCTIONALITY =====

function initializeCounters() {
    // Load personal counter from localStorage
    const savedCount = localStorage.getItem('personal-beetle-count');
    if (savedCount) {
        document.getElementById('personal-counter').value = savedCount;
    }
    
    // Load community total from localStorage (simulated)
    const savedCommunity = localStorage.getItem('community-beetle-count');
    if (savedCommunity) {
        document.getElementById('community-total').textContent = savedCommunity;
    } else {
        // Start with default if no data
        localStorage.setItem('community-beetle-count', '47');
    }
}

function increaseCounter(type) {
    const input = document.getElementById(type + '-counter');
    input.value = parseInt(input.value) + 1;
}

function decreaseCounter(type) {
    const input = document.getElementById(type + '-counter');
    if (parseInt(input.value) > 0) {
        input.value = parseInt(input.value) - 1;
    }
}

function submitPersonalCount() {
    const count = document.getElementById('personal-counter').value;
    localStorage.setItem('personal-beetle-count', count);
    
    // Simulate adding to community count
    const currentCommunity = parseInt(localStorage.getItem('community-beetle-count') || '47');
    const newCommunity = currentCommunity + parseInt(count);
    localStorage.setItem('community-beetle-count', newCommunity);
    document.getElementById('community-total').textContent = newCommunity;
    
    showNotification('✅ Dank je wel! Je waarneming is opgeslagen en bijgedragen aan ons onderzoek.');
}

// ===== PHOTO UPLOAD =====

function handlePhotoUpload(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const preview = document.getElementById('photo-preview');
            const previewImg = document.getElementById('preview-img');
            previewImg.src = e.target.result;
            preview.style.display = 'block';
        };
        reader.readAsDataURL(input.files[0]);
    }
}

function removePhoto() {
    document.getElementById('photo-input').value = '';
    document.getElementById('photo-preview').style.display = 'none';
}

function submitPhoto() {
    showNotification('📸 Dank je wel! Je foto is ingediend en zal binnenkort zichtbaar zijn.');
    removePhoto();
}

// ===== NOTIFICATIONS =====

function showNotification(message) {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: linear-gradient(135deg, #4a7c2e, #6fa342);
        color: white;
        padding: 1.5rem 2rem;
        border-radius: 10px;
        box-shadow: 0 8px 24px rgba(45, 80, 22, 0.2);
        z-index: 1000;
        animation: slideInUp 0.4s ease;
        font-weight: 500;
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutDown 0.4s ease';
        setTimeout(() => notification.remove(), 400);
    }, 3500);
}

// ===== CONFETTI ANIMATION =====

function createConfetti() {
    const confettiContainer = document.getElementById('confetti');
    if (!confettiContainer) return;
    
    const confettiPieces = ['🎉', '🎊', '🌟', '✨', '🍃', '🌿', '🦗', '🐛'];
    
    for (let i = 0; i < 30; i++) {
        const confetti = document.createElement('span');
        confetti.textContent = confettiPieces[Math.floor(Math.random() * confettiPieces.length)];
        confetti.style.cssText = `
            position: absolute;
            font-size: ${Math.random() * 1.5 + 1}rem;
            left: ${Math.random() * 100}%;
            top: -10px;
            opacity: 1;
            animation: fall ${Math.random() * 3 + 2}s linear forwards;
            z-index: 10;
        `;
        confettiContainer.appendChild(confetti);
    }
}

// ===== ANIMATIONS (CSS WILL HANDLE MOST) =====

// Add CSS animations dynamically
if (!document.querySelector('style[data-confetti-animations]')) {
    const style = document.createElement('style');
    style.setAttribute('data-confetti-animations', 'true');
    style.textContent = `
        @keyframes fall {
            0% {
                transform: translateY(0) rotateZ(0deg);
                opacity: 1;
            }
            100% {
                transform: translateY(100vh) rotateZ(360deg);
                opacity: 0;
            }
        }
        @keyframes slideInUp {
            from {
                transform: translateY(100px);
                opacity: 0;
            }
            to {
                transform: translateY(0);
                opacity: 1;
            }
        }
        @keyframes slideOutDown {
            from {
                transform: translateY(0);
                opacity: 1;
            }
            to {
                transform: translateY(100px);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}

// ===== INITIALIZATION =====

function initializeBeetlePage() {
    // All beetle page specific init functions are already called in kever.html
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    initializePage();
});
