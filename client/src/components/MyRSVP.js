import React, { useState, useEffect } from 'react';
import { FaClock, FaUsers, FaInfoCircle, FaMapMarkerAlt } from 'react-icons/fa';

const MyRSVP = () => {
  const [rsvps, setRsvps] = useState([]);

  // Fetch all RSVPs on component load
  useEffect(() => {
    fetch('http://127.0.0.1:5000/api/my-rsvps', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((data) => setRsvps(data))
      .catch((error) => console.error('Error fetching RSVPs:', error));
  }, []);

  // Handle RSVP cancellation
  const handleCancelRSVP = (postId) => {
    fetch(`http://127.0.0.1:5000/api/rsvp/${postId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((data) => {
        alert(data.message); 
        // Remove the canceled RSVP from the state
        setRsvps((prevRsvps) => prevRsvps.filter((rsvp) => rsvp.event_id !== postId));
      })
      .catch((error) => console.error('Error canceling RSVP:', error));
  };

  return (
    <div className="my-rsvps">
      <h2>My RSVP’d Events</h2>
      {rsvps.length === 0 ? (
        <p>You haven't RSVP’d for any events yet.</p>
      ) : (
        <div className="post-grid">
          {rsvps.map((rsvp) => (
            <div key={rsvp.event_id} className="post-card rsvp-card">
              <h3><FaMapMarkerAlt className="icon" /> {rsvp.location}</h3>
              <p><FaClock className="icon" /> <strong>Time:</strong> {rsvp.time}</p>
              <p><FaUsers className="icon" /> <strong>Capacity:</strong> {rsvp.capacity}</p>
              <p><FaInfoCircle className="icon" /> <strong>Description:</strong> {rsvp.description}</p>
              <p><strong>Creator:</strong> {rsvp.creator}</p>
              <p><strong>Attendees:</strong> {rsvp.attendees.join(', ') || 'None'}</p>
              <button
                className="delete-button"
                onClick={() => handleCancelRSVP(rsvp.event_id)}
              >
                Cancel RSVP
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyRSVP;