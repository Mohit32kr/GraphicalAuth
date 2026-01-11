from flask import Flask, render_template, request, jsonify
import sqlite3, json, math, os

app = Flask(__name__)

DB_PATH = "database.db"

# Creating DB 
def init_db():
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute('''CREATE TABLE IF NOT EXISTS users (
                    username TEXT PRIMARY KEY,
                    image TEXT,
                    coordinates TEXT
                )''')
    conn.commit()
    conn.close()

init_db()

# Save new user registration
@app.route("/register_user", methods=["POST"])
def register_user():
    data = request.json
    username = data["username"]
    image = data["image"]
    coords = json.dumps(data["coordinates"])

    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute("INSERT OR REPLACE INTO users VALUES (?, ?, ?)", (username, image, coords))
    conn.commit()
    conn.close()

    return jsonify({"message": "User registered successfully!"})

# Login verification
@app.route("/login_user", methods=["POST"])
def login_user():
    data = request.json
    username = data["username"]
    image = data["image"]
    coords = data["coordinates"]

    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute("SELECT coordinates FROM users WHERE username=? AND image=?", (username, image))
    row = cur.fetchone()
    conn.close()

    if not row:
        return jsonify({"message": "User not found!"})

    saved_coords = json.loads(row[0])
    tolerance = 20  # pixels

    if len(saved_coords) != len(coords):
        return jsonify({"message": "Access Denied! Wrong number of points."})

    for (x1, y1), (x2, y2) in zip(saved_coords, coords):
        if math.hypot(x1 - x2, y1 - y2) > tolerance:
            return jsonify({"message": "Access Denied! Coordinates don't match."})

    return jsonify({"message": "Access Granted!"})

@app.route("/")
def home():
    return render_template("register.html")

@app.route("/login")
def login():
    return render_template("login.html")

if __name__ == "__main__":
    app.run(debug=True)
