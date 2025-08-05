import React, { useState, useEffect } from 'react';
import { FaMapMarkerAlt, FaClock, FaUsers, FaInfoCircle, FaUser } from 'react-icons/fa';

const Lobby = () => {
  const [posts, setPosts] = useState([]);
  const [hoveredUser, setHoveredUser] = useState(null); 
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 }); 
  const [rsvpStatus, setRsvpStatus] = useState({}); 
  // Fetch all posts and RSVPs
  useEffect(() => {
    const fetchPostsAndRsvps = async () => {
      try {
        // Fetch posts
        const postsResponse = await fetch('http://127.0.0.1:5000/api/posts', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        });
        const postsData = await postsResponse.json();

        // Fetch RSVPs
        const rsvpsResponse = await fetch('http://127.0.0.1:5000/api/my-rsvps', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        });
        const rsvpsData = await rsvpsResponse.json();

        // Map RSVP'd events for quick lookup
        const rsvpEventIds = new Set(rsvpsData.map((rsvp) => rsvp.event_id));

        // Update posts and RSVP status
        const initialRsvpStatus = {};
        postsData.forEach((post) => {
          initialRsvpStatus[post.id] = rsvpEventIds.has(post.id); // Mark as requested if in RSVP list
        });

        setPosts(postsData);
        setRsvpStatus(initialRsvpStatus);
      } catch (error) {
        console.error('Error fetching posts or RSVPs:', error);
      }
    };

    fetchPostsAndRsvps();
  }, []);

  // Fetch creator's details on hover
  const fetchUserDetails = (userId, event) => {
    const rect = event.target.getBoundingClientRect(); // Get position of the hovered element
    setTooltipPosition({ top: rect.top + window.scrollY, left: rect.right + 10 }); // Position tooltip

    fetch(`http://127.0.0.1:5000/api/user/${userId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((data) => {
        setHoveredUser(data); // Store user info
      })
      .catch((error) => console.error('Error fetching user details:', error));
  };

  const clearTooltip = () => {
    setHoveredUser(null); 
  };

  // Handle RSVP toggling
  const handleRsvpToggle = (postId) => {
    const isRequested = rsvpStatus[postId];

    if (isRequested) {
      // Cancel RSVP
      fetch(`http://127.0.0.1:5000/api/rsvp/${postId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      })
        .then((res) => res.json())
        .then(() => {
          setRsvpStatus((prevState) => ({ ...prevState, [postId]: false })); // Update status
        })
        .catch((error) => console.error('Error canceling RSVP:', error));
    } else {
      // Send RSVP
      fetch('http://127.0.0.1:5000/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ post_id: postId }),
      })
        .then((res) => res.json())
        .then(() => {
          setRsvpStatus((prevState) => ({ ...prevState, [postId]: true })); // Update status
        })
        .catch((error) => console.error('Error sending RSVP:', error));
    }
  };

  return (
    <div className="lobby">
      <h2>Lobby</h2>
      {posts.length === 0 ? (
        <p>No posts available</p>
      ) : (
        <div className="post-grid">
          {posts.map((post) => (
            <div key={post.id} className="post-card">
              <h3><FaMapMarkerAlt className="icon-title" /> {post.location}</h3>
              <p><FaClock className="icon" /> <strong>Time:</strong> {post.time}</p>
              <p><FaUsers className="icon" /> <strong>Capacity:</strong> {post.capacity}</p>
              <p><FaInfoCircle className="icon" /> <strong>Description:</strong> {post.description}</p>
              <p
                className="created-by"
                onMouseEnter={(e) => fetchUserDetails(post.creator_id, e)}
                onMouseLeave={clearTooltip}
              >
                <FaUser className="icon" /> <strong>Created by:</strong> {post.creator}
              </p>
              <button
                className={`rsvp-button ${rsvpStatus[post.id] ? 'requested' : ''}`}
                onClick={() => handleRsvpToggle(post.id)}
              >
                {rsvpStatus[post.id] ? 'Requested' : 'Request'}
              </button>
            </div>
          ))}
        </div>
      )}
      {hoveredUser && (
        <div
          className="tooltip"
          style={{
            top: `${tooltipPosition.top - 30}px`,
            left: `${tooltipPosition.left - 250}px`,
          }}
        >
          <p><strong>Phone:</strong> {hoveredUser.phone || 'N/A'}</p>
          <p><strong>Company:</strong> {hoveredUser.company || 'N/A'}</p>
          <p><strong>SNS Links:</strong> {hoveredUser.sns_links || 'N/A'}</p>
        </div>
      )}
    </div>
  );
};

export default Lobby;