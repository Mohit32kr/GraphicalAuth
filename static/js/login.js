const img = document.getElementById("authImage");
const imageSelect = document.getElementById("imageSelect");
const loginBtn = document.getElementById("loginBtn");
const clearBtn = document.getElementById("clearLoginPointsBtn");
const reshuffleBtn = document.getElementById("reshuffleBtn");
const imgContainer = document.getElementById("imgContainer");
const pointCounter = document.getElementById("pointCounter");

const GRID_SIZE = 3;
const MIN_CLICKS = 3;
const MAX_CLICKS = 5;

let selectedCoords = [];
let displayToSourceTiles = [];

function updatePointCounter() {
  pointCounter.textContent = `Selected points: ${selectedCoords.length}`;
}

function clearMarkers() {
  document.querySelectorAll(".click-marker").forEach((marker) => marker.remove());
}

function resetSelection() {
  selectedCoords = [];
  clearMarkers();
  updatePointCounter();
}

function shuffle(array) {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function getOrCreateFragmentBoard() {
  let board = document.getElementById("fragmentBoard");
  if (!board) {
    board = document.createElement("div");
    board.id = "fragmentBoard";
    board.className = "fragment-board hidden";
    imgContainer.appendChild(board);
  }
  return board;
}

function addMarkerOnBoard(x, y) {
  const marker = document.createElement("div");
  marker.className = "click-marker";
  marker.style.position = "absolute";
  marker.style.width = "10px";
  marker.style.height = "10px";
  marker.style.borderRadius = "50%";
  marker.style.backgroundColor = "red";
  marker.style.left = `${x - 5}px`;
  marker.style.top = `${y - 5}px`;
  marker.style.pointerEvents = "none";
  getOrCreateFragmentBoard().appendChild(marker);
}

function hideBoard() {
  const board = getOrCreateFragmentBoard();
  board.innerHTML = "";
  board.classList.add("hidden");
  img.classList.remove("hidden");
}

function renderFragmentBoard() {
  const selectedImage = imageSelect.value;
  const board = getOrCreateFragmentBoard();
  if (!selectedImage) {
    hideBoard();
    return;
  }

  const source = `/static/images/${selectedImage}`;
  const totalTiles = GRID_SIZE * GRID_SIZE;
  displayToSourceTiles = shuffle([...Array(totalTiles).keys()]);

  board.innerHTML = "";
  board.classList.remove("hidden");
  img.classList.add("hidden");

  displayToSourceTiles.forEach((sourceTileIndex) => {
    const tile = document.createElement("div");
    const sourceCol = sourceTileIndex % GRID_SIZE;
    const sourceRow = Math.floor(sourceTileIndex / GRID_SIZE);
    const posX = GRID_SIZE === 1 ? 0 : (sourceCol / (GRID_SIZE - 1)) * 100;
    const posY = GRID_SIZE === 1 ? 0 : (sourceRow / (GRID_SIZE - 1)) * 100;

    tile.className = "fragment-tile";
    tile.style.backgroundImage = `url("${source}")`;
    tile.style.backgroundSize = `${GRID_SIZE * 100}% ${GRID_SIZE * 100}%`;
    tile.style.backgroundPosition = `${posX}% ${posY}%`;
    board.appendChild(tile);
  });
}

function mapBoardClickToCanonicalCoord(event) {
  const board = getOrCreateFragmentBoard();
  const rect = board.getBoundingClientRect();
  const relativeX = (event.clientX - rect.left) / rect.width;
  const relativeY = (event.clientY - rect.top) / rect.height;

  if (relativeX < 0 || relativeX > 1 || relativeY < 0 || relativeY > 1) {
    return null;
  }

  const displayCol = Math.min(GRID_SIZE - 1, Math.floor(relativeX * GRID_SIZE));
  const displayRow = Math.min(GRID_SIZE - 1, Math.floor(relativeY * GRID_SIZE));
  const displayIndex = displayRow * GRID_SIZE + displayCol;
  const sourceTileIndex = displayToSourceTiles[displayIndex];

  if (typeof sourceTileIndex !== "number") {
    return null;
  }

  const localX = relativeX * GRID_SIZE - displayCol;
  const localY = relativeY * GRID_SIZE - displayRow;
  const sourceCol = sourceTileIndex % GRID_SIZE;
  const sourceRow = Math.floor(sourceTileIndex / GRID_SIZE);

  return {
    canonicalX: (sourceCol + localX) / GRID_SIZE,
    canonicalY: (sourceRow + localY) / GRID_SIZE,
    markerX: relativeX * rect.width,
    markerY: relativeY * rect.height,
  };
}

getOrCreateFragmentBoard().addEventListener("click", (e) => {
  if (!imageSelect.value) {
    alert("Please select an image first!");
    return;
  }

  if (selectedCoords.length >= MAX_CLICKS) {
    alert(`You can select at most ${MAX_CLICKS} points.`);
    return;
  }

  const mapped = mapBoardClickToCanonicalCoord(e);
  if (!mapped) {
    return;
  }

  selectedCoords.push([mapped.canonicalX, mapped.canonicalY]);
  addMarkerOnBoard(mapped.markerX, mapped.markerY);
  updatePointCounter();
});

imageSelect.addEventListener("change", () => {
  const selectedImage = imageSelect.value;
  if (!selectedImage) {
    hideBoard();
    resetSelection();
    return;
  }
  img.src = `/static/images/${selectedImage}`;
  renderFragmentBoard();
  resetSelection();
});

clearBtn.addEventListener("click", () => {
  resetSelection();
});

reshuffleBtn.addEventListener("click", () => {
  if (!imageSelect.value) {
    alert("Please select an image first!");
    return;
  }
  renderFragmentBoard();
  resetSelection();
});

loginBtn.addEventListener("click", async () => {
  const username = document.getElementById("username").value.trim();
  const image = imageSelect.value;

  if (!username) {
    alert("Please enter a username!");
    return;
  }
  if (!image) {
    alert("Please select an image!");
    return;
  }
  if (selectedCoords.length < MIN_CLICKS || selectedCoords.length > MAX_CLICKS) {
    alert(`Please click between ${MIN_CLICKS} and ${MAX_CLICKS} points before login.`);
    return;
  }

  try {
    const response = await fetch("/login_user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username,
        image,
        coordinates: selectedCoords,
      }),
    });

    const data = await response.json();
    alert(data.message);

    // Always reshuffle after each login attempt.
    renderFragmentBoard();
    resetSelection();
  } catch (err) {
    console.error("Error:", err);
    alert("Error contacting server. Check console for details.");
  }
});

updatePointCounter();
hideBoard();
