import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./Navbar";
import Feed from "./Feed";
import Login from "./Login";
import Register from "./Register";
import Home from "./Home";
import Profile from "./Profile";
import ProtectedRoute from "./ProtectedRoute";
import AxiosInterceptor from "./AxiosInterceptor"; // Optional
import { useAuth } from "./context/AuthContext";
import RecommendedFeed from "./RecommendedFeed";

function App() {
  const { currentUser, setCurrentUser } = useAuth(); // Grab from context

  return (
    <>
      <Navbar currentUser={currentUser} setCurrentUser={setCurrentUser} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/login"
          element={currentUser ? <Navigate to="/feed" /> : <Login />}
        />
        <Route
          path="/register"
          element={currentUser ? <Navigate to="/feed" /> : <Register />}
        />
        <Route
          path="/feed"
          element={
            <ProtectedRoute>
              <Feed />
            </ProtectedRoute>
          }
        />
        <Route path="/profile/:username" element={<Profile />} />
        <Route path="/recommended" element={<RecommendedFeed />} />
      </Routes>
    </>
  );
}

export default App;
