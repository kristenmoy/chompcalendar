from flask import Flask, render_template, request, jsonify, redirect, url_for
from flask_sqlalchemy import SQLAlchemy
from flask_mail import Mail, Message
from werkzeug.security import generate_password_hash, check_password_hash
import re, secrets

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///users.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["MAIL_SERVER"] = "smtp.gmail.com"
app.config["MAIL_PORT"] = 587
app.config["MAIL_USE_TLS"] = True
app.config["MAIL_USERNAME"] = "chompcalendar@gmail.com"
app.config["MAIL_PASSWORD"] = "cdix gyrx zgdw datk"
app.config["MAIL_DEFAULT_SENDER"] = "chompcalendar@gmail.com"

mail = Mail(app)
db = SQLAlchemy(app)

reset_tokens = {}

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)

    def __repr__(self):
        return f"<User {self.username}>"

def is_valid_password(password):
    return (
        len(password) >= 8
        and re.search(r"[A-Z]", password)
        and re.search(r"[a-z]", password)
        and re.search(r"[!@#$%^&*(),.?\":{}|<>]", password)
    )

with app.app_context():
    db.create_all()

@app.route("/")
def signon():
    return render_template("Signin.html")

@app.route("/register")
def register_page():
    return render_template("Register.html")

@app.route("/login")
def login_page():
    return render_template("Login.html")

@app.route("/forgot-password")
def forgot_password():
    return render_template("reset_password.html")

@app.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    username = data.get("username")
    email = data.get("email")
    password = data.get("password")

    if not is_valid_password(password):
        return jsonify({"success": False, "message": "Password must be at least 8 characters long and contain an uppercase letter, lowercase letter, and a special character."})

    if User.query.filter((User.username == username) | (User.email == email)).first():
        return jsonify({"success": False, "message": "Username or email already exists."})

    hashed_password = generate_password_hash(password)
    new_user = User(username=username, email=email, password=hashed_password)
    db.session.add(new_user)
    db.session.commit()

    send_registration_email(email, username)
    return jsonify({"success": True, "message": "Account created successfully! Please check your email."})

def send_registration_email(email, username):
    msg = Message(
        subject="Welcome to Chomp Calendar!",
        recipients=[email],
        body=f"""Hello {username},
        
Your account has been created successfully!
Thank you for using Chomp Calendar!

Best,  
Chomp Calendar Team""")

    try:
        mail.send(msg)
        print("Email sent successfully!")
        return True 
    except Exception as e:
        print(f"Error sending email: {e}") 
        return False

@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    user = User.query.filter_by(username=username).first()

    if not user or not check_password_hash(user.password, password):
        return jsonify({"success": False, "message": "Invalid username or password."})

    return jsonify({"success": True, "message": "Login successful!"})

@app.route("/request-reset", methods=["POST"])
def request_reset():
    data = request.get_json()
    email = data.get("email")
    user = User.query.filter_by(email=email).first()

    if not user:
        return jsonify({"success": False, "message": "Email not found."})

    token = secrets.token_urlsafe(32)
    reset_tokens[token] = email

    reset_link = f"http://localhost:5000/reset-password/{token}"
    msg = Message(
        subject="Chomp Calendar Password Reset",
        recipients=[email],
        body=f"Hello {user.username},\n\nTo reset your password, please click the following link:\n{reset_link}\n\nIf you did not request a password reset, please ignore this email.\n\nChomp Calendar Team"
    )
    try:
        mail.send(msg)
        return jsonify({"success": True, "message": "Password reset email sent."})
    except Exception as e:
        print(f"Error sending reset email: {e}")
        return jsonify({"success": False, "message": "Failed to send reset email."})

@app.route("/reset-password/<token>", methods=["GET", "POST"])
def reset_password(token):
    email = reset_tokens.get(token)
    if not email:
        return "Invalid or expired token.", 400

    if request.method == "GET":
        return render_template("reset_password.html", token=token)

    new_password = request.form["new_password"]
    if not is_valid_password(new_password):
        return "Password does not meet security requirements.", 400

    user = User.query.filter_by(email=email).first()
    user.password = generate_password_hash(new_password)
    db.session.commit()
    del reset_tokens[token]

    return "Password successfully reset!"
@app.route("/calendar")
def dashboard():
    return "<h1>Chomp Calendar Holder</h1>"

if __name__ == "__main__":
    app.run(debug=True)
