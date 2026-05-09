const img = document.getElementById("authImage");
const imageSelect = document.getElementById("imageSelect");
const registerBtn = document.getElementById("registerBtn");
const clearBtn = document.getElementById("clearRegisterPointsBtn");
const imgContainer = document.getElementById("imgContainer");
const pointCounter = document.getElementById("pointCounter");

const MIN_CLICKS = 3;
const MAX_CLICKS = 5;
let selectedCoords = [];

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

function addMarker(left, top) {
  const marker = document.createElement("div");
  marker.className = "click-marker";
  marker.style.position = "absolute";
  marker.style.width = "10px";
  marker.style.height = "10px";
  marker.style.borderRadius = "50%";
  marker.style.backgroundColor = "red";
  marker.style.left = `${left - 5}px`;
  marker.style.top = `${top - 5}px`;
  marker.style.pointerEvents = "none";
  imgContainer.appendChild(marker);
}

imageSelect.addEventListener("change", () => {
  img.src = `/static/images/${imageSelect.value}`;
  resetSelection();
});

clearBtn.addEventListener("click", () => {
  resetSelection();
});

img.addEventListener("click", (e) => {
  if (!imageSelect.value) {
    alert("Please select an image first!");
    return;
  }

  if (selectedCoords.length >= MAX_CLICKS) {
    alert(`You can select at most ${MAX_CLICKS} points.`);
    return;
  }

  const rect = img.getBoundingClientRect();
  const localX = e.clientX - rect.left;
  const localY = e.clientY - rect.top;
  const x = localX / rect.width;
  const y = localY / rect.height;

  selectedCoords.push([x, y]);
  addMarker(localX, localY);
  updatePointCounter();
});

registerBtn.addEventListener("click", async () => {
  const username = document.getElementById("username").value.trim();
  const image = imageSelect.value;

  if (!username) {
    alert("Please enter a username.");
    return;
  }
  if (!image) {
    alert("Please select an image.");
    return;
  }
  if (selectedCoords.length < MIN_CLICKS || selectedCoords.length > MAX_CLICKS) {
    alert(`Please select between ${MIN_CLICKS} and ${MAX_CLICKS} points.`);
    return;
  }

  try {
    const response = await fetch("/register_user", {
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

    if (response.ok) {
      resetSelection();
    }
  } catch (err) {
    console.error("Error:", err);
    alert("Error contacting server. Check console for details.");
  }
});

updatePointCounter();
