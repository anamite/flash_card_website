const API_URL = 'https://flashcards-8886.restdb.io/rest/cards';
let apiKey = localStorage.getItem('apiKey');
let flashcards = [];
let currentCardIndex = 0;

// Load flashcards from local storage on startup
function loadCachedFlashcards() {
    const cachedCards = localStorage.getItem('cachedFlashcards');
    if (cachedCards) {
        flashcards = JSON.parse(cachedCards);
        showCard();
    }
}

// Save flashcards to local storage
function cacheFlashcards() {
    localStorage.setItem('cachedFlashcards', JSON.stringify(flashcards));
}

function saveApiKey() {
    const keyInput = document.getElementById('api-key');
    apiKey = keyInput.value;
    localStorage.setItem('apiKey', apiKey);
    document.getElementById('api-key-input').style.display = 'none';
    document.getElementById('main-menu').style.display = 'block';
}

function showCreateForm() {
    document.getElementById('create-form').style.display = 'block';
    document.getElementById('main-menu').style.display = 'none';
    document.getElementById('flashcard-container').style.display = 'none';
}

function createFlashcard() {
    const question = document.getElementById('question').value;
    const answer = document.getElementById('answer').value;
    
    $.ajax({
        async: true,
        crossDomain: true,
        url: API_URL,
        method: "POST",
        headers: {
            "content-type": "application/json",
            "x-apikey": apiKey,
            "cache-control": "no-cache"
        },
        processData: false,
        data: JSON.stringify({ question, answer })
    }).done(function (response) {
        alert('Flashcard created successfully!');
        document.getElementById('question').value = '';
        document.getElementById('answer').value = '';
        flashcards.push(response);
        cacheFlashcards();
    }).fail(function(jqXHR, textStatus) {
        alert('Error creating flashcard: ' + textStatus);
    });
}

function showAllFlashcards() {
    currentCardIndex = 0;
    showCard();
    document.getElementById('flashcard-container').style.display = 'flex';
    document.getElementById('create-form').style.display = 'none';
    document.getElementById('main-menu').style.display = 'none';
}

function updateFlashcards() {
    $.ajax({
        async: true,
        crossDomain: true,
        url: API_URL,
        method: "GET",
        headers: {
            "content-type": "application/json",
            "x-apikey": apiKey,
            "cache-control": "no-cache"
        }
    }).done(function (response) {
        flashcards = response;
        cacheFlashcards();
        currentCardIndex = 0;
        showCard();
        alert('Flashcards updated successfully!');
    }).fail(function(jqXHR, textStatus) {
        alert('Error updating flashcards: ' + textStatus);
    });
}

function showCard() {
    if (flashcards.length === 0) {
        alert('No flashcards available. Create some first!');
        return;
    }
    const card = flashcards[currentCardIndex];
    document.getElementById('question-text').innerHTML = `<div class="flashcard-content"><p>${card.question}</p></div>`;
    document.getElementById('answer-text').innerHTML = `<div class="flashcard-content">${marked.parse(card.answer)}</div>`;
    document.querySelector('.flashcard').classList.remove('flipped');
} 

function flipCard() {
    document.querySelector('.flashcard').classList.toggle('flipped');
}

function nextCard() {
    currentCardIndex = (currentCardIndex + 1) % flashcards.length;
    showCard();
}

function previousCard() {
    currentCardIndex = (currentCardIndex - 1 + flashcards.length) % flashcards.length;
    showCard();
}

function editCurrentCard() {
    const card = flashcards[currentCardIndex];
    document.getElementById('edit-question').value = card.question;
    document.getElementById('edit-answer').value = card.answer;
    document.getElementById('edit-form').style.display = 'block';
    document.getElementById('flashcard-container').style.display = 'none';
}

function saveEditedCard() {
    const card = flashcards[currentCardIndex];
    const newQuestion = document.getElementById('edit-question').value;
    const newAnswer = document.getElementById('edit-answer').value;

    $.ajax({
        async: true,
        crossDomain: true,
        url: `${API_URL}/${card._id}`,
        method: "PUT",
        headers: {
            "content-type": "application/json",
            "x-apikey": apiKey,
            "cache-control": "no-cache"
        },
        processData: false,
        data: JSON.stringify({ question: newQuestion, answer: newAnswer })
    }).done(function (response) {
        alert('Flashcard updated successfully!');
        flashcards[currentCardIndex] = { ...card, question: newQuestion, answer: newAnswer };
        cacheFlashcards();
        showCard();
        document.getElementById('edit-form').style.display = 'none';
        document.getElementById('flashcard-container').style.display = 'flex';
    }).fail(function(jqXHR, textStatus) {
        alert('Error updating flashcard: ' + textStatus);
    });
}

function deleteCurrentCard() {
    const card = flashcards[currentCardIndex];
    if (confirm('Are you sure you want to delete this flashcard?')) {
        $.ajax({
            async: true,
            crossDomain: true,
            url: `${API_URL}/${card._id}`,
            method: "DELETE",
            headers: {
                "content-type": "application/json",
                "x-apikey": apiKey,
                "cache-control": "no-cache"
            }
        }).done(function (response) {
            alert('Flashcard deleted successfully!');
            flashcards.splice(currentCardIndex, 1);
            cacheFlashcards();
            if (flashcards.length === 0) {
                document.getElementById('flashcard-container').style.display = 'none';
                document.getElementById('main-menu').style.display = 'block';
                return;
            }
            currentCardIndex = currentCardIndex % flashcards.length;
            showCard();
        }).fail(function(jqXHR, textStatus) {
            alert('Error deleting flashcard: ' + textStatus);
        });
    }
}

function showMainMenu() {
    document.getElementById('main-menu').style.display = 'block';
    document.getElementById('flashcard-container').style.display = 'none';
    document.getElementById('create-form').style.display = 'none';
    document.getElementById('edit-form').style.display = 'none';
}

// Check if API key exists and show appropriate view
if (apiKey) {
    document.getElementById('api-key-input').style.display = 'none';
    document.getElementById('main-menu').style.display = 'block';
    loadCachedFlashcards();
} else {
    document.getElementById('api-key-input').style.display = 'block';
}