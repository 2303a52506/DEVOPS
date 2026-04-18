import React, { useEffect, useState } from "react";

function Dashboard() {
  const [user, setUser] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);

  const [doctorId, setDoctorId] = useState("");
  const [hospital, setHospital] = useState("");
  const [disease, setDisease] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [medicalHistory, setMedicalHistory] = useState("");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const role = localStorage.getItem("role");
    const storedUser = localStorage.getItem("user");

    if (role !== "patient" || !storedUser) {
      window.location.href = "/";
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);

    loadDoctors();
    loadAppointments(parsedUser._id);
    loadPrescriptions(parsedUser.name);
  }, []);

  const loadDoctors = async () => {
    const res = await fetch("http://localhost:5000/doctors");
    const data = await res.json();
    setDoctors(data);
  };

  const loadAppointments = async (patientId) => {
    const res = await fetch(`http://localhost:5000/appointments/patient/${patientId}`);
    const data = await res.json();
    setAppointments(data);
  };

  const loadPrescriptions = async (patientName) => {
    const res = await fetch(`http://localhost:5000/patient-prescriptions/${patientName}`);
    const data = await res.json();
    setPrescriptions(data);
  };

  const bookAppointment = async () => {
    if (!user) return;

    const res = await fetch("http://localhost:5000/book-appointment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        patient_id: user._id,
        doctor_id: doctorId,
        disease,
        symptoms,
        medical_history: medicalHistory,
        hospital,
        appointment_date: appointmentDate,
        appointment_time: appointmentTime
      })
    });

    const data = await res.json();
    setMsg(data.message || data.error || "Done");

    if (data.success) {
      setDoctorId("");
      setHospital("");
      setDisease("");
      setSymptoms("");
      setMedicalHistory("");
      setAppointmentDate("");
      setAppointmentTime("");
      loadAppointments(user._id);
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
        <h2>Patient Dashboard</h2>
        <button onClick={logout}>Logout</button>
      </div>

      <div className="card">
        <h3>Welcome, {user.name}</h3>
        <p><b>Username:</b> {user.username}</p>
        <p><b>Phone:</b> {user.phone}</p>
        <p><b>Age:</b> {user.age}</p>
        <p><b>Gender:</b> {user.gender}</p>
      </div>

      <div className="card">
        <h3>Book Appointment</h3>

        <select
          value={doctorId}
          onChange={(e) => {
            const selectedId = e.target.value;
            setDoctorId(selectedId);

            const selectedDoctor = doctors.find((d) => d._id === selectedId);
            setHospital(selectedDoctor ? selectedDoctor.hospital : "");
          }}
        >
          <option value="">Select Doctor</option>
          {doctors.map((doc) => (
            <option key={doc._id} value={doc._id}>
              {doc.name} - {doc.specialization}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Hospital"
          value={hospital}
          onChange={(e) => setHospital(e.target.value)}
        />

        <input
          type="text"
          placeholder="Disease"
          value={disease}
          onChange={(e) => setDisease(e.target.value)}
        />

        <input
          type="text"
          placeholder="Symptoms"
          value={symptoms}
          onChange={(e) => setSymptoms(e.target.value)}
        />

        <input
          type="text"
          placeholder="Medical History"
          value={medicalHistory}
          onChange={(e) => setMedicalHistory(e.target.value)}
        />

        <input
          type="date"
          value={appointmentDate}
          onChange={(e) => setAppointmentDate(e.target.value)}
        />

        <input
          type="text"
          placeholder="Appointment Time (example: 10:30 AM)"
          value={appointmentTime}
          onChange={(e) => setAppointmentTime(e.target.value)}
        />

        <button onClick={bookAppointment}>Book Appointment</button>

        {msg && <p>{msg}</p>}
      </div>

      <div className="card">
        <h3>Your Appointments</h3>
        {appointments.length === 0 ? (
          <p>No appointments yet</p>
        ) : (
          appointments.map((a) => (
            <div key={a._id}>
              <p><b>Doctor:</b> {a.doctorName}</p>
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
        <h3>Your Prescriptions</h3>
        {prescriptions.length === 0 ? (
          <p>No prescriptions yet</p>
        ) : (
          prescriptions.map((p) => (
            <div key={p._id}>
              <p><b>Doctor:</b> {p.doctorName}</p>
              <p><b>Medicines:</b> {p.medicines}</p>
              <p><b>Notes:</b> {p.notes}</p>
              <p><b>Date:</b> {p.date}</p>
              <a
                href={`http://localhost:5000/prescription-pdf/${p._id}`}
                target="_blank"
                rel="noreferrer"
              >
                <button>Download PDF</button>
              </a>
              <hr />
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Dashboard;