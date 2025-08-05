import React, { useState } from 'react';
import { FaMapMarkerAlt, FaClock, FaUsers, FaAlignLeft } from 'react-icons/fa';

const CreatePost = () => {
  const [formData, setFormData] = useState({
    location: '',
    time: '',
    capacity: '',
    description: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    fetch('http://127.0.0.1:5000/api/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(formData),
    })
      .then((res) => res.json())
      .then((data) => {
        alert(data.message);
        setFormData({ location: '', time: '', capacity: '', description: '' }); 
      })
      .catch((error) => console.error('Error creating post:', error));
  };

  return (
    <div className="create-post-container">
      <form onSubmit={handleSubmit} className="create-post-form">
        <h2>Create a Post</h2>
        <label className="form-group">
          <FaMapMarkerAlt className="form-icon" />
          Location:
          <input
            type="text"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            required
          />
        </label>
        <label className="form-group">
          <FaClock className="form-icon" />
          Time:
          <input
            type="text"
            placeholder="MM/DD HH:MM"
            value={formData.time}
            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
            required
          />
        </label>
        <label className="form-group">
          <FaUsers className="form-icon" />
          Capacity:
          <input
            type="number"
            value={formData.capacity}
            onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
            required
          />
        </label>
        <label className="form-group">
          <FaAlignLeft className="form-icon" />
          Description (optional):
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </label>
        <button type="submit" className="submit-button">Create Post</button>
      </form>
    </div>
  );
};

export default CreatePost;