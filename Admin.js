import React, { useEffect, useState } from "react";

function Admin() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== "admin") {
      window.location.href = "/";
      return;
    }

    fetch("http://localhost:5000/admin-data")
      .then((res) => res.json())
      .then((d) => setData(d));
  }, []);

  const logout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  if (!data) return <div className="page">Loading...</div>;

  return (
    <div className="page">
      <div className="topbar">
        <h2>Admin Panel</h2>
        <button onClick={logout}>Logout</button>
      </div>

      <div className="card">
        <h3>Patients</h3>
        {data.patients.map((p) => (
          <p key={p._id}>{p.name} ({p.username})</p>
        ))}
      </div>

      <div className="card">
        <h3>Doctors</h3>
        {data.doctors.map((d) => (
          <p key={d._id}>{d.name} - {d.specialization}</p>
        ))}
      </div>

      <div className="card">
        <h3>Appointments</h3>
        {data.appointments.map((a) => (
          <p key={a._id}>{a.patientName} → {a.doctorName} ({a.appointment_date})</p>
        ))}
      </div>

      <div className="card">
        <h3>Prescriptions</h3>
        {data.prescriptions.map((p) => (
          <p key={p._id}>{p.patientName} ← {p.doctorName}</p>
        ))}
      </div>
    </div>
  );
}

export default Admin;