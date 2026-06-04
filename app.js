// ===== LOCAL STORAGE MANAGEMENT =====

const INSECTS = {
    kever: 'kever',
    aardhommel: 'aardhommel',
    lieveheersbeestje: 'lieveheersbeestje'
};

const FEEDBACK_FORM_URL = 'https://forms.office.com/Pages/ResponsePage.aspx?id=R_J9zM5gD0qddXBM9g78ZJTwctMrzKVHkxkU7UCuRk9UMlhRMDFKSEpIOFVUWjJRWFcxQTdGMUVUNS4u';
const isEnglish = document.documentElement.lang === 'en';

function normalizeAnimal(animal) {
    if (!animal) return 'kever';
    const a = animal.toLowerCase();
    if (a === 'beetle' || a === 'kever') return 'kever';
    if (a === 'bumblebee' || a === 'aardhommel' || a === 'hommel') return 'aardhommel';
    if (a === 'ladybug' || a === 'lieveheersbeestje') return 'lieveheersbeestje';
    return a;
}

function getStorageKeys(animal) {
    const norm = normalizeAnimal(animal);
    return {
        communityCount: 'community-count-' + norm,
        uploadedPhotos: 'wildzoekers-photos-' + norm
    };
}

const FOUND_INSECTS_KEY = 'foundInsects';
const WALL_OF_FAME_KEY = 'wz_wall_of_fame';
let photoReady = false;

function markInsectAsFound(insect) {
    const found = getFoundInsects();
    if (!found.includes(insect)) {
        found.push(insect);
        localStorage.setItem(FOUND_INSECTS_KEY, JSON.stringify(found));
    }
}

function getFoundInsects() {
    const found = localStorage.getItem(FOUND_INSECTS_KEY);
    return found ? JSON.parse(found) : [];
}

// ===== PAGE INITIALIZATION =====

function initializePage() {
    const path = window.location.pathname.toLowerCase();

    if (path.includes('kever') || path.includes('beetle')) {
        markInsectAsFound(INSECTS.kever);
    } else if (path.includes('aardhommel') || path.includes('bumblebee') || path.includes('hommel')) {
        markInsectAsFound(INSECTS.aardhommel);
    } else if (path.includes('lieveheersbeestje') || path.includes('ladybug')) {
        markInsectAsFound(INSECTS.lieveheersbeestje);
    }

    checkQuizState();
    updateProgressTrackers();
    initializeCounters();
    initializeFeedbackBookmark();
    createConfetti();
    loadStoredPhotos();
    initializeWallOfFame();
}

// ===== QUIZ & INFO BLOCKS =====

function toggleRole(el) {
    el.classList.toggle('active');
}

function checkQuizState() {
    // Determine which animal page we're on
    const animal = typeof PAGE_ANIMAL !== 'undefined' ? normalizeAnimal(PAGE_ANIMAL) : 'kever';
    // If the quiz was already completed, immediately hide the quiz and show the info blocks
    if (localStorage.getItem('wz_quiz_done_' + animal)) {
        const quizContainer = document.getElementById('quiz-container');
        const infoContainer = document.getElementById('info-blocks-container');
        if (quizContainer) quizContainer.style.display = 'none';
        if (infoContainer) infoContainer.style.display = 'block';
    }
}

function answerQuiz(questionIndex, selectedOption, isCorrect) {
    const block = document.getElementById(`quiz-q${questionIndex}`);
    if (!block) return;

    // Change button color
    const buttons = block.querySelectorAll('.quiz-btn');
    buttons.forEach(btn => {
        btn.disabled = true;
        if (btn.textContent.trim().startsWith(selectedOption)) {
            btn.classList.add(isCorrect ? 'selected-correct' : 'selected-wrong');
        }
    });

    // Provide short feedback notification
    if (isCorrect) {
        showNotification(isEnglish ? "✅ Correct!" : "✅ Helemaal goed!");
    } else {
        showNotification(isEnglish ? "❌ Not quite..." : "❌ Niet helemaal...");
    }

    // Delay briefly, then move to next question or show info blocks
    setTimeout(() => {
        block.style.display = 'none';
        const nextQIndex = questionIndex + 1;
        const nextBlock = document.getElementById(`quiz-q${nextQIndex}`);
        
        if (nextBlock) {
            nextBlock.style.display = 'block';
        } else {
            // End of quiz: display the info blocks and save state
            const quizContainer = document.getElementById('quiz-container');
            const infoContainer = document.getElementById('info-blocks-container');
            if (quizContainer) quizContainer.style.display = 'none';
            if (infoContainer) infoContainer.style.display = 'block';
            
            localStorage.setItem('wz_quiz_done_' + normalizeAnimal(typeof PAGE_ANIMAL !== 'undefined' ? PAGE_ANIMAL : 'kever'), 'true');
        }
    }, 800);
}

// ===== WALL OF FAME =====

function initializeWallOfFame() {
    renderWallOfFame();

    const foundInsects = getFoundInsects();
    const formContainer = document.getElementById('wof-form-container');
    const wofSubtitle = document.getElementById('wof-subtitle');
    
    // Update subtitle text when all insects have been found
    if (foundInsects.length >= 3 && wofSubtitle) {
        wofSubtitle.textContent = isEnglish ? 'You\'ve found all the insects!' : 'Je hebt alle insecten gevonden!';
    }

    // Check if the user has found all 3 and hasn't already submitted their name
    const hasSubmitted = localStorage.getItem('wz_wof_submitted') === 'true';

    if (foundInsects.length >= 3 && formContainer && !hasSubmitted) {
        formContainer.style.display = 'block';
    }
}

function renderWallOfFame() {
    const cloud = document.getElementById('name-cloud');
    if (!cloud) return;

    // Default TU/e Base Names
    const defaultNames = ['Bram de Vries', 'Elena', 'Wei Zhang', 'Lars', 'Sanne Mulder', 'Ananya', 'Thomas van Beek', 'Daan', 'Lotte Jacobs', 'Kevin', 'Maria Santos'];
    
    // User added names from LocalStorage
    const userNames = JSON.parse(localStorage.getItem(WALL_OF_FAME_KEY) || '[]');
    
    // Combine and remove duplicates
    const allNames = [...new Set([...defaultNames, ...userNames])];

    cloud.innerHTML = '';
    allNames.forEach(name => {
        const span = document.createElement('span');
        span.className = 'name-pill';
        span.textContent = name;
        cloud.appendChild(span);
    });
}

function submitToWallOfFame() {
    const input = document.getElementById('wof-name-input');
    const formContainer = document.getElementById('wof-form-container');
    if (!input || !formContainer) return;

    const name = input.value.trim();
    if (!name) {
        showNotification(isEnglish ? "Please enter a name." : "Vul aub een naam in.");
        return;
    }

    const currentList = JSON.parse(localStorage.getItem(WALL_OF_FAME_KEY) || '[]');
    currentList.push(name);
    localStorage.setItem(WALL_OF_FAME_KEY, JSON.stringify(currentList));
    localStorage.setItem('wz_wof_submitted', 'true');

    renderWallOfFame();
    
    formContainer.style.display = 'none';
    const wofSubtitle = document.getElementById('wof-subtitle');
    if (wofSubtitle) {
        wofSubtitle.textContent = isEnglish ? 'You\'ve found all the insects!' : 'Je hebt alle insecten gevonden!';
    }
    showNotification(isEnglish ? "🎉 Welcome to the active Wildzoekers!" : "🎉 Welkom bij de actieve Wildzoekers!");
    createMiniConfetti();
}

// ===== PROGRESS TRACKER =====

function updateProgressTrackers() {
    const found = getFoundInsects();

    updateSingleTracker({
        insect: INSECTS.kever, elementId: 'beetle-progress', imgId: 'beetle-img',
        wrapId: 'beetle-photo-wrap', nameId: 'beetle-name', statusId: 'beetle-status'
    }, found);

    updateSingleTracker({
        insect: INSECTS.lieveheersbeestje, elementId: 'ladybug-progress', imgId: 'ladybug-img',
        wrapId: 'ladybug-photo-wrap', nameId: 'ladybug-name', statusId: 'ladybug-status'
    }, found);

    updateSingleTracker({
        insect: INSECTS.aardhommel, elementId: 'bumblebee-progress', imgId: 'bumblebee-img',
        wrapId: 'bumblebee-photo-wrap', nameId: 'bumblebee-name', statusId: 'bumblebee-status'
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
        status.textContent = isEnglish ? '✓ Found' : '✓ Gevonden';
    } else {
        progressElement.classList.remove('found');
        image.classList.add('silhouette');
        wrap.classList.add('not-found-wrap');
        wrap.classList.remove('found-wrap');
        name.classList.add('blurred-name');
        status.textContent = isEnglish ? 'Yet to find' : 'Nog te vinden';
    }
}

// ===== COUNTER FUNCTIONALITY =====

function initializeCounters() {
    ['lieveheersbeestje', 'kever', 'aardhommel', 'ladybug', 'beetle', 'bumblebee'].forEach(type => {
        const counter = document.getElementById(type + '-counter');
        if (counter) counter.value = 1;
    });

    const animal = typeof PAGE_ANIMAL !== 'undefined' ? PAGE_ANIMAL : 'kever';
    const STORAGE_KEYS = getStorageKeys(animal);

    let communityCount = localStorage.getItem(STORAGE_KEYS.communityCount);
    if (!communityCount) {
        communityCount = String(Math.floor(Math.random() * 21) + 30);
        localStorage.setItem(STORAGE_KEYS.communityCount, communityCount);
    }
    const communityTotal = document.getElementById('community-total');
    if (communityTotal) {
        communityTotal.textContent = communityCount;
    }
}

function submitPersonalCount(type) {
    const input = document.getElementById(type + '-counter');
    const successMessage = document.getElementById('submit-success');
    if (!input) return;

    const count = parseInt(input.value);
    if (count <= 0) {
        const normType = normalizeAnimal(type);
        const animalNames = {
            'lieveheersbeestje': isEnglish ? '🐞 Please add at least 1 ladybug first.' : '🐞 Voeg eerst minimaal 1 lieveheersbeestje toe.',
            'kever':             isEnglish ? '🪲 Please add at least 1 beetle first.'  : '🪲 Voeg eerst minimaal 1 kever toe.',
            'aardhommel':        isEnglish ? '🐝 Please add at least 1 bumblebee first.': '🐝 Voeg eerst minimaal 1 hommel toe.'
        };
        showNotification(animalNames[normType] || (isEnglish ? '🐛 Please add at least 1 animal first.' : '🐛 Voeg eerst minimaal 1 dier toe.'));
        return;
    }

    const animal = typeof PAGE_ANIMAL !== 'undefined' ? PAGE_ANIMAL : type;
    const STORAGE_KEYS = getStorageKeys(animal);

    const currentCommunity = parseInt(localStorage.getItem(STORAGE_KEYS.communityCount) || '30');
    const newCommunity = currentCommunity + count;
    localStorage.setItem(STORAGE_KEYS.communityCount, newCommunity);

    const communityElement = document.getElementById('community-total');
    if (communityElement) {
        communityElement.textContent = newCommunity;
    }

    input.value = 1;

    if (successMessage) {
        successMessage.style.display = 'block';
        setTimeout(() => {
            successMessage.style.display = 'none';
        }, 4000);
    }
    createMiniConfetti();
}

function increaseCounter(type) {
    const normType = normalizeAnimal(type);
    const messages = {
        'lieveheersbeestje': isEnglish ? '🐞 Max 5 ladybugs at a time.' : '🐞 Je kunt maximaal 5 lieveheersbeestjes tegelijk doorgeven.',
        'kever':             isEnglish ? '🪲 Max 5 beetles at a time.' : '🪲 Je kunt maximaal 5 kevers tegelijk doorgeven.',
        'aardhommel':        isEnglish ? '🐝 Max 5 bumblebees at a time.' : '🐝 Je kunt maximaal 5 hommels tegelijk doorgeven.'
    };

    const input = document.getElementById(type + '-counter');
    if (!input) return;

    let currentValue = parseInt(input.value);
    if (currentValue < 5) {
        input.value = currentValue + 1;
    } else {
        const msg = messages[normType] || (isEnglish ? '🐛 Max 5 at a time.' : '🐛 Je kunt maximaal 5 tegelijk doorgeven.');
        showNotification(msg);
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

// ===== PHOTO UPLOAD =====

function handlePhotoUpload(input) {
    if (input.files && input.files[0]) {
        const file = input.files[0];
        const reader = new FileReader();

        reader.onload = function (e) {
            const img = new Image();
            img.onload = function () {
                const MAX = 600;
                let w = img.width;
                let h = img.height;
                if (w > h && w > MAX) { h = Math.round(h * MAX / w); w = MAX; }
                else if (h > MAX) { w = Math.round(w * MAX / h); h = MAX; }

                const canvas = document.createElement('canvas');
                canvas.width = w;
                canvas.height = h;
                canvas.getContext('2d').drawImage(img, 0, 0, w, h);
                const compressed = canvas.toDataURL('image/jpeg', 0.4);

                const preview = document.getElementById('photo-preview');
                const previewImg = document.getElementById('preview-img');
                previewImg.src = compressed;
                preview.style.display = 'flex';
                photoReady = true;
            };
            img.src = e.target.result;
        };

        reader.readAsDataURL(file);
    }
}

function removePhoto() {
    const input = document.getElementById('photo-input');
    const preview = document.getElementById('photo-preview');
    const previewImg = document.getElementById('preview-img');

    if (input) input.value = '';
    if (previewImg) previewImg.src = '';
    if (preview) preview.style.display = 'none';
    photoReady = false;
}

function submitPhoto() {
    const previewImg = document.getElementById('preview-img');
    const uploaderNameInput = document.getElementById('uploader-name');

    if (uploaderNameInput) uploaderNameInput.blur();

    if (!photoReady) {
        showNotification(isEnglish ? '📸 Upload a photo first.' : '📸 Upload eerst een foto.');
        return;
    }

    let uploaderName = uploaderNameInput ? uploaderNameInput.value.trim() : '';
    if (!uploaderName) {
        uploaderName = isEnglish ? 'Anonymous' : 'Anoniem';
    }

    const selectedAnimal = typeof PAGE_ANIMAL !== 'undefined' ? PAGE_ANIMAL : 'kever';
    const normAnimal = normalizeAnimal(selectedAnimal);
    const STORAGE_KEYS = getStorageKeys(selectedAnimal);

    const animalLabels = {
        'lieveheersbeestje': isEnglish ? '🐞 Your ladybug photo is now live!' : '🐞 Jouw lieveheersbeestje foto staat nu tussen de waarnemingen!',
        'kever':             isEnglish ? '🪲 Your beetle photo is now live!' : '🪲 Jouw keverfoto staat nu tussen de waarnemingen!',
        'aardhommel':        isEnglish ? '🐝 Your bumblebee photo is now live!' : '🐝 Jouw aardhommel foto staat nu tussen de waarnemingen!'
    };

    const photoData = {
        image: previewImg.src,
        name: uploaderName,
        animal: normAnimal,
        timestamp: new Date().toISOString()
    };

    savePhotoToStorage(photoData, STORAGE_KEYS);
    addPhotoToTimeline(photoData, true);

    showNotification(animalLabels[normAnimal] || (isEnglish ? '🌿 Photo shared successfully!' : '🌿 Jouw foto staat nu tussen de waarnemingen!'));

    if (uploaderNameInput) uploaderNameInput.value = '';
    removePhoto();
}

function savePhotoToStorage(photoData, STORAGE_KEYS) {
    try {
        const storedPhotos = JSON.parse(localStorage.getItem(STORAGE_KEYS.uploadedPhotos) || '[]');
        storedPhotos.unshift(photoData);
        localStorage.setItem(STORAGE_KEYS.uploadedPhotos, JSON.stringify(storedPhotos));
    } catch (e) {
        try {
            const storedPhotos = JSON.parse(localStorage.getItem(STORAGE_KEYS.uploadedPhotos) || '[]');
            storedPhotos.pop();
            storedPhotos.unshift(photoData);
            localStorage.setItem(STORAGE_KEYS.uploadedPhotos, JSON.stringify(storedPhotos));
        } catch (e2) {
            showNotification(isEnglish ? '📸 Could not save photo. Try a smaller file.' : '📸 Foto kon niet worden opgeslagen. Probeer een kleinere foto.');
        }
    }
}

function loadStoredPhotos() {
    const animal = typeof PAGE_ANIMAL !== 'undefined' ? PAGE_ANIMAL : 'kever';
    const STORAGE_KEYS = getStorageKeys(animal);

    const storedPhotos = JSON.parse(localStorage.getItem(STORAGE_KEYS.uploadedPhotos) || '[]');
    storedPhotos.reverse().forEach(photo => {
        addPhotoToTimeline(photo, false);
    });
}

function addPhotoToTimeline(photoData, prepend = false) {
    const timeline = document.getElementById('photo-timeline');
    if (!timeline) return;

    const byLabel = isEnglish ? 'By' : 'Door';
    
    // Format the timestamp into a readable label
    let timeLabel;
    if (prepend) {
        timeLabel = isEnglish ? 'Just now' : 'Zojuist';
    } else if (photoData.timestamp) {
        const date = new Date(photoData.timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        if (diffMins < 60) {
            timeLabel = isEnglish ? `${diffMins} min ago` : `${diffMins} min geleden`;
        } else if (diffHours < 24) {
            timeLabel = isEnglish ? `${diffHours} hour${diffHours > 1 ? 's' : ''} ago` : `${diffHours} uur geleden`;
        } else if (diffDays === 1) {
            timeLabel = isEnglish ? 'Yesterday' : 'Gisteren';
        } else {
            timeLabel = isEnglish
                ? date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
                : date.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' });
        }
    } else {
        timeLabel = isEnglish ? 'Recently' : 'Recent';
    }
    
    const item = document.createElement('div');
    item.className = 'timeline-item sample';
    item.innerHTML = `
        <img src="${photoData.image}" alt="Observation" class="timeline-photo">
        <p class="timeline-date">${byLabel} <strong>${photoData.name}</strong> • ${timeLabel}</p>
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

    feedbackBookmark.style.display = 'block';

    setTimeout(() => {
        feedbackBookmark.classList.add('expanded');
    }, 8000);

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
        position: fixed; bottom: 20px; right: 20px;
        background: linear-gradient(135deg, #4a7c2e, #6fa342);
        color: white; padding: 1rem 1.4rem; border-radius: 10px;
        box-shadow: 0 8px 24px rgba(45, 80, 22, 0.2); z-index: 1000;
        animation: slideInUp 0.4s ease; font-weight: 500;
        font-family: 'Poppins', sans-serif; max-width: 320px;
    `;
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.style.animation = 'slideOutDown 0.4s ease';
        setTimeout(() => { notification.remove(); }, 400);
    }, 3200);
}

// ===== CONFETTI =====

function createConfetti() {
    const confettiContainer = document.getElementById('confetti');
    if (!confettiContainer) return;

    const confettiPieces = ['🍃', '🌿', '✨', '🐞', '🪲', '🐝'];
    for (let i = 0; i < 24; i++) {
        const confetti = document.createElement('span');
        confetti.textContent = confettiPieces[Math.floor(Math.random() * confettiPieces.length)];
        confetti.style.cssText = `
            position: absolute; font-size: ${Math.random() * 1.2 + 1}rem;
            left: ${Math.random() * 100}%; top: -10px;
            animation: fall ${Math.random() * 3 + 2}s linear forwards; z-index: 10;
        `;
        confettiContainer.appendChild(confetti);
    }
}

function createMiniConfetti() {
    const emojis = ['🍃', '✨', '🌿'];
    for (let i = 0; i < 12; i++) {
        const piece = document.createElement('div');
        piece.textContent = emojis[Math.floor(Math.random() * emojis.length)];
        piece.style.cssText = `
            position: fixed; left: ${50 + (Math.random() * 20 - 10)}%; top: 55%;
            font-size: 1.2rem; pointer-events: none; z-index: 9999;
            animation: burst 1.8s ease forwards;
        `;
        document.body.appendChild(piece);
        setTimeout(() => { piece.remove(); }, 1800);
    }
}

// ===== EXTRA ANIMATIONS =====

if (!document.querySelector('style[data-animations]')) {
    const style = document.createElement('style');
    style.setAttribute('data-animations', 'true');
    style.textContent = `
        @keyframes fall {
            0% { transform: translateY(0) rotate(0deg); opacity: 1; }
            100% { transform: translateY(100vh) rotate(360deg); opacity: 0; }
        }
        @keyframes slideInUp {
            from { transform: translateY(80px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
        @keyframes slideOutDown {
            from { transform: translateY(0); opacity: 1; }
            to { transform: translateY(80px); opacity: 0; }
        }
        @keyframes burst {
            0% { transform: translateY(0) scale(1); opacity: 1; }
            100% { transform: translateY(-120px) rotate(180deg) scale(0.6); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
}

// ===== INITIALIZATION =====

document.addEventListener('DOMContentLoaded', () => {
    initializePage();
});
