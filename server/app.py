from flask import Flask, jsonify, request, session
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_login import LoginManager, UserMixin, login_required, login_user, logout_user, current_user
from flask_cors import CORS
import os

# Configurations
app = Flask(__name__)
basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{os.path.join(basedir, 'db/info.db')}"
app.config['SECRET_KEY'] = 'supersecretkey'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SESSION_COOKIE_SAMESITE'] = 'None'  
app.config['SESSION_COOKIE_SECURE'] = False  
app.config['SESSION_COOKIE_HTTPONLY'] = True 

CORS(app, resources={r"/api/*": {"origins": "http://127.0.0.1:3000"}}, methods=['GET', 'POST', 'PUT', 'DELETE'], supports_credentials=True)

# In production, set to False
app.config['DEBUG'] = True
app.config['SQLALCHEMY_ECHO'] = True

# extensions
db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
login_manager =  LoginManager(app)
login_manager.login_view = 'login'

# User Model
class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(150), nullable=False, unique=True)
    email = db.Column(db.String(150), nullable=False, unique=True)
    password = db.Column(db.String(256), nullable=False)
    phone = db.Column(db.String(15), nullable=True)  
    company = db.Column(db.String(150), nullable=True) 
    sns_links = db.Column(db.Text, nullable=True) 

class Post(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    location = db.Column(db.String(200), nullable=False)  
    time = db.Column(db.String(50), nullable=False)  
    capacity = db.Column(db.Integer, nullable=False)  
    creator_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)  # Foreign key to User
    description = db.Column(db.Text, nullable=True)  

    # Relationship with User
    creator = db.relationship('User', backref='posts')

    # Relationship with RSVP
    rsvps = db.relationship('RSVP', cascade="all, delete-orphan", back_populates='post')

class RSVP(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)  # Who RSVP'd
    post_id = db.Column(db.Integer, db.ForeignKey('post.id'), nullable=False)  # The event
    status = db.Column(db.String(50), nullable=False, default='pending')  # RSVP status
    # Relationships
    user = db.relationship('User', backref='rsvps')
    post = db.relationship('Post', back_populates='rsvps') 

# Create tables
with app.app_context():
    db.create_all()

# login load the current user from the session
@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

@login_manager.unauthorized_handler
def unauthorized_callback():
    return jsonify({'message': 'Unauthorized. Please log in.'}), 401

# Register Route
@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    #check if the email or username already exists in the database
    existing_user = User.query.filter((User.email == email) | (User.username == username)).first()

    if existing_user:
        return jsonify({'message': 'User already exits! Please choose a different email or username.'})

    # hash the password
    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')

    # create a new user
    new_user = User(username=username, email=email, password=hashed_password)

    # add to database
    db.session.add(new_user)
    db.session.commit()

    return jsonify({'message': 'User registered successfully!'}),201

#login route
@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    user = User.query.filter_by(email =email).first()

    if user and bcrypt.check_password_hash(user.password, password):
        login_user(user)
        print(f"User {user.username} logged in successfully")
        return jsonify({'message': f'Logged in as {user.username}'}), 200
    else:
        print("Invalid login credentials")
        return jsonify({'message': 'Invalid credentials'}), 400

#logout route
@app.route('/api/logout', methods =['GET'])
@login_required
def logout():
    print("test")
    logout_user()
    return jsonify({'message': 'Logged out successfully'}), 200

#view profile route
@app.route('/api/profile', methods=['GET'])
@login_required
def get_profile():
    user = current_user  
    print(f"Request method: {request.method}")
    print(f"Fetching profile for user: {current_user.username}")
    return jsonify({
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'phone': user.phone,
        'company': user.company,
        'sns_links': user.sns_links
    }), 200


#edit profile route
@app.route('/api/profile', methods=['PUT'])
@login_required
def edit_profile():
    data = request.get_json()
    user = current_user 

    #Updata fileds if provided
    user.phone = data.get('phone', user.phone)
    user.company = data.get('company', user.company)
    user.sns_links = data.get('sns_links', user.sns_links)

    db.session.commit()
    return jsonify({'message': 'Profile updated successfully!'}), 200

#create a post
@app.route('/api/posts', methods=['POST'])
@login_required
def create_post():
    data = request.get_json()
    new_post = Post(
        location=data['location'],
        time=data['time'],
        capacity=data['capacity'],
        description=data.get('description', ''),
        creator_id=current_user.id
    )
    db.session.add(new_post)
    db.session.commit()
    return jsonify({'message': 'Post created successfully!'}), 201

#fetch all posts
@app.route('/api/posts', methods=['GET'])
def get_posts():
    posts = Post.query.all()
    result = [
        {
            'id': post.id,
            'location': post.location,
            'time': post.time,
            'capacity': post.capacity,
            'description': post.description,
            'creator': post.creator.username,
            'creator_id': post.creator_id
        } for post in posts
    ]
    return jsonify(result), 200

#fetch my posts
@app.route('/api/my-posts', methods=['GET'])
@login_required
def get_my_posts():
    posts = Post.query.filter_by(creator_id=current_user.id).all()
    result = [
        {
            'id': post.id,
            'location': post.location,
            'time': post.time,
            'capacity': post.capacity,
            'description': post.description,
            'attendees': [rsvp.user.username for rsvp in post.rsvps]  # List of attendees
        } for post in posts
    ]
    return jsonify(result), 200

#edit my posts
@app.route('/api/posts/<int:post_id>', methods=['PUT'])
@login_required
def edit_post(post_id):
    post = Post.query.filter_by(id=post_id, creator_id=current_user.id).first()
    if not post:
        return jsonify({'message': 'Post not found or unauthorized'}), 404

    data = request.get_json()
    post.location = data.get('location', post.location)
    post.time = data.get('time', post.time)
    post.capacity = data.get('capacity', post.capacity)
    post.description = data.get('description', post.description)

    db.session.commit()
    return jsonify({'message': 'Post updated successfully!'}), 200

#delete my posts
@app.route('/api/posts/<int:post_id>', methods=['DELETE'])
@login_required
def delete_post(post_id):
    post = Post.query.filter_by(id=post_id, creator_id=current_user.id).first()
    if not post:
        return jsonify({'message': 'Post not found or unauthorized'}), 404

    db.session.delete(post)
    db.session.commit()
    return jsonify({'message': 'Post deleted successfully!'}), 200

#RSVP to an event
@app.route('/api/rsvp', methods=['POST'])
@login_required
def rsvp_to_event():
    data = request.get_json()
    post_id = data.get('post_id')
    post = Post.query.get(post_id)

    if not post:
        return jsonify({'message': 'Event not found'}), 404

    # Check if already RSVP'd
    existing_rsvp = RSVP.query.filter_by(user_id=current_user.id, post_id=post_id).first()
    if existing_rsvp:
        return jsonify({'message': 'You have already RSVP’d for this event!'}), 400

    # Create RSVP
    new_rsvp = RSVP(user_id=current_user.id, post_id=post_id, status='pending')
    db.session.add(new_rsvp)
    db.session.commit()

    return jsonify({'message': 'RSVP successful!'}), 201

#fetch RSVP's events
@app.route('/api/my-rsvps', methods=['GET'])
@login_required
def get_my_rsvps():
    rsvps = RSVP.query.filter_by(user_id=current_user.id).all()
    result = []
    for rsvp in rsvps:
        # Fetch all users who RSVP'd to the post
        attendees = [attendee.user.username for attendee in rsvp.post.rsvps]
        result.append({
            'event_id': rsvp.post.id,
            'location': rsvp.post.location,
            'time': rsvp.post.time,
            'capacity': rsvp.post.capacity,
            'description': rsvp.post.description,
            'creator': rsvp.post.creator.username, 
            'attendees': attendees  
        })
    return jsonify(result), 200

#cancle RSVP
@app.route('/api/rsvp/<int:post_id>', methods=['DELETE'])
@login_required
def cancel_rsvp(post_id):
    rsvp = RSVP.query.filter_by(user_id=current_user.id, post_id=post_id).first()
    if not rsvp:
        return jsonify({'message': 'RSVP not found'}), 404

    db.session.delete(rsvp)
    db.session.commit()
    return jsonify({'message': 'RSVP canceled successfully!'}), 200

# fetch creator's information
@app.route('/api/user/<int:user_id>', methods=['GET'])
@login_required
def get_user_details(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({'message': 'User not found'}), 404

    return jsonify({
        'username': user.username,
        'phone': user.phone,
        'company': user.company,
        'sns_links': user.sns_links
    }), 200

if __name__ == '__main__':
    app.run(debug=True) 

