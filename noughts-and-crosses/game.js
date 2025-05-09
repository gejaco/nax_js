let scene, camera, renderer;
let board = [];
let currentPlayer = 'X';
let raycaster, mouse;
let boardGroup;
let statusText = document.getElementById('status');
let gameOver = false;
let highlight;
let strikeLine = null;


const cellSize = 2;
const offset = cellSize * 1.5;

init();
animate();

function init() {
  const container = document.getElementById('game-container');

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(70, container.clientWidth / 500, 0.1, 1000);
  camera.position.set(0, 5, 7);
  camera.lookAt(0, 0, 0);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(container.clientWidth, 500);
  renderer.setClearColor(0x87ceeb); // Light sky blue
  container.appendChild(renderer.domElement);

  const ambient = new THREE.AmbientLight(0xffffff, 0.8);
  scene.add(ambient);

  const light = new THREE.DirectionalLight(0xffffff, 0.5);
  light.position.set(0, 5, 5);
  scene.add(light);

  // Create the highlight plane (invisible initially)
  const highlightMaterial = new THREE.MeshBasicMaterial({
    color: 0xffff00, // Yellow
    opacity: 1,
    transparent: true
  });
  highlight = new THREE.Mesh(new THREE.PlaneGeometry(cellSize, cellSize), highlightMaterial);
  highlight.rotation.x = -Math.PI / 2;
  highlight.visible = false;
  scene.add(highlight);


  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();

  window.addEventListener('click', onClick, false);
  window.addEventListener('mousemove', onMouseMove, false);
  document.getElementById('resetButton').addEventListener('click', resetGame);


  buildBoard();
}

function buildBoard() {
  boardGroup = new THREE.Group();
  board = Array.from({ length: 3 }, () => Array(3).fill(null));

  const lineColor = 0xffffff;
  const boardBaseColor = 0xaaaaaa;

  const lineMaterial = new THREE.MeshStandardMaterial({
    color: lineColor,
    metalness: 0.2,
    roughness: 0.3
  });

  const boardMaterial = new THREE.MeshStandardMaterial({
    color: boardBaseColor,
    metalness: 0.1,
    roughness: 0.6
  });

  const lineThickness = 0.05;
  const lineDepth = 0.1;
  const lineLength = cellSize * 3;

  // Add base platform for the board
  const base = new THREE.Mesh(
    new THREE.BoxGeometry(lineLength + 0.1, lineDepth, lineLength + 0.1),
    boardMaterial
  );
  base.position.y = -lineDepth / 2;
  boardGroup.add(base);

  // Add visual grid lines
  for (let i = 1; i <= 2; i++) {
    // Horizontal line
    const hLine = new THREE.Mesh(
      new THREE.BoxGeometry(lineLength, lineThickness, lineThickness),
      lineMaterial
    );
    hLine.position.set(0, 0.01, (i - 1.5) * cellSize);
    boardGroup.add(hLine);

    // Vertical line
    const vLine = new THREE.Mesh(
      new THREE.BoxGeometry(lineThickness, lineThickness, lineLength),
      lineMaterial
    );
    vLine.position.set((i - 1.5) * cellSize, 0.01, 0);
    boardGroup.add(vLine);
  }

  // Add white border around the board
  const borderMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
  const borderThickness = 0.05;
  const totalSize = cellSize * 3 + borderThickness;

  const topBorder = new THREE.Mesh(
    new THREE.BoxGeometry(totalSize, lineThickness, lineThickness),
    borderMaterial
  );
  topBorder.position.set(0, 0.015, 1.5 * cellSize + borderThickness / 2);
  boardGroup.add(topBorder);

  const bottomBorder = topBorder.clone();
  bottomBorder.position.z = -topBorder.position.z;
  boardGroup.add(bottomBorder);

  const leftBorder = new THREE.Mesh(
    new THREE.BoxGeometry(lineThickness, lineThickness, totalSize),
    borderMaterial
  );
  leftBorder.position.set(-1.5 * cellSize - borderThickness / 2, 0.015, 0);
  boardGroup.add(leftBorder);

  const rightBorder = leftBorder.clone();
  rightBorder.position.x = -leftBorder.position.x;
  boardGroup.add(rightBorder);

  // Add invisible click targets (1 per cell)
  const invisibleMat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 });
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      const cell = new THREE.Mesh(
        new THREE.PlaneGeometry(cellSize, cellSize),
        invisibleMat
      );
      cell.rotation.x = -Math.PI / 2;
      cell.position.set((col - 1) * cellSize, 0.02, (row - 1) * cellSize);
      cell.userData = { row, col };
      boardGroup.add(cell);
    }
  }

  scene.add(boardGroup);
}


function buildBoard_old() {
  boardGroup = new THREE.Group();
  board = Array.from({ length: 3 }, () => Array(3).fill(null));

  const lineMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
  const lineThickness = 0.05;
  const lineLength = cellSize * 3;

  // Add visual grid lines
  for (let i = 1; i <= 2; i++) {
    // Horizontal lines
    const hLine = new THREE.Mesh(
      new THREE.BoxGeometry(lineLength, lineThickness, lineThickness),
      lineMaterial
    );
    hLine.position.set(0, 0, (i - 1.5) * cellSize);
    boardGroup.add(hLine);

    // Vertical lines
    const vLine = new THREE.Mesh(
      new THREE.BoxGeometry(lineThickness, lineThickness, lineLength),
      lineMaterial
    );
    vLine.position.set((i - 1.5) * cellSize, 0, 0);
    boardGroup.add(vLine);

// Add a white border around the board
const borderMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
const borderThickness = 0.05;
const totalSize = cellSize * 3 + borderThickness;

const topBorder = new THREE.Mesh(
  new THREE.BoxGeometry(totalSize, borderThickness, borderThickness),
  borderMaterial
);
topBorder.position.set(0, 0, 1.5 * cellSize + borderThickness / 2);
boardGroup.add(topBorder);

const bottomBorder = topBorder.clone();
bottomBorder.position.z = -topBorder.position.z;
boardGroup.add(bottomBorder);

const leftBorder = new THREE.Mesh(
  new THREE.BoxGeometry(borderThickness, borderThickness, totalSize),
  borderMaterial
);
leftBorder.position.set(-1.5 * cellSize - borderThickness / 2, 0, 0);
boardGroup.add(leftBorder);

const rightBorder = leftBorder.clone();
rightBorder.position.x = -leftBorder.position.x;
boardGroup.add(rightBorder);


  }

  // Add invisible click targets (1 per cell)
  const invisibleMat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 });
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      const cell = new THREE.Mesh(
        new THREE.PlaneGeometry(cellSize, cellSize),
        invisibleMat
      );
      cell.rotation.x = -Math.PI / 2; // Face upward
      cell.position.set((col - 1) * cellSize, 0.01, (row - 1) * cellSize); // Slightly above ground
      cell.userData = { row, col };
      boardGroup.add(cell);
    }
  }

  scene.add(boardGroup);
}



function buildBoard_Solid() {
  boardGroup = new THREE.Group();
  board = Array.from({ length: 3 }, () => Array(3).fill(null));
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      const cell = new THREE.Mesh(
        new THREE.BoxGeometry(cellSize, 0.1, cellSize),
        new THREE.MeshStandardMaterial({ color: 0xeeeeee })
      );
      cell.position.set((col - 1) * cellSize, 0, (row - 1) * cellSize);
      cell.userData = { row, col };
      boardGroup.add(cell);
    }
  }
  scene.add(boardGroup);
}

function onClick(event) {
  if (gameOver) return;

  const rect = renderer.domElement.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(boardGroup.children);

  if (intersects.length > 0) {
    const cell = intersects[0].object;
    const { row, col } = cell.userData;

    if (!board[row][col]) {
      addMark(row, col, currentPlayer);
      board[row][col] = currentPlayer;

      const result = checkWin(currentPlayer);
      console.log('checkWin returned:', result);

      if (result) {
        // Create win message
        const message = document.createElement('div');
        message.id = 'winMessage';
        message.textContent = `Player ${currentPlayer} wins!`;
        message.style.position = 'absolute';
        message.style.top = '60px';
        message.style.left = '20px';
        message.style.color = 'green';
        message.style.fontSize = '24px';
        message.style.fontFamily = 'Arial, sans-serif';
        message.style.zIndex = '1';
        document.body.appendChild(message);
        document.getElementById('gameStatus').textContent = `Player ${currentPlayer} wins!`;
        document.getElementById('gameStatus').textContent = ``;

        // Update the status message instead of creating a new one
      const status = document.getElementById('status');
      if (status) {
        status.textContent = `Player ${currentPlayer} wins!`;
      }
        
        const { start, end } = result;
        drawStrikeThrough(start[0], start[1], end[0], end[1]);
        gameOver = true; // ✅ Stop further moves
        return;          // ✅ Exit early
      }

      // ✅ Only switch player if no win
      currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
      console.log('Current player:', currentPlayer);

      // Debugging: Ensure status element exists before updating
      const status = document.getElementById('status');
      if (!status) {
        console.error('status element not found in the DOM.');
        return;
      }
      status.textContent = `Player ${currentPlayer}'s turn`;
    }
  }
}


function addMark(row, col, player) {
  let mesh;
  if (player === 'X') {
    mesh = createXMark();
  } else {
    mesh = createOMark();
  }
  mesh.position.set((col - 1) * cellSize, 0.2, (row - 1) * cellSize);
  mesh.userData = { isMark: true }; // Mark this mesh as a game mark
  boardGroup.add(mesh);
}

function createXMark() {
  const group = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ color: 0x33d1ff });
  const bar1 = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.4, 0.3), mat);
  const bar2 = bar1.clone();

  bar1.rotation.y = Math.PI / 4;
  bar2.rotation.y = -Math.PI / 4;
  group.add(bar1);
  group.add(bar2);
  return group;
}

function createOMark_Torus() {
  const geometry = new THREE.TorusGeometry(0.7, 0.15, 16, 100);
  const material = new THREE.MeshStandardMaterial({ color: 0xff9999 });
  const torus = new THREE.Mesh(geometry, material);
  torus.rotation.x = Math.PI / 2;  // <-- This rotates it to lie flat
  return torus;
}

function createOMark() {
  const geometry = new THREE.SphereGeometry(0.6, 32, 32);
  const material = new THREE.MeshStandardMaterial({ color: 0xff5733 });
  const sphere = new THREE.Mesh(geometry, material);
  return sphere;
}


function checkWin(player) {
  // Check rows
  for (let row = 0; row < 3; row++) {
    if (board[row][0] === player && board[row][1] === player && board[row][2] === player) {
      return { winner: player, start: [row, 0], end: [row, 2] };
    }
  }
  // Check columns
  for (let col = 0; col < 3; col++) {
    if (board[0][col] === player && board[1][col] === player && board[2][col] === player) {
      return { winner: player, start: [0, col], end: [2, col] };
    }
  }
  // Check diagonals
  if (board[0][0] === player && board[1][1] === player && board[2][2] === player) {
    return { winner: player, start: [0, 0], end: [2, 2] };
  }
  if (board[0][2] === player && board[1][1] === player && board[2][0] === player) {
    return { winner: player, start: [0, 2], end: [2, 0] };
  }

  return null;
}


function isDraw() {
  return board.flat().every(cell => cell !== null);
}

function equal(a, b, c) {
  return a && a === b && b === c;
}

function restartGame() {
  // Remove all marks (X and O) from the scene
  boardGroup.children = boardGroup.children.filter((child) => {
    if (child.userData && child.userData.isMark) {
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach((mat) => mat.dispose());
        } else {
          child.material.dispose();
        }
      }
      return false; // Remove this child
    }
    return true; // Keep other children (e.g., the board)
  });

  // Reset game state
  board = Array.from({ length: 3 }, () => Array(3).fill(null));
  currentPlayer = 'X';
  gameOver = false;

  // Remove win message
  const winMessage = document.getElementById('winMessage');
  if (winMessage) winMessage.remove();

  // Reset status text
  const status = document.getElementById('status');
  if (status) {
    status.textContent = "";
  }

  // Reset highlight and strikeLine
  highlight.visible = false;
  if (strikeLine) {
    scene.remove(strikeLine);
    strikeLine = null;
  }
}

function resetGame() {
  // Clear the board
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      board[row][col] = null;
    }
  }

  // Remove all children from the boardGroup
  while (boardGroup.children.length > 0) {
    const child = boardGroup.children[0];
    if (child.geometry) child.geometry.dispose();
    if (child.material) child.material.dispose();
    boardGroup.remove(child);
  }

  // Remove the boardGroup from the scene
  scene.remove(boardGroup);

  // Recreate the board
  buildBoard();

  // Reset game state
  currentPlayer = 'X';
  gameOver = false;

  // Remove win message
  const winMessage = document.getElementById('winMessage');
  if (winMessage) winMessage.remove();

  // Reset status text
  const status = document.getElementById('status');
  if (status) {
    status.textContent = `Player X's turn`;
  }
}

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

function onMouseMove(event) {
  const rect = renderer.domElement.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(boardGroup.children);

  let found = false;

  for (let i = 0; i < intersects.length; i++) {
    const obj = intersects[i].object;
    if (obj.userData && obj.userData.row !== undefined) {
      const { row, col } = obj.userData;
      highlight.position.set((col - 1) * cellSize, 0.015, (row - 1) * cellSize);
      highlight.visible = true;
      found = true;
      break;
    }
  }

  if (!found) {
    highlight.visible = false;
  }
}

function drawStrikeThrough(startRow, startCol, endRow, endCol) {
  // Remove any previous strike line
  if (strikeLine) {
    scene.remove(strikeLine);
  }

  const material = new THREE.MeshStandardMaterial({ color: 0xaaffaa });
  const distance = Math.sqrt(
    Math.pow(endCol - startCol, 2) + Math.pow(endRow - startRow, 2)
  );
  const length = cellSize * (distance === 0 ? 1 : distance + 1);

  const geometry = new THREE.BoxGeometry(length, 0.1, 0.1, 32);
  //const geometry = new THREE.CylinderGeometry(length, 0.1, 0.1, 32);
  strikeLine = new THREE.Mesh(geometry, material);

  // Midpoint between the two cells
  const midX = ((startCol + endCol) / 2 - 1) * cellSize;
  const midZ = ((startRow + endRow) / 2 - 1) * cellSize;

  strikeLine.position.set(midX, 0.1, midZ);

  // Rotation angle
  const angle = Math.atan2(endRow - startRow, endCol - startCol);
  strikeLine.rotation.y = -angle;

  scene.add(strikeLine);
}
