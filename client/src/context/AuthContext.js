// AuthContext.js
import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

 const login = async (identifier, password) => {
  try {
    const res = await axios.post(
      "http://localhost:3001/auth/login",
      { identifier, password },
      { withCredentials: true }
    );

    console.log("Login response:", res.data);
    setUser(res.data.user); // set user from response
    navigate("/feed"); // redirect after user is set
  } catch (err) {
    console.error("Login failed:", err.response?.data || err.message);
  }
};


  const logout = async () => {
  await axios.post("http://localhost:3001/auth/logout", {}, { withCredentials: true });
  localStorage.clear();
  setUser(null);
};

const fetchUser = async () => {
  try {
    const res = await axios.get("http://localhost:3001/auth/me", {
      withCredentials: true,
    });
    console.log("fetchUser result:", res.data);
    setUser(res.data.user); // Ensure you're accessing `.user`
  } catch (err) {
    console.log("fetchUser failed:", err.response?.data || err.message);
    setUser(null);
  }
};



useEffect(() => {
  axios.get("http://localhost:3001/auth/me", { withCredentials: true })
    .then(res => setUser(res.data.user)) // fix here
    .catch(err => {
      if (err.response?.status === 401) {
        console.log("Not logged in");
      } else {
        console.error("Error fetching user:", err);
      }
      setUser(null);
    });
}, []);



  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
