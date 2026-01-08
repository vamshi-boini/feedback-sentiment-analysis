from datetime import timedelta
import os
from flask import Flask, request
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_jwt_extended import (
    JWTManager, create_access_token, jwt_required, get_jwt_identity
)
from dotenv import load_dotenv
from textblob import TextBlob
from flask_cors import CORS

load_dotenv()

app = Flask(__name__)

# Updated CORS for production deployment
CORS(app, origins="*", supports_credentials=False)



# Config
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "dev-secret")
app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DATABASE_URL")
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "dev-jwt-secret")
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=4)

db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)

# Models
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    full_name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)


class Feedback(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    message = db.Column(db.Text, nullable=False)
    sentiment = db.Column(db.String(20), nullable=False)
    created_at = db.Column(db.DateTime, server_default=db.func.now())

# Helpers
def hash_password(password: str) -> str:
    return bcrypt.generate_password_hash(password).decode("utf-8")


def check_password(hash_value: str, password: str) -> bool:
    return bcrypt.check_password_hash(hash_value, password)
# Health check route
@app.get("/")
def home():
    return {"message": "Feedback Sentiment Analysis API is running", "status": "ok"}

# Auth routes
@app.post("/api/register")
def register():
    data = request.get_json() or {}
    name = data.get("fullName") or data.get("name")
    email = data.get("email")
    password = data.get("password")

    if not all([name, email, password]):
        return {"message": "Name, email and password are required"}, 400

    if User.query.filter_by(email=email).first():
        return {"message": "Email already registered"}, 400

    user = User(full_name=name, email=email, password_hash=hash_password(password))
    db.session.add(user)
    db.session.commit()

    # auto-login after register; store id as string in JWT
    token = create_access_token(identity=str(user.id))

    return {
        "user": {"id": user.id, "name": user.full_name, "email": user.email},
        "token": token,
    }, 201


@app.post("/api/login")
def login():
    data = request.get_json() or {}
    email = data.get("email")
    password = data.get("password")

    user = User.query.filter_by(email=email).first()
    if not user or not check_password(user.password_hash, password):
        return {"message": "Invalid email or password"}, 401

    token = create_access_token(identity=str(user.id))

    return {
        "user": {"id": user.id, "name": user.full_name, "email": user.email},
        "token": token,
    }

@app.post("/api/change-password")
@jwt_required()
def change_password():
    user_id = int(get_jwt_identity())
    user = User.query.get_or_404(user_id)

    data = request.get_json() or {}
    current_password = data.get("currentPassword")
    new_password = data.get("newPassword")

    if not check_password(user.password_hash, current_password):
        return {"message": "Current password is incorrect"}, 400

    user.password_hash = hash_password(new_password)
    db.session.commit()
    return {"message": "Password updated successfully"}

@app.post("/api/forgot-password")
def forgot_password():
    data = request.get_json() or {}
    email = data.get("email")
    if not email:
        return {"message": "Email is required"}, 400

    user = User.query.filter_by(email=email).first()
    if not user:
        return {"message": "If that email exists, reset instructions were sent."}

    return {"message": "Password reset instructions (demo) would be sent."}

# Feedback + sentiment
@app.post("/api/feedback")
@jwt_required()
def create_feedback():
    user_id = int(get_jwt_identity())
    data = request.get_json(force=True, silent=True) or {}
    print("FEEDBACK DATA:", data)

    message = str(data.get("message", "")).strip()
    if not message:
        return {"message": "Feedback message is required"}, 400

    blob = TextBlob(message)
    polarity = float(blob.sentiment.polarity)

    if polarity > 0.10:
        sentiment = "positive"
    elif polarity < -0.10:
        sentiment = "negative"
    else:
        sentiment = "neutral"  # neutral band around zero.[web:119][web:121][web:130][web:123]

    fb = Feedback(
        user_id=user_id,
        message=message,
        sentiment=sentiment,
    )
    db.session.add(fb)
    db.session.commit()

    return {
        "id": fb.id,
        "sentiment": fb.sentiment,
        "polarity": polarity,
        "createdAt": fb.created_at.isoformat() if fb.created_at else None,
    }, 201

@app.get("/api/summary")
@jwt_required()
def summary():
    # only needs token to be valid; user id is not used here
    total = Feedback.query.count()
    positive = Feedback.query.filter_by(sentiment="positive").count()
    neutral = Feedback.query.filter_by(sentiment="neutral").count()
    negative = Feedback.query.filter_by(sentiment="negative").count()

    return {
        "total": total,
        "positive": positive,
        "neutral": neutral,
        "negative": negative,
    }

@app.get("/api/me")
@jwt_required()
def me():
    user_id = int(get_jwt_identity())
    user = User.query.get_or_404(user_id)
    return {"id": user.id, "name": user.full_name, "email": user.email}

if __name__ == "__main__":
    port = int(os.getenv('PORT', 5000))
    with app.app_context():
        db.create_all()
    app.run(host='0.0.0.0', port=port, debug=False)

