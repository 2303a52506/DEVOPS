import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API = 'http://localhost:5000';

export default function Emergency() {
  const [doctors, setDoctors] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadDoctors();
  }, []);

  const loadDoctors = async () => {
    const res = await fetch(`${API}/emergency-doctors`);
    const data = await res.json();
    setDoctors(Array.isArray(data) ? data : []);
  };

  return (
    <div className="container">
      <div className="top-bar">
        <h2>Emergency Support</h2>
        <button className="secondary" onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
      </div>
      <p className="small">Nearest available emergency-ready doctors</p>
      <div className="card-grid">
        {doctors.map((doc) => (
          <div className="card" key={doc._id}>
            <h3>{doc.name}</h3>
            <p>{doc.specialization}</p>
            <p>{doc.hospital}</p>
            <p>Phone: {doc.phone}</p>
            <p>Fee: ₹{doc.fee}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
