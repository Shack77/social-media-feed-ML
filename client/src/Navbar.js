import React, { useState } from "react";
import { useAuth } from "./context/AuthContext";
import { Link } from "react-router-dom";

const Navbar = () => {
  const { user, logout } = useAuth();
  const [darkMode, setDarkMode] = useState(false);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
    document.body.style.backgroundColor = darkMode ? "#f8f9fa" : "#121212";
    document.body.style.color = darkMode ? "#000" : "#fff";
  };

  return (
    <nav className={`navbar navbar-expand-lg ${darkMode ? "navbar-dark bg-dark" : "navbar-light bg-light"}`}>
      <div className="container-fluid">
        <Link className="navbar-brand" to="/">FeedApp</Link>
        <div className="form-check form-switch text-white ms-auto me-3">
          <input
            className="form-check-input"
            type="checkbox"
            id="themeSwitch"
            checked={darkMode}
            onChange={toggleTheme}
          />
          <label className="form-check-label" htmlFor="themeSwitch">
            {darkMode ? "🌙 Dark" : "☀️ Light"}
          </label>
        </div>
        <div className="collapse navbar-collapse">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/home">Home</Link>
            </li>
            {user ? (
              <>
                <li className="nav-item">
                  <span className="nav-link">👤 {user.email}</span>
                </li>
                <li className="nav-item">
                  <button className="btn btn-danger" onClick={logout}>Logout</button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/login">Login</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/register">Register</Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
