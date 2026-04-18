import React, { useState } from "react";

function Register() {
  const [form, setForm] = useState({
    username: "",
    name: "",
    age: "",
    gender: "",
    phone: "",
    password: ""
  });

  const [msg, setMsg] = useState("");

  const registerUser = async () => {
    setMsg("");

    try {
      const res = await fetch("http://localhost:5000/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(form)
      });

      const data = await res.json();

      if (!data.success) {
        setMsg(data.error || "Registration failed");
        return;
      }

      setMsg("Registration successful");
      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
    } catch (error) {
      setMsg("Server error");
    }
  };

  return (
    <div className="container">
      <h2>Patient Registration</h2>

      <input
        placeholder="Username"
        onChange={(e) => setForm({ ...form, username: e.target.value })}
      />
      <input
        placeholder="Full Name"
        onChange={(e) => setForm({ ...form, name: e.target.value })}
      />
      <input
        type="number"
        placeholder="Age"
        onChange={(e) => setForm({ ...form, age: e.target.value })}
      />
      <input
        placeholder="Gender"
        onChange={(e) => setForm({ ...form, gender: e.target.value })}
      />
      <input
        placeholder="Phone"
        onChange={(e) => setForm({ ...form, phone: e.target.value })}
      />
      <input
        type="password"
        placeholder="Password"
        onChange={(e) => setForm({ ...form, password: e.target.value })}
      />

      <button onClick={registerUser}>Register</button>

      {msg && <p>{msg}</p>}
    </div>
  );
}

export default Register;