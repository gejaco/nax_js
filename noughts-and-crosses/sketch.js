let board;
let currentPlayer;
let cellSize = 150;
let gameOver = false;

function setup() {
  createCanvas(450, 450);
  initGame();
}

function draw() {
  background(255);
  drawGrid();
  drawMarks();
}

function initGame() {
  board = [
    ["", "", ""],
    ["", "", ""],
    ["", "", ""]
  ];
  currentPlayer = "X";
  gameOver = false;
  document.getElementById("status").textContent = "Player X's turn";
}

function mousePressed() {
  if (gameOver) return;

  let row = floor(mouseY / cellSize);
  let col = floor(mouseX / cellSize);

  if (row < 3 && col < 3 && board[row][col] === "") {
    board[row][col] = currentPlayer;
    if (checkWinner()) {
      document.getElementById("status").textContent = `Player ${currentPlayer} wins!`;
      gameOver = true;
    } else if (isDraw()) {
      document.getElementById("status").textContent = "It's a draw!";
      gameOver = true;
    } else {
      currentPlayer = currentPlayer === "X" ? "O" : "X";
      document.getElementById("status").textContent = `Player ${currentPlayer}'s turn`;
    }
  }
}

function drawGrid() {
  strokeWeight(4);
  for (let i = 1; i < 3; i++) {
    line(i * cellSize, 0, i * cellSize, height);
    line(0, i * cellSize, width, i * cellSize);
  }
}

function drawMarks() {
  textAlign(CENTER, CENTER);
  textSize(64);
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      let x = j * cellSize + cellSize / 2;
      let y = i * cellSize + cellSize / 2;
      if (board[i][j] === "X") {
        fill(0);
        text("X", x, y);
      } else if (board[i][j] === "O") {
        fill(50, 100, 200);
        text("O", x, y);
      }
    }
  }
}

function checkWinner() {
  let b = board;
  for (let i = 0; i < 3; i++) {
    if (b[i][0] !== "" && b[i][0] === b[i][1] && b[i][1] === b[i][2]) return true;
    if (b[0][i] !== "" && b[0][i] === b[1][i] && b[1][i] === b[2][i]) return true;
  }
  if (b[0][0] !== "" && b[0][0] === b[1][1] && b[1][1] === b[2][2]) return true;
  if (b[0][2] !== "" && b[0][2] === b[1][1] && b[1][1] === b[2][0]) return true;
  return false;
}

function isDraw() {
  return board.flat().every(cell => cell !== "");
}

function restartGame() {
  initGame();
}
