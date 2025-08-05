import React, { useState, useEffect } from 'react';

const MyInvitations = () => {
  const [posts, setPosts] = useState([]);
  const [editingPostId, setEditingPostId] = useState(null); // Track the post being edited
  const [editFormData, setEditFormData] = useState({
    location: '',
    time: '',
    capacity: '',
    description: '',
  });

  // Fetch user posts on component mount
  useEffect(() => {
    fetch('http://127.0.0.1:5000/api/my-posts', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((data) => setPosts(data))
      .catch((error) => console.error('Error fetching posts:', error));
  }, []);

  // Handle post deletion
  const handleDelete = (postId) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      fetch(`http://127.0.0.1:5000/api/posts/${postId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      })
        .then((res) => res.json())
        .then((data) => {
          alert(data.message);
          setPosts(posts.filter((post) => post.id !== postId)); // Remove from state
        })
        .catch((error) => console.error('Error deleting post:', error));
    }
  };

  // Start editing a post
  const handleEdit = (post) => {
    setEditingPostId(post.id);
    setEditFormData({
      location: post.location,
      time: post.time,
      capacity: post.capacity,
      description: post.description,
    });
  };

  // Handle changes in the edit form
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prevState) => ({ ...prevState, [name]: value }));
  };

  // Submit edited post data
  const handleFormSubmit = (e) => {
    e.preventDefault();
    fetch(`http://127.0.0.1:5000/api/posts/${editingPostId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(editFormData),
    })
      .then((res) => res.json())
      .then((data) => {
        alert(data.message);
        setPosts(posts.map((post) =>
          post.id === editingPostId ? { ...post, ...editFormData } : post
        ));
        setEditingPostId(null); // Exit edit mode
      })
      .catch((error) => console.error('Error editing post:', error));
  };

  return (
    <div className="my-invitations">
      <h2>My Invitations</h2>
      {posts.length === 0 ? (
        <p>You haven't created any invitations yet.</p>
      ) : (
        <div className="post-grid">
          {posts.map((post) => (
            <div key={post.id} className={`post-card invitation-card`}>
              {editingPostId === post.id ? (
                <form className="edit-form" onSubmit={handleFormSubmit}>
                  <label>
                    Location:
                    <input
                      type="text"
                      name="location"
                      value={editFormData.location}
                      onChange={handleFormChange}
                      required
                    />
                  </label>
                  <label>
                    Time:
                    <input
                      type="text"
                      name="time"
                      value={editFormData.time}
                      onChange={handleFormChange}
                      required
                    />
                  </label>
                  <label>
                    Capacity:
                    <input
                      type="number"
                      name="capacity"
                      value={editFormData.capacity}
                      onChange={handleFormChange}
                      required
                    />
                  </label>
                  <label>
                    Description:
                    <textarea
                      name="description"
                      value={editFormData.description}
                      onChange={handleFormChange}
                      required
                    />
                  </label>
                  <button type="submit">Save</button>
                  <button type="button" onClick={() => setEditingPostId(null)}>
                    Cancel
                  </button>
                </form>
              ) : (
                <>
                  <h3>{post.location}</h3>
                  <p><strong>Time:</strong> {post.time}</p>
                  <p><strong>Capacity:</strong> {post.capacity}</p>
                  <p><strong>Description:</strong> {post.description}</p>
                  <p><strong>Attendees:</strong> {post.attendees.length > 0 ? post.attendees.join(', ') : 'None'}</p>
                  <button className="rsvp-button" onClick={() => handleEdit(post)}>Edit</button>
                  <button className="delete-button" onClick={() => handleDelete(post.id)}>Delete</button>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyInvitations;