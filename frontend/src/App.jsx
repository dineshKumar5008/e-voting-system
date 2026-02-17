import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import Register from "./pages/Register.jsx";
import Login from "./pages/Login.jsx";
import Vote from "./pages/Vote.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import AdminPanel from "./pages/AdminPanel.jsx";
import NotFound from "./pages/NotFound.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import api from "./api/client.js";

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (stored && token) {
      setUser(JSON.parse(stored));
    }
  }, []);

  const handleLogin = (data) => {
    setUser(data.user);
    localStorage.setItem("user", JSON.stringify(data.user));
    localStorage.setItem("token", data.token);
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await api.post("/auth/logout");
    } catch (e) {
      // ignore
    }
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    setLoading(false);
    navigate("/login");
  };

  return (
    <Layout user={user} onLogout={handleLogout} loading={loading}>
      <Routes>
        <Route
          path="/"
          element={<Navigate to={user ? "/dashboard" : "/login"} replace />}
        />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route
          path="/vote"
          element={
            <ProtectedRoute user={user}>
              <Vote user={user} setUser={setUser} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute user={user}>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute user={user} requireAdmin>
              <AdminPanel />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  );
};

export default App;


