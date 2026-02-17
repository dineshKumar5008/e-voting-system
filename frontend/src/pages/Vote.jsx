import React, { useCallback, useState } from "react";
import api from "../api/client.js";
import BotBehaviorTracker from "../components/BotBehaviorTracker.jsx";
import RecaptchaWrapper from "../components/RecaptchaWrapper.jsx";

const candidates = [
  { id: "candidate_a", name: "Candidate A" },
  { id: "candidate_b", name: "Candidate B" },
  { id: "candidate_c", name: "Candidate C" }
];

const Vote = ({ user, setUser }) => {
  const [selected, setSelected] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [botMetrics, setBotMetrics] = useState(null);
  const [recaptchaToken, setRecaptchaToken] = useState(null);

  const handleMetricsReady = useCallback((metrics) => {
    setBotMetrics(metrics);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selected) {
      setError("Please select a candidate.");
      return;
    }
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await api.post("/vote", {
        candidateId: selected,
        botMetrics: { ...(botMetrics || {}), recaptchaToken, action: "vote" }
      });
      setSuccess("Your vote has been securely recorded.");
      const updatedUser = { ...user, hasVoted: true };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to cast vote");
    } finally {
      setLoading(false);
    }
  };

  if (user?.hasVoted) {
    return (
      <div>
        <h1 className="page-title">Thank you for voting</h1>
        <p className="muted-text">
          Our system has recorded your vote. You cannot vote again.
        </p>
      </div>
    );
  }

  return (
    <div>
      <BotBehaviorTracker action="vote" onMetricsReady={handleMetricsReady} />
      <RecaptchaWrapper action="vote" onToken={setRecaptchaToken} />
      <h1 className="page-title">Cast your vote</h1>
      <p className="muted-text">
        Your selection is encrypted, anonymized, and anchored to a blockchain for
        integrity. No one can see who you voted for.
      </p>
      <form onSubmit={handleSubmit} className="form">
        <div className="candidate-list">
          {candidates.map((c) => (
            <label
              key={c.id}
              className={`candidate-card ${
                selected === c.id ? "candidate-card-selected" : ""
              }`}
            >
              <input
                type="radio"
                name="candidate"
                value={c.id}
                checked={selected === c.id}
                onChange={() => setSelected(c.id)}
              />
              <span>{c.name}</span>
            </label>
          ))}
        </div>
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}
        <button className="btn-primary" type="submit" disabled={loading}>
          {loading ? "Submitting..." : "Submit Vote"}
        </button>
      </form>
    </div>
  );
};

export default Vote;


