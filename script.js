const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
let backgroundImage = new Image();
const tileSize = 20;
let tileCountX = canvas.width / tileSize;
let tileCountY = canvas.height / tileSize;

let snake = [];
let dx = tileSize;
let dy = 0;

let food = { x: 0, y: 0 };
let score = 0;

let gameInterval;
let isGamePaused = false;

// Define background images
const backgrounds = {
    "background1": "grass.png",
    "background2": "grass2.jpg",
    "background3": "grass3.jpg"
};

// Function to change the background image
function changeBackground(background) {
    backgroundImage.src = backgrounds[background];
    // Redraw the canvas with the new background
    drawBackground();
}

// Function to draw the background image
function drawBackground() {
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
}

// Set default background
changeBackground("background1");




let highScores = JSON.parse(localStorage.getItem('highScores')) || {};
function updateLeaderboards() {
    const leaderboards = document.getElementById("leaderboards");
    for (let i = 1; i <= 10; i++) {
        const leaderboard = document.getElementById(`leaderboardLevel${i}`);
        leaderboard.innerHTML = `<h3>Level ${i}</h3>`;
        if (highScores[i]) {
            let leaderboardHTML = `<table style="font-family: arial, sans-serif; border-collapse: collapse; width: 100%;">
                                    <tr>
                                        <th style="border: 1px solid #dddddd; text-align: left; padding: 8px;">Name</th>
                                        <th style="border: 1px solid #dddddd; text-align: left; padding: 8px;">Score</th>
                                        <th style="border: 1px solid #dddddd; text-align: left; padding: 8px;">Snake Color Used</th>
                                    </tr>`;
                                    highScores[i].forEach(entry => {
                                        leaderboardHTML += `<tr>
                                                                <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;">${entry.name}</td>
                                                                <td style="border: 1px solid #dddddd; text-align: left; padding: 8px;">${entry.score}</td>
                                                                <td style="border: 1px solid #dddddd; text-align: left; padding: 8px; color: ${entry.snakeColor};">■</td> <!-- Display a colored square representing the snake color -->
                                                            </tr>`;
                                    });
                                    
            leaderboardHTML += `</table>`;
            leaderboard.innerHTML += leaderboardHTML; // Append the generated HTML
        } else {
            leaderboard.innerHTML += "<p>No scores yet.</p>";
        }
    }
}



// Call updateLeaderboards to initially populate leaderboards
updateLeaderboards();

function saveHighScores() {
    localStorage.setItem('highScores', JSON.stringify(highScores));
}


function changeSnakeColor() {
    const colorPicker = document.getElementById("snakeColorPicker");
    const color = colorPicker.value;

    // Change the color of the snake
    snakeColor = color;
}

let foodColor = "#ffffff"; // Default food color

function changeFoodColor() {
    const colorPicker = document.getElementById("foodColorPicker");
    foodColor = colorPicker.value;
}

let levelSpeed; 

function startGame() {
    document.getElementById("startButton").style.display = "none";
    document.getElementById("pauseButton").style.display = "inline";
    document.getElementById("resumeButton").style.display = "none";
    document.getElementById("restartButton").style.display = "inline";
    canvas.style.border = "2px solid black"; // 2px solid black border

    snake = [{ x: 10 * tileSize, y: 10 * tileSize }];
    dx = tileSize;
    dy = 0;
    score = 0;
    generateFood();
    
    const levelSelector = document.getElementById("levelSelector");
    const selectedLevel = parseInt(levelSelector.value);

    // Set the level speed based on the selected level
    levelSpeed = 110 - selectedLevel * 10; // Adjust the game speed based on level

    // Set the game interval based on the selected level speed
    gameInterval = setInterval(gameLoop, levelSpeed);
    highScores = JSON.parse(localStorage.getItem('highScores')) || {};
}


function pauseGame() {
    document.getElementById("startButton").style.display = "none";
    document.getElementById("pauseButton").style.display = "none";
    document.getElementById("resumeButton").style.display = "inline";
    document.getElementById("restartButton").style.display = "inline";
    clearInterval(gameInterval);
    gameInterval = null; // Clear the gameInterval variable
    isGamePaused = true;
}


function resumeGame() {
    document.getElementById("startButton").style.display = "none";
    document.getElementById("pauseButton").style.display = "inline";
    document.getElementById("resumeButton").style.display = "none";
    document.getElementById("restartButton").style.display = "inline";
    if (isGamePaused) {
        gameInterval = setInterval(gameLoop, levelSpeed);
        isGamePaused = false;
    }
}


function restartGame() {
    document.getElementById("startButton").style.display = "inline";
    document.getElementById("pauseButton").style.display = "none";
    document.getElementById("resumeButton").style.display = "none";
    document.getElementById("restartButton").style.display = "none";
    clearInterval(gameInterval);
    startGame();
    // Reattach the keydown event listener
    document.addEventListener("keydown", handleKeyDown);
}


function generateFood() {
    let foodX, foodY;
    // Keep generating random positions until the food is not on the snake or near the corners
    do {
        foodX = Math.floor(Math.random() * tileCountX) * tileSize;
        foodY = Math.floor(Math.random() * tileCountY) * tileSize;
    } while (isFoodOnSnake(foodX, foodY) || isFoodNearCorners(foodX, foodY));

    food.x = foodX;
    food.y = foodY;
}

function isFoodNearCorners(x, y) {
    // Define the offset from the corners
    const cornerOffset = 20;

    // Check if the food position is near any of the corners
    return (
        (x < cornerOffset && y < cornerOffset) ||  // Top-left corner
        (x >= canvas.width - tileSize - cornerOffset && y < cornerOffset) ||  // Top-right corner
        (x < cornerOffset && y >= canvas.height - tileSize - cornerOffset) ||  // Bottom-left corner
        (x >= canvas.width - tileSize - cornerOffset && y >= canvas.height - tileSize - cornerOffset)  // Bottom-right corner
    );
}


function isFoodOnSnake(x, y) {
    // Check if the food position overlaps with any part of the snake
    return snake.some(segment => segment.x === x && segment.y === y);
}


let snakeColor= "#000000"; // Default food color

function drawSnake() {
    snake.forEach(segment => {
        

        ctx.fillStyle = snakeColor; // Use the selected color
        ctx.fillRect(segment.x, segment.y, tileSize, tileSize);
    });
}

function drawFood() {
    ctx.fillStyle = foodColor;
    ctx.fillRect(food.x, food.y, tileSize, tileSize);
}

function drawScore() {
    // Get the score element
    var scoreElement = document.getElementById("score");
    
    // Update the content of the score element with the current score
    scoreElement.textContent = "Score: " + score;
}


function moveSnake() {
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };
    snake.unshift(head);

    const ateFood = snake[0].x === food.x && snake[0].y === food.y;
    if (ateFood) {
        score++;
        generateFood();
    } else {
        snake.pop();
    }
}

function collisionDetection() {
    // Check if the snake's head position matches the exact border coordinates
    if (
        snake[0].x < 0 ||
        snake[0].x >= canvas.width ||
        snake[0].y < 0 ||
        snake[0].y >= canvas.height
    ) {
        gameOver();
    }

    // Check for collision with itself
    snake.slice(1).forEach(segment => {
        if (snake[0].x === segment.x && snake[0].y === segment.y) {
            gameOver();
        }
    });
}


// Function to show leaderboards for the selected level
function showLeaderboard() {
    const selectedLevel = parseInt(document.getElementById("levelSelector").value);
    
    // Hide all leaderboards
    document.querySelectorAll("#leaderboards > div").forEach(leaderboard => {
        leaderboard.style.display = "none";
    });
    
    // Show the leaderboard for the selected level
    document.getElementById(`leaderboardLevel${selectedLevel}`).style.display = "block";
}

function gameOver() {
    clearInterval(gameInterval);
    document.removeEventListener("keydown", handleKeyDown); // Remove the keydown event listener
    const levelSelector = document.getElementById("levelSelector");
    const selectedLevel = parseInt(levelSelector.value);

    // Check if the current score is among the top 10 for the selected level
    const isNewHighScore = !highScores[selectedLevel] || highScores[selectedLevel].length < 10 || score > highScores[selectedLevel][9].score;

    // Show game over alert only if it's not a new high score
    if (!isNewHighScore) {
        alert("Game Over! Your score was: " + score);
    }

    if (isNewHighScore) {
        // Prompt the user for their name
        const playerName = prompt("Congratulations! You achieved a new high score! Enter your name:");

        // Add the new entry to the high scores
        if (!highScores[selectedLevel]) {
            highScores[selectedLevel] = [];
        }
        highScores[selectedLevel].push({ name: playerName, score: score, snakeColor: snakeColor });

        // Sort the high scores in descending order
        highScores[selectedLevel].sort((a, b) => b.score - a.score);

        // Keep only the top 10 entries
        highScores[selectedLevel] = highScores[selectedLevel].slice(0, 10);

        // Save the updated high scores to local storage
        saveHighScores();

        // Update the leaderboards
        updateLeaderboards();
    }
}



function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
    drawSnake();
    drawFood();
    drawScore();
    moveSnake();
    collisionDetection();
}
//All keybinds for
function handleKeyDown(event) {
    const keyPressed = event.key.toLowerCase(); // Convert the key to lowercase for consistent comparison
    if ((keyPressed === "a" || keyPressed === "j" || event.key === "ArrowLeft") && dx !== tileSize) {
        dx = -tileSize;
        dy = 0;
    }
    if ((keyPressed === "d" || keyPressed === "l" || event.key === "ArrowRight") && dx !== -tileSize) {
        dx = tileSize;
        dy = 0;
    }
    if ((keyPressed === "w" || keyPressed === "i" || event.key === "ArrowUp") && dy !== tileSize) {
        dx = 0;
        dy = -tileSize;
    }
    if ((keyPressed === "s" || keyPressed === "k" || event.key === "ArrowDown") && dy !== -tileSize) {
        dx = 0;
        dy = tileSize;
    }
    if (keyPressed === "p" || keyPressed === " ") { // Pause with "p" or spacebar
        if (gameInterval) { // If the game is running, pause it
            pauseGame();
        } else if (isGamePaused) { // If the game is paused, resume it
            resumeGame();
        }
    }
    if (event.altKey || keyPressed === "r") { // Restart with Alt key or "r"
        restartGame();
    }

    function preventScroll(event) {
        // Check if the pressed key is an arrow key
        if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) {
            // Prevent the default scrolling behavior
            event.preventDefault();
        }
    }
    
    // Attach the keydown event listener to the window
    window.addEventListener("keydown", preventScroll);

    // Call this function after updating highScores
    updateLeaderboards();
}

// Attach the keydown event listener
document.addEventListener("keydown", handleKeyDown);

// Prevent scrolling on touchmove event
canvas.addEventListener('touchmove', function(event) {
    event.preventDefault();
}, { passive: false });


// Variable to store touch start coordinates
let touchStartX;
let touchStartY;

// Attach touchstart event listener
canvas.addEventListener('touchstart', handleTouchStart, false);

// Attach touchend event listener
canvas.addEventListener('touchend', handleTouchEnd, false);

function handleTouchStart(event) {
    touchStartX = event.touches[0].clientX;
    touchStartY = event.touches[0].clientY;
}

function handleTouchEnd(event) {
    const touchEndX = event.changedTouches[0].clientX;
    const touchEndY = event.changedTouches[0].clientY;

    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;

    // Calculate the absolute value of deltaX and deltaY to detect the direction of swipe
    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);

    // Set the threshold for swipe detection
    const swipeThreshold = 50; // Adjust as needed

    // Determine the direction of the swipe
    if (absDeltaX > swipeThreshold || absDeltaY > swipeThreshold) {
        if (absDeltaX > absDeltaY) {
            // Horizontal swipe
            if (deltaX > 0) {
                // Right swipe
                handleSwipe("right");
            } else {
                // Left swipe
                handleSwipe("left");
            }
        } else {
            // Vertical swipe
            if (deltaY > 0) {
                // Down swipe
                handleSwipe("down");
            } else {
                // Up swipe
                handleSwipe("up");
            }
        }
    }
}

function handleSwipe(direction) {
    // Convert swipe direction to game direction
    switch (direction) {
        case "up":
            if (dy !== tileSize) {
                dx = 0;
                dy = -tileSize;
            }
            break;
        case "down":
            if (dy !== -tileSize) {
                dx = 0;
                dy = tileSize;
            }
            break;
        case "left":
            if (dx !== tileSize) {
                dx = -tileSize;
                dy = 0;
            }
            break;
        case "right":
            if (dx !== -tileSize) {
                dx = tileSize;
                dy = 0;
            }
            break;
    }
}

