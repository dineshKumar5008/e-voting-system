import React, { useCallback, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "../api/client.js";
import BotBehaviorTracker from "../components/BotBehaviorTracker.jsx";
import RecaptchaWrapper from "../components/RecaptchaWrapper.jsx";

const Login = ({ onLogin }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [botMetrics, setBotMetrics] = useState(null);
  const [recaptchaToken, setRecaptchaToken] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleMetricsReady = useCallback((metrics) => {
    setBotMetrics(metrics);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/auth/login", {
        ...form,
        botMetrics: { ...(botMetrics || {}), recaptchaToken, action: "login" }
      });
      onLogin(res.data);
      const redirectTo = location.state?.from?.pathname || "/dashboard";
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <BotBehaviorTracker action="login" onMetricsReady={handleMetricsReady} />
      <RecaptchaWrapper action="login" onToken={setRecaptchaToken} />
      <h1 className="page-title">Welcome back</h1>
      <form onSubmit={handleSubmit} className="form">
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
          Password
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
            autoComplete="current-password"
          />
        </label>
        {error && <div className="alert alert-error">{error}</div>}
        <button className="btn-primary" type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
        <p className="small-text">
          New voter? <Link to="/register">Register here</Link>.
        </p>
      </form>
    </div>
  );
};

export default Login;


