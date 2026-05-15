// ===== LOCAL STORAGE MANAGEMENT =====

const INSECTS = {
    kever: 'kever',
    citroenvlinder: 'citroenvlinder',
    lieveheersbeestje: 'lieveheersbeestje'
};

const STORAGE_KEYS = {
    foundInsects: 'foundInsects',
    communityCount: 'community-beetle-count',
    uploadedPhotos: 'wildzoekers-uploaded-photos'
};

const FEEDBACK_FORM_URL = 'https://forms.office.com/Pages/ResponsePage.aspx?id=R_J9zM5gD0qddXBM9g78ZJTwctMrzKVHkxkU7UCuRk9UM0s4N0pMT0hBU1hYM0RLQTNCOThRM0k5SS4u';

function markInsectAsFound(insect) {
    const found = getFoundInsects();

    if (!found.includes(insect)) {
        found.push(insect);
        localStorage.setItem(STORAGE_KEYS.foundInsects, JSON.stringify(found));
    }
}

function getFoundInsects() {
    const found = localStorage.getItem(STORAGE_KEYS.foundInsects);
    return found ? JSON.parse(found) : [];
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

function initializeBeetlePage() {
    setFoundDate();
    updateProgressTrackers();
    initializeCounters();
    initializeFeedbackBookmark();
    createConfetti();
    loadStoredPhotos();
}

// ===== FOUND DATE =====

function setFoundDate() {
    const today = new Date();

    const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    };

    const formattedDate = today.toLocaleDateString('nl-NL', options);

    const dateElement = document.getElementById('found-date');

    if (dateElement) {
        dateElement.textContent = formattedDate;
    }
}

// ===== INTERACTIVE INFO CARDS =====

function toggleCard(card) {
    card.classList.toggle('flipped');
}

// ===== INFO TOGGLE (accordion in habitat section) =====

function toggleInfoSection(toggleEl) {
    const content = toggleEl.nextElementSibling;
    const icon = toggleEl.querySelector('.toggle-icon');
    const isOpen = toggleEl.classList.contains('open');

    // Sluit alle andere open secties
    document.querySelectorAll('.info-toggle.open').forEach(openToggle => {
        if (openToggle !== toggleEl) {
            openToggle.classList.remove('open');
            const otherContent = openToggle.nextElementSibling;
            const otherIcon = openToggle.querySelector('.toggle-icon');
            if (otherContent) otherContent.classList.remove('open');
            if (otherIcon) otherIcon.textContent = '▼';
        }
    });

    // Toggle huidige sectie
    if (isOpen) {
        toggleEl.classList.remove('open');
        if (content) content.classList.remove('open');
        if (icon) icon.textContent = '▼';
    } else {
        toggleEl.classList.add('open');
        if (content) content.classList.add('open');
        if (icon) icon.textContent = '▲';
    }
}

// ===== PROGRESS TRACKER =====

function updateProgressTrackers() {
    const found = getFoundInsects();

    updateSingleTracker({
        insect: INSECTS.citroenvlinder,
        elementId: 'butterfly-progress',
        imgId: 'butterfly-img',
        wrapId: 'butterfly-photo-wrap',
        nameId: 'butterfly-name',
        statusId: 'butterfly-status'
    }, found);

    updateSingleTracker({
        insect: INSECTS.lieveheersbeestje,
        elementId: 'ladybug-progress',
        imgId: 'ladybug-img',
        wrapId: 'ladybug-photo-wrap',
        nameId: 'ladybug-name',
        statusId: 'ladybug-status'
    }, found);
}

function updateSingleTracker(config, foundList) {
    const isFound = foundList.includes(config.insect);

    const progressElement = document.getElementById(config.elementId);
    const image = document.getElementById(config.imgId);
    const wrap = document.getElementById(config.wrapId);
    const name = document.getElementById(config.nameId);
    const status = document.getElementById(config.statusId);

    if (!progressElement || !image || !wrap || !name || !status) return;

    if (isFound) {
        progressElement.classList.add('found');

        image.classList.remove('silhouette');

        wrap.classList.remove('not-found-wrap');
        wrap.classList.add('found-wrap');

        name.classList.remove('blurred-name');

        status.textContent = '✓ Gevonden!';
    } else {
        progressElement.classList.remove('found');

        image.classList.add('silhouette');

        wrap.classList.add('not-found-wrap');
        wrap.classList.remove('found-wrap');

        name.classList.add('blurred-name');

        status.textContent = 'Nog te vinden';
    }
}

// ===== COUNTER FUNCTIONALITY =====

function initializeCounters() {
    const personalCounter = document.getElementById('personal-counter');
    const communityTotal = document.getElementById('community-total');

    if (personalCounter) {
        personalCounter.value = 1;
    }

    let communityCount = localStorage.getItem(STORAGE_KEYS.communityCount);

    if (!communityCount) {
        communityCount = '47';
        localStorage.setItem(STORAGE_KEYS.communityCount, communityCount);
    }

    if (communityTotal) {
        communityTotal.textContent = communityCount;
    }
}

function increaseCounter(type) {
    const input = document.getElementById(type + '-counter');

    if (!input) return;

    let currentValue = parseInt(input.value);

    if (currentValue < 5) {
        input.value = currentValue + 1;
    } else {
        showNotification('🐞 Je kunt maximaal 5 kevers tegelijk doorgeven.');
    }
}

function decreaseCounter(type) {
    const input = document.getElementById(type + '-counter');

    if (!input) return;

    let currentValue = parseInt(input.value);

    if (currentValue > 0) {
        input.value = currentValue - 1;
    }
}

function submitPersonalCount() {
    const input = document.getElementById('personal-counter');
    const successMessage = document.getElementById('submit-success');

    if (!input) return;

    const count = parseInt(input.value);

    if (count <= 0) {
        showNotification('🪲 Voeg eerst minimaal 1 kever toe.');
        return;
    }

    const currentCommunity = parseInt(localStorage.getItem(STORAGE_KEYS.communityCount) || '47');

    const newCommunity = currentCommunity + count;

    localStorage.setItem(STORAGE_KEYS.communityCount, newCommunity);

    const communityElement = document.getElementById('community-total');

    if (communityElement) {
        communityElement.textContent = newCommunity;
    }

    // reset teller na verzenden
    input.value = 0;

    if (successMessage) {
        successMessage.style.display = 'block';

        setTimeout(() => {
            successMessage.style.display = 'none';
        }, 4000);
    }

    createMiniConfetti();
}

// ===== PHOTO UPLOAD =====

function handlePhotoUpload(input) {
    if (input.files && input.files[0]) {
        const file = input.files[0];

        const reader = new FileReader();

        reader.onload = function (e) {
            const preview = document.getElementById('photo-preview');
            const previewImg = document.getElementById('preview-img');

            previewImg.src = e.target.result;
            preview.style.display = 'flex';
        };

        reader.readAsDataURL(file);
    }
}

function removePhoto() {
    const input = document.getElementById('photo-input');
    const preview = document.getElementById('photo-preview');

    if (input) {
        input.value = '';
    }

    if (preview) {
        preview.style.display = 'none';
    }
}

function submitPhoto() {
    const previewImg = document.getElementById('preview-img');
    const uploaderNameInput = document.getElementById('uploader-name');

    if (!previewImg || !previewImg.src) {
        showNotification('📸 Upload eerst een foto.');
        return;
    }

    let uploaderName = uploaderNameInput.value.trim();

    if (!uploaderName) {
        uploaderName = 'Anoniem';
    }

    const photoData = {
        image: previewImg.src,
        name: uploaderName,
        timestamp: new Date().toISOString()
    };

    savePhotoToStorage(photoData);
    addPhotoToTimeline(photoData, true);

    showNotification('🌿 Jouw keverfoto staat nu tussen de waarnemingen!');

    uploaderNameInput.value = '';

    removePhoto();
}

function savePhotoToStorage(photoData) {
    const storedPhotos = JSON.parse(localStorage.getItem(STORAGE_KEYS.uploadedPhotos) || '[]');

    storedPhotos.unshift(photoData);

    localStorage.setItem(STORAGE_KEYS.uploadedPhotos, JSON.stringify(storedPhotos));
}

function loadStoredPhotos() {
    const storedPhotos = JSON.parse(localStorage.getItem(STORAGE_KEYS.uploadedPhotos) || '[]');

    storedPhotos.reverse().forEach(photo => {
        addPhotoToTimeline(photo, false);
    });
}

function addPhotoToTimeline(photoData, prepend = false) {
    const timeline = document.getElementById('photo-timeline');

    if (!timeline) return;

    const item = document.createElement('div');
    item.className = 'timeline-item';

    item.innerHTML = `
        <div class="timeline-image">
            <img src="${photoData.image}" alt="Kever waarneming" class="timeline-photo">
        </div>
        <p class="timeline-date">Door <strong>${photoData.name}</strong> • Zojuist</p>
    `;

    if (prepend) {
        timeline.prepend(item);
    } else {
        timeline.appendChild(item);
    }
}

// ===== FEEDBACK FUNCTIONS =====

function initializeFeedbackBookmark() {
    const feedbackBookmark = document.getElementById('feedbackBookmark');

    if (!feedbackBookmark) return;

    // knop altijd zichtbaar
    feedbackBookmark.style.display = 'block';

    // na 8 seconden uitklappen
    setTimeout(() => {
        feedbackBookmark.classList.add('expanded');
    }, 8000);

    // of na 40% scroll
    window.addEventListener('scroll', () => {
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;

        const scrollPercent = (window.scrollY / scrollHeight) * 100;

        if (scrollPercent > 40) {
            feedbackBookmark.classList.add('expanded');
        }
    });
}

function openFeedbackForm() {
    window.open(FEEDBACK_FORM_URL, '_blank');
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
        padding: 1rem 1.4rem;
        border-radius: 10px;
        box-shadow: 0 8px 24px rgba(45, 80, 22, 0.2);
        z-index: 1000;
        animation: slideInUp 0.4s ease;
        font-weight: 500;
        font-family: 'Poppins', sans-serif;
        max-width: 320px;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOutDown 0.4s ease';

        setTimeout(() => {
            notification.remove();
        }, 400);
    }, 3200);
}

// ===== CONFETTI =====

function createConfetti() {
    const confettiContainer = document.getElementById('confetti');

    if (!confettiContainer) return;

    const confettiPieces = ['🍃', '🌿', '✨', '🐞', '🪲'];

    for (let i = 0; i < 24; i++) {
        const confetti = document.createElement('span');

        confetti.textContent = confettiPieces[Math.floor(Math.random() * confettiPieces.length)];

        confetti.style.cssText = `
            position: absolute;
            font-size: ${Math.random() * 1.2 + 1}rem;
            left: ${Math.random() * 100}%;
            top: -10px;
            animation: fall ${Math.random() * 3 + 2}s linear forwards;
            z-index: 10;
        `;

        confettiContainer.appendChild(confetti);
    }
}

function createMiniConfetti() {
    const emojis = ['🪲', '🍃', '✨'];

    for (let i = 0; i < 12; i++) {
        const piece = document.createElement('div');

        piece.textContent = emojis[Math.floor(Math.random() * emojis.length)];

        piece.style.cssText = `
            position: fixed;
            left: ${50 + (Math.random() * 20 - 10)}%;
            top: 55%;
            font-size: 1.2rem;
            pointer-events: none;
            z-index: 9999;
            animation: burst 1.8s ease forwards;
        `;

        document.body.appendChild(piece);

        setTimeout(() => {
            piece.remove();
        }, 1800);
    }
}

// ===== EXTRA ANIMATIONS =====

if (!document.querySelector('style[data-animations]')) {
    const style = document.createElement('style');

    style.setAttribute('data-animations', 'true');

    style.textContent = `
        @keyframes fall {
            0% {
                transform: translateY(0) rotate(0deg);
                opacity: 1;
            }
            100% {
                transform: translateY(100vh) rotate(360deg);
                opacity: 0;
            }
        }

        @keyframes slideInUp {
            from {
                transform: translateY(80px);
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
                transform: translateY(80px);
                opacity: 0;
            }
        }

        @keyframes burst {
            0% {
                transform: translateY(0) scale(1);
                opacity: 1;
            }
            100% {
                transform: translateY(-120px) rotate(180deg) scale(0.6);
                opacity: 0;
            }
        }
    `;

    document.head.appendChild(style);
}

// ===== INITIALIZATION =====

document.addEventListener('DOMContentLoaded', () => {
    initializePage();
});
