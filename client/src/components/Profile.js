import React, { useState, useEffect } from 'react';
import '../css/function.css';

const Profile = () => {
  const [formData, setFormData] = useState({
    username: '',
    phone: '',
    company: '',
    sns_links: '',
  });

  useEffect(() => {
  // Fetch the current profile
  fetch('http://127.0.0.1:5000/api/profile', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', 
  })
    .then((res) => {
      if (!res.ok) {
        return res.json().then((error) => {
          console.error('Error response:', error);
          throw new Error(error.message || 'Failed to fetch profile');
        });
      }
      return res.json();
    })
    .then((data) => {
      console.log('Profile data:', data); // Log the received data
      setFormData({
        username: data.username || '',
        phone: data.phone || '',
        company: data.company || '',
        sns_links: data.sns_links || '',
      });
    })
    .catch((error) => console.error('Error fetching profile:', error));
}, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    fetch('http://127.0.0.1:5000/api/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(formData),
    })
      .then((res) => res.json())
      .then(() => {
        alert('Profile updated successfully!');
      })
      .catch((error) => console.error('Error updating profile:', error));
  };

  return (
    <div className="profile-container">
      <h2>My Profile</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Username:
          <input
            type="text"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
          />
        </label>
        <label>
          Phone:
          <input
            type="text"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
        </label>
        <label>
          Company:
          <input
            type="text"
            value={formData.company}
            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
          />
        </label>
        <label>
          SNS Links:
          <textarea
            value={formData.sns_links}
            onChange={(e) => setFormData({ ...formData, sns_links: e.target.value })}
          ></textarea>
        </label>
        <button type="submit">Save</button>
      </form>
    </div>
  );
};

export default Profile;