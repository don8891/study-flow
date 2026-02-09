from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# TEMPORARY in-memory store
users = {}

@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "ok",
        "message": "Study Flow backend running"
    })

@app.route("/register", methods=["POST"])
def register():
    data = request.json
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"success": False, "message": "Missing fields"}), 400

    if email in users:
        return jsonify({"success": False, "message": "User already exists"}), 409

    users[email] = password
    return jsonify({"success": True})

@app.route("/login", methods=["POST"])
def login():
    data = request.json
    email = data.get("email")
    password = data.get("password")

    if users.get(email) != password:
        return jsonify({"success": False, "message": "Invalid credentials"}), 401

    return jsonify({"success": True})

if __name__ == "__main__":
    app.run(debug=True)
