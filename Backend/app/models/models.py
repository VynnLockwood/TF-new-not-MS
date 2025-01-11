from datetime import datetime
from app import db
from app.models.user import User  # Import User model from user.py


class Recipe(db.Model):
    __tablename__ = 'recipes'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    cover_image = db.Column(db.String(500), nullable=True)
    ingredients = db.Column(db.Text, nullable=False)  # Store as JSON string
    instructions = db.Column(db.Text, nullable=False)  # Store as JSON string
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    user = db.relationship('User', back_populates='recipes')
    ratings = db.relationship('Rating', back_populates='recipe', lazy='dynamic', cascade="all, delete-orphan")
    likes = db.relationship('Like', back_populates='recipe', lazy='dynamic', cascade="all, delete-orphan")
    comments = db.relationship('Comment', back_populates='recipe', lazy='dynamic', cascade="all, delete-orphan")
    favorites = db.relationship('Favorite', back_populates='recipe', lazy='dynamic', cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Recipe {self.name}>"

class Rating(db.Model):
    __tablename__ = 'ratings'
    id = db.Column(db.Integer, primary_key=True)
    recipe_id = db.Column(db.Integer, db.ForeignKey('recipes.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    score = db.Column(db.Integer, nullable=False)  # Range: 1-5
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    recipe = db.relationship('Recipe', back_populates='ratings')
    user = db.relationship('User', back_populates='ratings')

    def __repr__(self):
        return f"<Rating {self.score} for Recipe {self.recipe_id}>"

class Like(db.Model):
    __tablename__ = 'likes'
    id = db.Column(db.Integer, primary_key=True)
    recipe_id = db.Column(db.Integer, db.ForeignKey('recipes.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    recipe = db.relationship('Recipe', back_populates='likes')
    user = db.relationship('User', back_populates='likes')

    def __repr__(self):
        return f"<Like by User {self.user_id} for Recipe {self.recipe_id}>"

class Comment(db.Model):
    __tablename__ = 'comments'
    id = db.Column(db.Integer, primary_key=True)
    recipe_id = db.Column(db.Integer, db.ForeignKey('recipes.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    recipe = db.relationship('Recipe', back_populates='comments')
    user = db.relationship('User', back_populates='comments')

    def __repr__(self):
        return f"<Comment {self.id} by User {self.user_id} on Recipe {self.recipe_id}>"

class Favorite(db.Model):
    __tablename__ = 'favorites'
    id = db.Column(db.Integer, primary_key=True)
    recipe_id = db.Column(db.Integer, db.ForeignKey('recipes.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    recipe = db.relationship('Recipe', back_populates='favorites')
    user = db.relationship('User', back_populates='favorites')

    def __repr__(self):
        return f"<Favorite by User {self.user_id} for Recipe {self.recipe_id}>"
