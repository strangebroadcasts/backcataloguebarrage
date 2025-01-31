// The Back Catalogue Barrage quiz.

// The current state of the game: 
// "start" if the player is reading the rules,
// "running" is the player is guessing,
// or "finished" if the time limit has run out or the player has forfeited.
var gameState = 'start'; // "start", "running" or "finished"

// How many seconds are left (updated by updateTimer)
var timeLeft = 1800;

// How many points the player has gotten (updated by checkAnswer)
var score = 0;

// How many points the player can attain
var maxScore = 40;

// The interval ID for the game's timer
// (set by startGame, cleared by endGame)
let gameTimerInterval;

// gameTimer is the text element above the quiz
// tracking how much time is left and how many
// points the player has gotten.
let gameTimer = document.getElementById("game-timer");

// gameTable is the table element containing the questions.
// We attach an event listener to the table to react to
// updated guesses as part of startGame()
var gameTable = document.getElementById("game-table");
function startGame() {
    if (gameState !== 'start') {
        return;
    }

    gameState = 'running';
    gameTimerInterval = setInterval(updateTimer, 1000);
    gameTable.addEventListener("input", enterAnswer);

    // Clear all answers at the start of the game
    var inputs = document.querySelectorAll(".answer");
    for (var i = 0; i < inputs.length; i++) {
        inputs[i].value = "";
    }

    gameTimer.style.visibility = 'visible';
    gameTable.style.visibility = 'visible';

    document.getElementById("start-game-btn").disabled = true;
    document.getElementById("forfeit-game-btn").disabled = false;
}

function endGame() {
    if (gameState !== 'running') {
        return;
    }

    // Lock all inputs at the end of the game.
    var inputs = document.querySelectorAll(".answer");
    for (var i = 0; i < inputs.length; i++) {
        inputs[i].disabled = true;
    }

    document.getElementById("forfeit-game-btn").disabled = true;
    clearInterval(gameTimerInterval);
    gameState = 'finished';
    var pointTotal = score.toString() + "/" + maxScore.toString();
    if(score == maxScore) {
        alert("Holy moly! You have gotten every question right, well done!");
    } else {
        alert("Game over! You have gotten " + pointTotal + " points.");
    }
    gameTimer.innerText = "GAME OVER - SCORE: " + pointTotal;
}

function giveUp() {
    if (gameState !== 'running') {
        return;
    }
    if (!window.confirm("Do you really want to give up?")) {
        return;
    }
    endGame();
}

// The function handler responsible for verifying answers.
function enterAnswer(evt) {
    // This is called as an event callback on the <input>
    // elements: questionId is the ID of the input element,
    // and currentAnswer is the current contents of the element.
    var questionElement = evt.target;
    var questionId = evt.target.id;
    var currentAnswer = evt.target.value;
    
    // To try and make the game less unreasonable,
    // we only check whether the letters in the answer match,
    // and disregard capitalization and punctuation.
    var cleanedAnswer = currentAnswer.toLowerCase().replace(/[^\w]/g,'');

    // The QUESTIONS answer key (defined in answers.js)
    // is structured as a two-level dictionary, where the first level
    // maps the input element ID to a dictionary of possible answers,
    // and the dictionary maps the lowercased punctuation-free answers
    // to the correct spelling 
    // (so that entering "cest la vie" produces "C'est la vie")
    // First, check that the input ID has answers defined
    if(QUESTIONS.hasOwnProperty(questionId)) {
        // Then, check whether the current contents of
        // the field matches one of the answers we recognize:
        var possibleAnswers = QUESTIONS[questionId];
        if(possibleAnswers.hasOwnProperty(cleanedAnswer)) {
            // We have a match!
            var fullAnswer = QUESTIONS[questionId][cleanedAnswer];

            // Award a point and lock the answer in.
            score += 1;
            questionElement.value = fullAnswer;
            questionElement.disabled = true;
            questionElement.style.backgroundColor = 'palegreen';

            // If all answers are correct, end the game.
            if(score == maxScore) {
                endGame();
            }
        }
    }
}

function updateTimer() {
    if ((gameState == 'running') && (timeLeft > 0.0)) {
        var secondsLeft = new Date(1000 * timeLeft).toISOString().substring(14, 19);
        gameTimer.innerText = "TIME LEFT: " + secondsLeft + ", SCORE: " + score.toString() + "/" + maxScore.toString();
        timeLeft = timeLeft - 1.0;
    }
    else if ((gameState == 'running') && (timeLeft <= 0.0)) {
        endGame();
    }
    else if (gameState == 'finished') {
        gameTimer.innerText = "SCORE: " + score.toString() + "/" + maxScore.toString();
    }
}

document.getElementById("start-game-btn").addEventListener("click", startGame);
document.getElementById("forfeit-game-btn").addEventListener("click", giveUp);