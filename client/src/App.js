// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Register from "./Register";
import Login from "./Login";
import Feed from "./Feed";
import Navbar from "./Navbar";
import Home from "./Home";
import ProtectedRoute from "./ProtectedRoute";
import NotFound from "./NotFound"; // ⬅️ Import this at the top


// 🔐 Auth check
const isAuthenticated = () => !!localStorage.getItem("token");

const App = () => {
  return (
    <Router>
      <Navbar />
      <Routes>
        {/* 🔄 Automatically route based on auth status */}
        <Route path="/" element={isAuthenticated() ? <Navigate to="/feed" /> : <Home />} />

        {/* 🔐 Protect feed */}
        <Route path="/feed" element={<ProtectedRoute><Feed /></ProtectedRoute>} />

        {/* 📥 Register/Login redirect if already authenticated */}
        <Route path="/register" element={isAuthenticated() ? <Navigate to="/feed" /> : <Register />} />
        <Route path="/login" element={isAuthenticated() ? <Navigate to="/feed" /> : <Login />} />

        {/* ✅ Public Home route */}
        <Route path="/home" element={<Home />} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
};

export default App;
