const API_URL = 'https://flashcards-8886.restdb.io/rest/cards';
let apiKey = localStorage.getItem('apiKey');
let flashcards = [];
let currentCardIndex = 0;

function saveApiKey() {
    const keyInput = document.getElementById('api-key');
    apiKey = keyInput.value;
    localStorage.setItem('apiKey', apiKey);
    document.getElementById('api-key-input').style.display = 'none';
    document.getElementById('flashcard-controls').style.display = 'block';
}

function showCreateForm() {
    document.getElementById('create-form').style.display = 'block';
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
    }).fail(function(jqXHR, textStatus) {
        alert('Error creating flashcard: ' + textStatus);
    });
}

function showAllFlashcards() {
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
        currentCardIndex = 0;
        showCard();
        document.getElementById('flashcard-container').style.display = 'flex';
        document.getElementById('create-form').style.display = 'none';
    }).fail(function(jqXHR, textStatus) {
        alert('Error fetching flashcards: ' + textStatus);
    });
}

function showCard() {
    if (flashcards.length === 0) {
        alert('No flashcards available. Create some first!');
        return;
    }
    const card = flashcards[currentCardIndex];
    document.getElementById('question-text').innerHTML = `<div class="flashcard-content"><p>${card.question}</p></div>`;
    document.getElementById('answer-text').innerHTML = `<div class="flashcard-content">${marked(card.answer)}</div>`;
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
    const newQuestion = prompt('Enter new question:', card.question);
    const newAnswer = prompt('Enter new answer:', card.answer);

    if (newQuestion && newAnswer) {
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
            showCard();
        }).fail(function(jqXHR, textStatus) {
            alert('Error updating flashcard: ' + textStatus);
        });
    }
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
            if (flashcards.length === 0) {
                document.getElementById('flashcard-container').style.display = 'none';
                return;
            }
            currentCardIndex = currentCardIndex % flashcards.length;
            showCard();
        }).fail(function(jqXHR, textStatus) {
            alert('Error deleting flashcard: ' + textStatus);
        });
    }
}

// Check if API key exists and show appropriate view
if (apiKey) {
    document.getElementById('api-key-input').style.display = 'none';
    document.getElementById('flashcard-controls').style.display = 'block';
} else {
    document.getElementById('api-key-input').style.display = 'block';
}