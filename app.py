from flask import Flask, render_template, request, jsonify
import sqlite3
import json
import math
import time
import os

app = Flask(__name__)

DB_PATH = "database.db"
MIN_CLICKS = 3
MAX_CLICKS = 5
COORD_TOLERANCE = 0.04
MAX_LOGIN_ATTEMPTS = 5
RATE_LIMIT_WINDOW_SECONDS = 5 * 60
FAILED_ATTEMPTS = {}
LEGACY_IMG_WIDTH = 450
LEGACY_IMG_HEIGHT = 300
ALLOWED_IMAGES = {"img1.jpg", "img2.jpg", "img3.jpg"}


# -----------------------------
# DATABASE INITIALIZATION
# -----------------------------
def init_db():
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    cur.execute(
        """CREATE TABLE IF NOT EXISTS users (
                username TEXT PRIMARY KEY,
                image TEXT NOT NULL,
                coordinates TEXT NOT NULL
           )"""
    )

    conn.commit()
    conn.close()


init_db()


# -----------------------------
# INPUT VALIDATION FUNCTIONS
# -----------------------------
def _validate_username(value):

    if not isinstance(value, str):
        return None

    username = value.strip()

    if not username or len(username) > 64:
        return None

    return username


def _validate_image(value):

    if not isinstance(value, str):
        return None

    image = value.strip()

    if image not in ALLOWED_IMAGES:
        return None

    return image


def _validate_coordinates(value):

    if not isinstance(value, list) or not (MIN_CLICKS <= len(value) <= MAX_CLICKS):
        return None

    cleaned_coords = []

    for point in value:

        if (
            not isinstance(point, (list, tuple))
            or len(point) != 2
            or not all(isinstance(v, (int, float)) for v in point)
        ):
            return None

        x, y = float(point[0]), float(point[1])

        if x < 0 or x > 1 or y < 0 or y > 1:
            return None

        cleaned_coords.append([x, y])

    return cleaned_coords


def _validate_payload(payload):

    if not isinstance(payload, dict):
        return None

    username = _validate_username(payload.get("username"))
    image = _validate_image(payload.get("image"))
    coordinates = _validate_coordinates(payload.get("coordinates"))

    if username is None or image is None or coordinates is None:
        return None

    return username, image, coordinates


# -----------------------------
# RATE LIMIT HELPER
# -----------------------------
def _rate_limit_key(username):

    client_ip = request.headers.get("X-Forwarded-For", request.remote_addr) or "unknown"

    return f"{client_ip}:{username.lower()}"


# -----------------------------
# ALGORITHM 3
# Secure Login Attempt Regulation Algorithm (SLARA)
# -----------------------------
def secure_login_attempt_regulation(key):

    now = time.time()

    attempts = FAILED_ATTEMPTS.get(key, [])

    attempts = [ts for ts in attempts if now - ts < RATE_LIMIT_WINDOW_SECONDS]

    FAILED_ATTEMPTS[key] = attempts

    return len(attempts) >= MAX_LOGIN_ATTEMPTS


def _record_failed_attempt(key):

    now = time.time()

    attempts = FAILED_ATTEMPTS.get(key, [])

    attempts = [ts for ts in attempts if now - ts < RATE_LIMIT_WINDOW_SECONDS]

    attempts.append(now)

    FAILED_ATTEMPTS[key] = attempts


def _clear_failed_attempts(key):

    FAILED_ATTEMPTS.pop(key, None)


# -----------------------------
# ALGORITHM 2
# Dynamic Coordinate Normalization Algorithm (DCNA)
# -----------------------------
def dynamic_coordinate_normalization(saved_coords):

    if not isinstance(saved_coords, list) or not (MIN_CLICKS <= len(saved_coords) <= MAX_CLICKS):
        return None

    normalized = []

    for point in saved_coords:

        if (
            not isinstance(point, (list, tuple))
            or len(point) != 2
            or not all(isinstance(v, (int, float)) for v in point)
        ):
            return None

        x, y = float(point[0]), float(point[1])

        # Normalize legacy coordinates
        if x > 1 or y > 1:
            x = x / LEGACY_IMG_WIDTH
            y = y / LEGACY_IMG_HEIGHT

        if x < 0 or x > 1 or y < 0 or y > 1:
            return None

        normalized.append([x, y])

    return normalized


# -----------------------------
# ALGORITHM 1
# Adaptive Image Click Authentication Algorithm (AICAA)
# -----------------------------
def adaptive_click_authentication(saved_coords, login_coords, tolerance):

    if len(saved_coords) != len(login_coords):
        return False

    for (x1, y1), (x2, y2) in zip(saved_coords, login_coords):

        distance = math.hypot(x1 - x2, y1 - y2)

        if distance > tolerance:
            return False

    return True


# -----------------------------
# USER REGISTRATION
# -----------------------------
@app.route("/register_user", methods=["POST"])
def register_user():

    payload = _validate_payload(request.get_json(silent=True))

    if payload is None:
        return jsonify({"message": "Invalid registration request."}), 400

    username, image, coordinates = payload

    coords_json = json.dumps(coordinates, separators=(",", ":"))

    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    try:

        cur.execute(
            "INSERT INTO users (username, image, coordinates) VALUES (?, ?, ?)",
            (username, image, coords_json),
        )

        conn.commit()

    except sqlite3.IntegrityError:

        conn.close()

        return jsonify({"message": "Username already exists. Please choose another."}), 409

    conn.close()

    return jsonify({"message": "User registered successfully!"})


# -----------------------------
# USER LOGIN
# -----------------------------
@app.route("/login_user", methods=["POST"])
def login_user():

    payload = _validate_payload(request.get_json(silent=True))

    if payload is None:
        return jsonify({"message": "Invalid login request."}), 400

    username, image, login_coords = payload

    rate_limit_key = _rate_limit_key(username)

    # Apply SLARA
    if secure_login_attempt_regulation(rate_limit_key):

        return jsonify({"message": "Too many failed attempts. Try again later."}), 429

    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    cur.execute(
        "SELECT coordinates FROM users WHERE username=? AND image=?",
        (username, image),
    )

    row = cur.fetchone()

    conn.close()

    if not row:

        _record_failed_attempt(rate_limit_key)

        return jsonify({"message": "Access Denied!"}), 401

    saved_coords_raw = row[0]

    try:

        saved_coords = json.loads(saved_coords_raw)

    except json.JSONDecodeError:

        _record_failed_attempt(rate_limit_key)

        return jsonify({"message": "Access Denied!"}), 401

    # Apply DCNA
    normalized_saved_coords = dynamic_coordinate_normalization(saved_coords)

    if normalized_saved_coords is None or len(normalized_saved_coords) != len(login_coords):

        _record_failed_attempt(rate_limit_key)

        return jsonify({"message": "Access Denied!"}), 401

    # Apply AICAA
    auth_result = adaptive_click_authentication(
        normalized_saved_coords,
        login_coords,
        COORD_TOLERANCE,
    )

    if not auth_result:

        _record_failed_attempt(rate_limit_key)

        return jsonify({"message": "Access Denied!"}), 401

    _clear_failed_attempts(rate_limit_key)

    return jsonify({"message": "Access Granted!"})


# -----------------------------
# ROUTES
# -----------------------------
@app.route("/")
def home():
    return render_template("register.html")


@app.route("/login")
def login():
    return render_template("login.html")


# -----------------------------
# RUN SERVER
# -----------------------------
if __name__ == "__main__":
    app.run(debug=os.getenv("FLASK_DEBUG") == "1")