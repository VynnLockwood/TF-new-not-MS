from app import db


class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    picture = db.Column(db.String(200), nullable=True)

    # Relationships
    recipes = db.relationship('Recipe', back_populates='user', lazy='dynamic', cascade="all, delete-orphan")
    ratings = db.relationship('Rating', back_populates='user', lazy='dynamic', cascade="all, delete-orphan")
    likes = db.relationship('Like', back_populates='user', lazy='dynamic', cascade="all, delete-orphan")
    comments = db.relationship('Comment', back_populates='user', lazy='dynamic', cascade="all, delete-orphan")
    favorites = db.relationship('Favorite', back_populates='user', lazy='dynamic', cascade="all, delete-orphan")

    def __repr__(self):
        return f"<User {self.name}>"
