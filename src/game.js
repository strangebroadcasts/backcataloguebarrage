var gameState = 'start'; // "start", "running" or "finished"
var timeLeft = 10;
var score = 0;
var maxScore = 40;
var bonusRoundUnlocked = false;

console.log(QUESTIONS[0]);


let gameTimerInterval;
let gameTimer = document.getElementById("game-timer");
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


    console.log("Game started");
}

function endGame() {
    if (gameState !== 'running') {
        return;
    }

    var inputs = document.querySelectorAll(".answer");
    for (var i = 0; i < inputs.length; i++) {
        inputs[i].disabled = true;
    }

    document.getElementById("forfeit-game-btn").disabled = true;
    clearInterval(gameTimerInterval);
    gameState = 'finished';
    gameTimer.innerText = "GAME OVER - SCORE: " + score.toString() + "/" + maxScore.toString();
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



function enterAnswer(evt) {
    var questionElement = evt.target;
    var questionId = evt.target.id;
    var currentAnswer = evt.target.value;
    var cleanedAnswer = currentAnswer.toLowerCase().replace(/[^\w]/g,'');

    // To make 
    if(QUESTIONS.hasOwnProperty(questionId)) {
        console.log(cleanedAnswer);
        var possibleAnswers = QUESTIONS[questionId];
        if(possibleAnswers.hasOwnProperty(cleanedAnswer)) {
            // We have a match!
            var fullAnswer = QUESTIONS[questionId][cleanedAnswer];
            score += 1;
            questionElement.value = fullAnswer;
            questionElement.disabled = true;
        }
    }
}

function updateTimer() {
    if ((gameState == 'running') && (timeLeft > 0.0)) {
        var secondsLeft = new Date(1000 * timeLeft).toISOString().substring(14, 19);
        gameTimer.innerText = "TIME LEFT: " + secondsLeft + ", SCORE: " + score.toString() + "/" + maxScore.toString();
        // TODO: Decrement timer
        // timeLeft = timeLeft - 1.0;
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