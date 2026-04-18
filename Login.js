import React, { useState } from "react";

function Login() {
  const [role, setRole] = useState("patient");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  const login = async () => {
    setMsg("");

    try {
      const res = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          username: username.trim(),
          password: password.trim(),
          role: role.toLowerCase()
        })
      });

      const data = await res.json();

      if (!data.success) {
        setMsg(data.error || "Login failed");
        return;
      }

      localStorage.setItem("role", data.role);

      if (data.role === "patient") {
        localStorage.setItem("user", JSON.stringify(data.patient));
        window.location.href = "/dashboard";
      } else if (data.role === "doctor") {
        localStorage.setItem("user", JSON.stringify(data.doctor));
        window.location.href = "/doctor";
      } else if (data.role === "admin") {
        localStorage.setItem("user", JSON.stringify(data.admin));
        window.location.href = "/admin";
      }
    } catch (error) {
      setMsg("Cannot connect to backend");
    }
  };

  return (
    <div className="container">
      <h2>MediPulse Login</h2>

      <select value={role} onChange={(e) => setRole(e.target.value)}>
        <option value="patient">Patient</option>
        <option value="doctor">Doctor</option>
        <option value="admin">Admin</option>
      </select>

      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button onClick={login}>Login</button>

      {msg && <p className="error">{msg}</p>}

      <p>
        New patient? <a href="/register">Register here</a>
      </p>
    </div>
  );
}

export default Login;