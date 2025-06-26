// src/Login.js
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ identifier: "", password: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
  const expiresIn = 60 * 60 * 1000; // 1 hour
  localStorage.setItem("token_expiry", `${Date.now() + expiresIn}`);


    try {
      const res = await axios.post("http://localhost:5000/auth/login", form);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("email", res.data.email || "");
      localStorage.setItem("username", res.data.username || "");

      setSuccess("✅ Logged in successfully!");
      setTimeout(() => navigate("/feed"), 2000);
    } catch (err) {
      setError("❌ Invalid credentials");
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: "90vh" }}>
      <div className="card p-4 shadow-lg w-100" style={{ maxWidth: "450px", backgroundColor: "#f8f9fa" }}>
        <h3 className="text-center mb-4">🔑 Login</h3>
        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label>Email or Username:</label>
            <input
              type="text"
              name="identifier"
              value={form.identifier}
              onChange={handleChange}
              className="form-control"
              required
            />
          </div>
          <div className="mb-3">
            <label>Password:</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className="form-control"
              required
            />
          </div>
          <button className="btn btn-dark w-100" type="submit">Login</button>
        </form>
      </div>
    </div>
  );
};

export default Login;
