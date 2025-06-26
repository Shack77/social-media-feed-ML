// src/Register.js
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (form.password !== form.confirmPassword) {
      setError("❌ Passwords do not match");
      return;
    }

    try {
      const res = await axios.post("http://localhost:3000/auth/register", {
        name: form.name,
        username: form.username,
        email: form.email,
        password: form.password
      }, {
        withCredentials: true
      });

      setSuccess("✅ Registered Successfully!");
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("email", form.email);

      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      console.error("Registration error:", err);
      setError("❌ Registration Failed: " + (err.response?.data?.error || "Server error"));
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: "90vh" }}>
      <div className="card p-4 shadow-lg w-100" style={{ maxWidth: "450px", backgroundColor: "#f8f9fa" }}>
        <h3 className="text-center mb-4">🔐 Register</h3>
        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label>Name:</label>
            <input type="text" name="name" value={form.name} onChange={handleChange} className="form-control" required />
          </div>
          <div className="mb-3">
            <label>Username:</label>
            <input type="text" name="username" value={form.username} onChange={handleChange} className="form-control" required />
          </div>
          <div className="mb-3">
            <label>Email:</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} className="form-control" required />
          </div>
          <div className="mb-3">
            <label>Password:</label>
            <input type="password" name="password" value={form.password} onChange={handleChange} className="form-control" required />
          </div>
          <div className="mb-3">
            <label>Confirm Password:</label>
            <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} className="form-control" required />
          </div>
          <button className="btn btn-dark w-100" type="submit">Register</button>
        </form>
      </div>
    </div>
  );
};

export default Register;
