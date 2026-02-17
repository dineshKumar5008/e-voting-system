import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/client.js";

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    uniqueId: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await api.post("/auth/register", form);
      setSuccess("Registration successful. Redirecting to login...");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="page-title">Create your voter account</h1>
      <form onSubmit={handleSubmit} className="form">
        <label>
          Name
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            autoComplete="name"
          />
        </label>
        <label>
          Email
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            autoComplete="email"
          />
        </label>
        <label>
          Unique ID (Roll / Govt ID)
          <input
            type="text"
            name="uniqueId"
            value={form.uniqueId}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Password
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
            minLength={8}
            autoComplete="new-password"
          />
        </label>
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}
        <button className="btn-primary" type="submit" disabled={loading}>
          {loading ? "Registering..." : "Register"}
        </button>
        <p className="small-text">
          Already registered? <Link to="/login">Log in here</Link>.
        </p>
      </form>
    </div>
  );
};

export default Register;


