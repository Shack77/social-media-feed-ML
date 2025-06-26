// src/NotFound.js
import React from "react";

const NotFound = () => (
  <div className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: "90vh" }}>
    <h1 className="display-4">404</h1>
    <p className="lead">Oops! Page not found.</p>
    <a className="btn btn-dark mt-3" href="/">Go Home</a>
  </div>
);

export default NotFound;
