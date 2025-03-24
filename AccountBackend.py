from flask import Flask, render_template, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_mail import Mail, Message
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///users.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
db = SQLAlchemy(app)

app.config["MAIL_SERVER"] = "smtp.gmail.com"
app.config["MAIL_PORT"] = 587
app.config["MAIL_USE_TLS"] = True
app.config["MAIL_USERNAME"] = "chompcalendar@gmail.com"
app.config["MAIL_PASSWORD"] = "cdix gyrx zgdw datk"
app.config["MAIL_DEFAULT_SENDER"] = "chompcalendar@gmail.com"

mail = Mail(app)

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(120), nullable=False)

    def __repr__(self):
        return f"<User {self.username}>"

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

@app.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    username = data.get("username")
    email = data.get("email")
    password = data.get("password")

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

@app.route("/calendar")
def dashboard():
    return "<h1>Chomp Calendar Holder</h1>"

if __name__ == "__main__":
    app.run(debug=True)
