// ===== LOCAL STORAGE MANAGEMENT =====

const INSECTS = {
    kever: 'kever',
    citroenvlinder: 'citroenvlinder',
    lieveheersbeestje: 'lieveheersbeestje'
};

const MAX_SUBMISSIONS = 5;

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
        dateElement.textContent = formattedDate;
    }
}

function updateProgressTrackers() {
    const found = getFoundInsects();
    
    // Update butterfly progress
    const butterflyCard = document.getElementById('butterfly-card');
    if (butterflyCard) {
        if (found.includes(INSECTS.citroenvlinder)) {
            butterflyCard.classList.add('found-insect');
            butterflyCard.querySelector('.card-medal').style.display = 'inline-block';
            butterflyCard.querySelector('.card-silhouette').style.display = 'none';
            butterflyCard.querySelector('.card-name').classList.remove('blurred');
            butterflyCard.querySelector('.card-name').textContent = 'Citroenvlinder';
            butterflyCard.querySelector('.card-status').textContent = '✓ GEVONDEN!';
            butterflyCard.querySelector('.card-points').style.display = 'block';
        }
    }
    
    // Update ladybug progress
    const ladybugCard = document.getElementById('ladybug-card');
    if (ladybugCard) {
        if (found.includes(INSECTS.lieveheersbeestje)) {
            ladybugCard.classList.add('found-insect');
            ladybugCard.querySelector('.card-medal').style.display = 'inline-block';
            ladybugCard.querySelector('.card-silhouette').style.display = 'none';
            ladybugCard.querySelector('.card-name').classList.remove('blurred');
            ladybugCard.querySelector('.card-name').textContent = 'Lieveheersbeestje';
            ladybugCard.querySelector('.card-status').textContent = '✓ GEVONDEN!';
            ladybugCard.querySelector('.card-points').style.display = 'block';
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
            const btn = section.previousElementSibling.querySelector('span');
            if (btn) {
                btn.textContent = btn.textContent.replace('➖', '➕');
            }
        }
    });
    
    // Toggle current section
    const span = button.querySelector('span');
    if (isVisible) {
        content.style.display = 'none';
        if (span) span.textContent = span.textContent.replace('➖', '➕');
    } else {
        content.style.display = 'block';
        if (span) span.textContent = span.textContent.replace('➕', '➖');
    }
}

// ===== COUNTER FUNCTIONALITY =====

function getSubmissionCount() {
    const count = localStorage.getItem('submission-count');
    return count ? parseInt(count) : 0;
}

function incrementSubmissionCount() {
    const current = getSubmissionCount();
    if (current < MAX_SUBMISSIONS) {
        localStorage.setItem('submission-count', (current + 1).toString());
        return true;
    }
    return false;
}

function updateSubmissionCount() {
    const count = getSubmissionCount();
    const countDisplay = document.getElementById('submission-count');
    const limitFill = document.getElementById('limit-fill');
    const percentage = (count / MAX_SUBMISSIONS) * 100;
    
    if (countDisplay) {
        countDisplay.textContent = count;
    }
    if (limitFill) {
        limitFill.style.width = percentage + '%';
    }
}

function initializeCounters() {
    // Load personal counter from localStorage
    const savedCount = localStorage.getItem('personal-beetle-count');
    if (savedCount) {
        document.getElementById('personal-counter').value = savedCount;
    }
    
    // Load community total from localStorage
    const savedCommunity = localStorage.getItem('community-beetle-count');
    if (savedCommunity) {
        document.getElementById('community-total').textContent = savedCommunity;
    } else {
        localStorage.setItem('community-beetle-count', '47');
    }
    
    updateSubmissionCount();
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
    const count = parseInt(document.getElementById('personal-counter').value);
    
    if (count === 0) {
        showNotification('⚠️ Voer alstublieft een getal groter dan 0 in!');
        return;
    }
    
    if (!incrementSubmissionCount()) {
        showNotification('❌ Je hebt je maximum van 5 waarnemingen bereikt voor vandaag!');
        return;
    }
    
    // Update community total
    const currentCommunity = parseInt(localStorage.getItem('community-beetle-count') || '47');
    const newCommunity = currentCommunity + count;
    localStorage.setItem('community-beetle-count', newCommunity);
    document.getElementById('community-total').textContent = newCommunity;
    
    // Reset personal counter
    document.getElementById('personal-counter').value = '1';
    
    // Update submission count display
    updateSubmissionCount();
    
    // Show success message
    showSuccessMessage(`🎉 Geweldig! Je hebt ${count} kever${count > 1 ? 's' : ''} gemeld! Je helpt het onderzoek vooruit!`);
}

function showSuccessMessage(message) {
    const msgElement = document.getElementById('submission-message');
    const msgText = document.getElementById('message-text');
    msgText.textContent = message;
    msgElement.style.display = 'block';
    
    setTimeout(() => {
        msgElement.style.display = 'none';
    }, 4000);
}

// ===== PHOTO UPLOAD & STORAGE =====

function handlePhotoUpload(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const preview = document.getElementById('photo-preview');
            const previewImg = document.getElementById('preview-img');
            previewImg.src = e.target.result;
            preview.style.display = 'flex';
        };
        reader.readAsDataURL(input.files[0]);
    }
}

function removePhoto() {
    document.getElementById('photo-input').value = '';
    document.getElementById('photo-preview').style.display = 'none';
}

function submitPhoto() {
    const previewImg = document.getElementById('preview-img').src;
    const userName = document.getElementById('user-name').value.trim();
    
    if (!userName) {
        showNotification('⚠️ Voer alstublieft je voornaam in!');
        return;
    }
    
    if (!previewImg || previewImg === '') {
        showNotification('⚠️ Upload alstublieft een foto!');
        return;
    }
    
    // Store photo in localStorage
    const photos = JSON.parse(localStorage.getItem('user-photos') || '[]');
    const newPhoto = {
        id: Date.now(),
        image: previewImg,
        name: userName,
        date: new Date().toLocaleDateString('nl-NL')
    };
    photos.push(newPhoto);
    localStorage.setItem('user-photos', JSON.stringify(photos));
    
    // Add to timeline
    addPhotoToTimeline(newPhoto);
    
    showNotification('📸 Dank je wel! Je waarneming is opgeslagen!');
    removePhoto();
    document.getElementById('user-name').value = '';
}

function addPhotoToTimeline(photo) {
    const timeline = document.getElementById('photo-timeline');
    const newItem = document.createElement('div');
    newItem.className = 'timeline-item';
    newItem.innerHTML = `
        <div class="timeline-image">
            <img src="${photo.image}" alt="Foto van ${photo.name}">
        </div>
        <div class="timeline-info">
            <p class="timeline-user">🧑 ${photo.name}</p>
            <p class="timeline-date">Zojuist</p>
        </div>
    `;
    timeline.insertBefore(newItem, timeline.firstChild);
}

function loadUserPhotos() {
    const photos = JSON.parse(localStorage.getItem('user-photos') || '[]');
    const timeline = document.getElementById('photo-timeline');
    
    // Add user photos to the beginning of timeline (after existing items)
    photos.forEach(photo => {
        const existingItem = timeline.querySelector(`img[src="${photo.image}"]`);
        if (!existingItem) {
            // Find position to insert (after sample observations but before adding new ones)
            const newItem = document.createElement('div');
            newItem.className = 'timeline-item';
            newItem.innerHTML = `
                <div class="timeline-image">
                    <img src="${photo.image}" alt="Foto van ${photo.name}">
                </div>
                <div class="timeline-info">
                    <p class="timeline-user">🧑 ${photo.name}</p>
                    <p class="timeline-date">${photo.date}</p>
                </div>
            `;
            timeline.appendChild(newItem);
        }
    });
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
        box-shadow: 0 8px 24px rgba(45, 80, 22, 0.3);
        z-index: 1000;
        animation: slideInUp 0.4s ease;
        font-weight: 500;
        font-family: 'Poppins', sans-serif;
        max-width: 300px;
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutDown 0.4s ease';
        setTimeout(() => notification.remove(), 400);
    }, 3000);
}

// ===== CONFETTI ANIMATION =====

function createConfetti() {
    const confettiContainer = document.getElementById('confetti');
    if (!confettiContainer) return;
    
    const confettiPieces = ['🎉', '🎊', '🌟', '✨', '🍃', '🌿', '🦗', '🐛', '🏆', '⭐'];
    
    for (let i = 0; i < 40; i++) {
        const confetti = document.createElement('span');
        confetti.textContent = confettiPieces[Math.floor(Math.random() * confettiPieces.length)];
        confetti.style.cssText = `
            position: absolute;
            font-size: ${Math.random() * 1.5 + 1}rem;
            left: ${Math.random() * 100}%;
            top: -10px;
            opacity: 1;
            animation: fall ${Math.random() * 3 + 2.5}s linear forwards;
            z-index: 10;
            pointer-events: none;
        `;
        confettiContainer.appendChild(confetti);
    }
}

// ===== FEEDBACK MODAL & BOOKMARK =====

function initializeFeedbackModal() {
    const feedbackModal = document.getElementById('feedbackModal');
    const feedbackBookmark = document.getElementById('feedbackBookmark');
    
    let timeScrolled = 0;
    let scrollThreshold = 15000; // 15 seconds
    let scrollPercentThreshold = 30; // 30% of page
    
    // Show bookmark after time OR scrolling
    window.addEventListener('scroll', () => {
        const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
        
        if ((timeScrolled > scrollThreshold || scrollPercent > scrollPercentThreshold) && feedbackBookmark) {
            feedbackBookmark.classList.add('visible');
        }
    });
    
    // Timer for scroll threshold
    let scrollTimer = setInterval(() => {
        timeScrolled += 1000;
        if (timeScrolled > scrollThreshold && feedbackBookmark) {
            feedbackBookmark.classList.add('visible');
            clearInterval(scrollTimer);
        }
    }, 1000);
    
    // Close modal when clicking outside
    if (feedbackModal) {
        window.addEventListener('click', (event) => {
            if (event.target === feedbackModal) {
                closeFeedbackModal();
            }
        });
    }
}

function openFeedbackModal() {
    const feedbackModal = document.getElementById('feedbackModal');
    if (feedbackModal) {
        feedbackModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
}

function closeFeedbackModal() {
    const feedbackModal = document.getElementById('feedbackModal');
    if (feedbackModal) {
        feedbackModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// ===== ANIMATIONS (CSS) =====

if (!document.querySelector('style[data-animations]')) {
    const style = document.createElement('style');
    style.setAttribute('data-animations', 'true');
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
    // All beetle page specific init functions
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    initializePage();
});
