const API_URL = 'https://flashcards-8886.restdb.io/rest/cards';
let apiKey = localStorage.getItem('apiKey');
let flashcards = [];
let currentCardIndex = 0;
let isStudyingImportant = false;

// Load flashcards from local storage on startup
function loadCachedFlashcards() {
	document.getElementById('back-button').style.display = 'none';

    const cachedCards = localStorage.getItem('cachedFlashcards');
    if (cachedCards) {
        flashcards = JSON.parse(cachedCards);
        showCard();
    }
    displayLastUpdateTime();
}

// Save flashcards to local storage
function cacheFlashcards() {
    localStorage.setItem('cachedFlashcards', JSON.stringify(flashcards));
}

function deleteAllData() {
    if (confirm('Are you sure you want to delete all cached data? This action cannot be undone.')) {
        // Clear all items from localStorage
        localStorage.removeItem('cachedFlashcards');
        localStorage.removeItem('apiKey');
        localStorage.removeItem('lastUpdateTime');

        // Reset variables
        flashcards = [];
        apiKey = null;
        currentCardIndex = 0;

        // Update the UI
        document.getElementById('api-key-input').style.display = 'block';
        document.getElementById('main-menu').style.display = 'none';
        document.getElementById('flashcard-container').style.display = 'none';
        document.getElementById('create-form').style.display = 'none';
        document.getElementById('edit-form').style.display = 'none';
        document.getElementById('api-key').value = '';
        document.getElementById('last-update-time').textContent = '';

        alert('All cached data has been deleted. You will need to enter your API key again to use the app.');
    }
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
	document.getElementById('back-button').style.display = 'flex';
    document.getElementById('flashcard-container').style.display = 'flex';
    document.getElementById('create-form').style.display = 'none';
    document.getElementById('main-menu').style.display = 'none';
}

function confirmUpdateFlashcards() {
    if (confirm('Are you sure you want to update flashcards?')) {
        updateFlashcards();
    }
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
        const now = new Date();
        localStorage.setItem('lastUpdateTime', now.toString());
        displayLastUpdateTime();
    }).fail(function(jqXHR, textStatus) {
        alert('Error updating flashcards: ' + textStatus);
    });
}

function displayLastUpdateTime() {
    const lastUpdateTime = localStorage.getItem('lastUpdateTime');
    if (lastUpdateTime) {
        document.getElementById('last-update-time').textContent = `Last update: ${new Date(lastUpdateTime).toLocaleString()}`;
    }
}
function toggleImportant(event) {
  event.stopPropagation();
  const card = flashcards[currentCardIndex];
  card.important = !card.important;
  event.target.closest('.star-icon').classList.toggle('important');
  cacheFlashcards();
}

function studyImportantCards() {
  isStudyingImportant = true;
  const importantCards = flashcards.filter(card => card.important);
  if (importantCards.length === 0) {
    alert('No important cards marked. Please mark some cards as important first.');
    return;
  }
  flashcards = importantCards;
  currentCardIndex = 0;
  showAllFlashcards();
}
function showCard() {
  if (flashcards.length === 0) {
    alert('No flashcards available. Click "Download" to get the cards');
    return;
  }
  const card = flashcards[currentCardIndex];
  document.getElementById('question-text').innerHTML = `
    <div class="flashcard-content">
      <svg class="star-icon ${card.important ? 'important' : ''}" onclick="toggleImportant(event)">
        <use xlink:href="#icon-star"></use>
      </svg>
      <p>${card.question}</p>
    </div>`;
  document.getElementById('answer-text').innerHTML = `<div class="flashcard-content">${marked.parse(card.answer)}</div>`;
  document.querySelector('.flashcard').classList.remove('flipped');
}
document.addEventListener('keydown', function(event) {
    if (event.code === 'Space') {
        event.preventDefault(); // Prevent default space bar action (scrolling)
        flipCard(); // Function to flip the card
    } else if (event.code === 'ArrowLeft') {
        event.preventDefault(); // Prevent default action if necessary
        previousCard(); // Function to go to the previous card
    } else if (event.code === 'ArrowRight') {
        event.preventDefault(); // Prevent default action if necessary
        nextCard(); // Function to go to the next card
    }
});


function flipCard() {
    document.querySelector('.flashcard').classList.toggle('flipped');
}

function nextCard() {
    const currentCard = document.querySelector('.flashcard');
    currentCard.classList.add('slide-left');
    setTimeout(() => {
        currentCardIndex = (currentCardIndex + 1) % flashcards.length;
        showCard();
        currentCard.classList.remove('slide-left');
    }, 300);
}

function previousCard() {
    const currentCard = document.querySelector('.flashcard');
    currentCard.classList.add('slide-right');
    setTimeout(() => {
        currentCardIndex = (currentCardIndex - 1 + flashcards.length) % flashcards.length;
        showCard();
        currentCard.classList.remove('slide-right');
    }, 300);
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
  document.getElementById('back-button').style.display = 'none';
  document.getElementById('main-menu').style.display = 'block';
  document.getElementById('flashcard-container').style.display = 'none';
  document.getElementById('create-form').style.display = 'none';
  document.getElementById('edit-form').style.display = 'none';
  
  // Reset to all flashcards when returning to main menu
  if (isStudyingImportant) {
    isStudyingImportant = false;
    loadCachedFlashcards();
  }
}

// Check if API key exists and show appropriate view
if (apiKey) {
	document.getElementById('back-button').style.display = 'none';
    document.getElementById('api-key-input').style.display = 'none';
    document.getElementById('main-menu').style.display = 'block';
    loadCachedFlashcards();
} else {
	document.getElementById('back-button').style.display = 'none';
    document.getElementById('api-key-input').style.display = 'block';
}
