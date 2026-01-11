const img = document.getElementById("authImage");
const imageSelect = document.getElementById("imageSelect");
const loginBtn = document.getElementById("loginBtn");
let selectedCoords = [];
const requiredClicks = 3;

// --- When user changes the image ---
imageSelect.addEventListener("change", () => {
    const selectedImage = imageSelect.value;
    if (!selectedImage) return;
    img.src = `/static/images/${selectedImage}`;
    selectedCoords = [];
    console.log("Loaded image:", selectedImage);
});

// --- When user clicks on the image ---
img.addEventListener("click", (e) => {
    if (!img.src || !img.src.includes("/static/images/")) {
        alert("Please select an image first!");
        return;
    }

    const rect = img.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    selectedCoords.push([x, y]);
    console.log("Selected coords:", selectedCoords);

    // Visual marker for each click
    const marker = document.createElement("div");
    marker.style.position = "absolute";
    marker.style.width = "10px";
    marker.style.height = "10px";
    marker.style.borderRadius = "50%";
    marker.style.backgroundColor = "red";
    marker.style.left = `${x - 5}px`;
    marker.style.top = `${y - 5}px`;
    marker.style.pointerEvents = "none";
    document.getElementById("imgContainer").appendChild(marker);
});

// --- When user clicks Login ---
loginBtn.addEventListener("click", async () => {
    const username = document.getElementById("username").value.trim();
    const selectedImage = imageSelect.value;

    if (!username) {
        alert("Please enter a username!");
        return;
    }

    if (!selectedImage) {
        alert("Please select an image!");
        return;
    }

    if (selectedCoords.length < requiredClicks) {
        alert(`Please click on ${requiredClicks} points before login.`);
        return;
    }

    console.log("Sending data to backend:", {
        username,
        image: selectedImage,
        coordinates: selectedCoords,
    });

    try {
        const response = await fetch("/login_user", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                username,
                image: selectedImage,
                coordinates: selectedCoords,
            }),
        });

        const data = await response.json();
        console.log("Server response:", data);
        alert(data.message);

        // Visual feedback on image
        if (data.message.includes("Granted")) {
            img.style.border = "3px solid green";
        } else {
            img.style.border = "3px solid red";
        }

        // Reset markers & coordinates
        const markers = document.querySelectorAll("#imgContainer div");
        markers.forEach((m) => m.remove());
        selectedCoords = [];

    } catch (err) {
        console.error("Error:", err);
        alert("Error contacting server. Check console for details.");
    }
});
