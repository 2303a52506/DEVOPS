import React, { useEffect, useState } from "react";

function Doctor() {
  const [user, setUser] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [patientName, setPatientName] = useState("");
  const [medicines, setMedicines] = useState("");
  const [notes, setNotes] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const role = localStorage.getItem("role");
    const storedUser = localStorage.getItem("user");

    if (role !== "doctor" || !storedUser) {
      window.location.href = "/";
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);
    loadAppointments(parsedUser.name);
  }, []);

  const loadAppointments = async (doctorName) => {
    const res = await fetch(`http://localhost:5000/appointments/doctor/${doctorName}`);
    const data = await res.json();
    setAppointments(data);
  };

  const addPrescription = async () => {
    if (!user) return;

    const res = await fetch("http://localhost:5000/add-prescription", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        patientName,
        doctorName: user.name,
        medicines,
        notes
      })
    });

    const data = await res.json();
    setMsg(data.message || data.error || "Done");

    if (data.success) {
      setPatientName("");
      setMedicines("");
      setNotes("");
    }
  };

  const logout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  if (!user) return <div className="page">Loading...</div>;

  return (
    <div className="page">
      <div className="topbar">
        <h2>Doctor Dashboard</h2>
        <button onClick={logout}>Logout</button>
      </div>

      <div className="card">
        <h3>Welcome Dr. {user.name}</h3>
        <p><b>Username:</b> {user.username}</p>
        <p><b>Specialization:</b> {user.specialization}</p>
        <p><b>Hospital:</b> {user.hospital}</p>
        <p><b>Phone:</b> {user.phone}</p>
      </div>

      <div className="card">
        <h3>Your Appointments</h3>
        {appointments.length === 0 ? (
          <p>No appointments found</p>
        ) : (
          appointments.map((a) => (
            <div key={a._id}>
              <p><b>Patient:</b> {a.patientName}</p>
              <p><b>Disease:</b> {a.disease}</p>
              <p><b>Date:</b> {a.appointment_date}</p>
              <p><b>Time:</b> {a.appointment_time}</p>
              <p><b>Status:</b> {a.status}</p>
              <hr />
            </div>
          ))
        )}
      </div>

      <div className="card">
        <h3>Add Prescription</h3>

        <input
          type="text"
          placeholder="Patient Name"
          value={patientName}
          onChange={(e) => setPatientName(e.target.value)}
        />

        <textarea
          placeholder="Medicines"
          value={medicines}
          onChange={(e) => setMedicines(e.target.value)}
        />

        <textarea
          placeholder="Notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        <button onClick={addPrescription}>Submit Prescription</button>

        {msg && <p>{msg}</p>}
      </div>
    </div>
  );
}

export default Doctor;