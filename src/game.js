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
var maxScore = QUESTIONS.length;

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

window.addEventListener("load", (event) => {
    // display the game title and author
    var title = document.getElementById("game-title");
    title.innerHTML = "<h2>" + GAME_METADATA.name + "</h2> by <a href='" + GAME_METADATA.url + "'>" + GAME_METADATA.author + "</a>";
});

function startGame() {
    if (gameState !== 'start') {
        return;
    }

    // load the questions into the table
    var table = document.getElementById("game-table");

    QUESTIONS.forEach((qn,i) => {
        if(qn.tracks.length>0) {
            if(qn.hasOwnProperty("section_header")) {
                row = table.insertRow(-1);
                row.innerHTML = "<th scope=row colspan=3 class='section'>"+qn.section_header+"</th>";    
            }
            row = table.insertRow(-1);

            // Insert new cells (<td> elements) at the 1st and 2nd position of the "new" <tr> element:
            cell1 = row.insertCell();
            cell2 = row.insertCell();
            cell3 = row.insertCell();
    
            // Add some text to the new cells:
            cell1.innerHTML = qn.artist;
            cell2.innerHTML = qn.title;
            cell3.innerHTML = "<input id='question-"+i+"' class='answer'/>";    
        }
    });

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
        alert("Holy moly! You got every question right, well done!");
    } else {
        alert("Game over! You scored " + pointTotal + " points.");
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
    var questionId = evt.target.id.replace("question-","");
    var currentAnswer = evt.target.value;
    
    // To try and make the game less unreasonable,
    // we only check whether the letters in the answer match,
    // and disregard capitalization and punctuation.
    var cleanedAnswer = clean_text(currentAnswer);

    // First, check that the input ID has answers defined
    if(QUESTIONS.hasOwnProperty(questionId)) {

        var possibleAnswers = QUESTIONS[questionId].tracks.map(clean_text);

        // Make sure the current field isn't the given track in the question
        if(cleanedAnswer != clean_text(QUESTIONS[questionId].title))
        {
            // Then, check whether the current contents of
            // the field matches one of the answers we recognize:
            index = possibleAnswers.indexOf(cleanedAnswer);

            if(index >= 0) {
                // We have a match!
                var fullAnswer = QUESTIONS[questionId].tracks[index];

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
        else
            console.log(cleanedAnswer+" is the question, so it can't be the answer");
    }
}

function clean_text(input)
{
    return input.toLowerCase().replace(/[^\w]/g,'');
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