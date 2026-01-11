const img = document.getElementById("authImage");
const imageSelect = document.getElementById("imageSelect");
let selectedCoords = [];

imageSelect.addEventListener("change", () => {
  img.src = `/static/images/${imageSelect.value}`;
  selectedCoords = [];
});

img.addEventListener("click", (e) => {
  const rect = img.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  selectedCoords.push([x, y]);
  console.log("Selected:", selectedCoords);
});

document.getElementById("registerBtn").addEventListener("click", async () => {
  const username = document.getElementById("username").value;
  if (!username || selectedCoords.length < 3) {
    alert("Please enter username and select at least 3 points!");
    return;
  }

  const response = await fetch("/register_user", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username,
      image: imageSelect.value,
      coordinates: selectedCoords,
    }),
  });

  const data = await response.json();
  alert(data.message);
});
