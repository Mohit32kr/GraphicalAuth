# Graphical User Authentication System 🔐

A secure image-based authentication system that replaces traditional text passwords with graphical click-point verification.

---

## 📌 Project Overview

The Graphical User Authentication System allows users to register and log in by selecting predefined points on an image instead of typing a password. During login, the system verifies the clicked coordinates using tolerance-based matching to ensure both security and usability.

This approach improves resistance against brute-force attacks, keylogging, and shoulder-surfing compared to traditional password-based authentication systems.

---

## 🚀 Features

- Image-based password selection
- Click-point authentication using coordinates
- Tolerance-based verification for usability
- Secure user registration and login
- Clean and responsive user interface
- SQLite database integration

---

## 🛠️ Tech Stack

- **Backend**: Python (Flask)
- **Frontend**: HTML, CSS, JavaScript
- **Database**: SQLite
- **Version Control**: Git & GitHub

---

## 📂 Project Structure

GraphicalAuth/
│
├── app.py
├── static/
│ ├── css/
│ │ └── style.css
│ ├── js/
│ │ ├── login.js
│ │ └── register.js
│ └── images/
│ ├── img1.jpg
│ ├── img2.jpg
│ └── img3.jpg
│
├── templates/
│ ├── login.html
│ └── register.html
│
├── .gitignore
├── README.md
└── LICENSE

---

## ▶️ How to Run the Project

1. Clone the repository:
```bash
git clone https://github.com/YOUR_USERNAME/GraphicalAuth.git

2. Navigate to the project folder:

cd GraphicalAuth


3. Install Flask:

pip install flask


4. Run the application:

python app.py


5. Open your browser and visit:

http://127.0.0.1:5000

🔐 Security Highlights

Eliminates traditional text passwords

Resistant to brute-force attacks

Reduced risk of keylogging

Click-point tolerance improves user experience

📌 Future Enhancements

Password hashing and encryption

Multi-image authentication

Mobile-friendly gesture authentication

Integration with machine learning for pattern analysis

👨‍💻 Author

Mohit