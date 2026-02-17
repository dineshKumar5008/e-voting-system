import React, { useEffect, useState } from "react";
import api from "../api/client.js";

const AdminPanel = () => {
  const [stats, setStats] = useState(null);
  const [chainStatus, setChainStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, verifyRes] = await Promise.all([
          api.get("/admin/stats"),
          api.get("/blockchain/verify")
        ]);
        setStats(statsRes.data);
        setChainStatus(verifyRes.data);
      } catch (e) {
        setChainStatus({ valid: false, reason: "Failed to query backend" });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div>
      <h1 className="page-title">Admin control panel</h1>
      <p className="muted-text">
        Monitor election turnout and blockchain integrity. No individual ballot
        data is ever exposed here.
      </p>
      {loading && <p className="muted-text">Loading metrics…</p>}
      {stats && (
        <div className="dashboard-grid">
          <div className="metric-card glass-card-inner">
            <span className="metric-label">Registered voters</span>
            <span className="metric-value">{stats.totalUsers}</span>
          </div>
          <div className="metric-card glass-card-inner">
            <span className="metric-label">Voters who have voted</span>
            <span className="metric-value">{stats.votedUsers}</span>
          </div>
          <div className="metric-card glass-card-inner">
            <span className="metric-label">Turnout (%)</span>
            <span className="metric-value">
              {stats.turnoutPercent.toFixed(1)}
            </span>
          </div>
          <div className="metric-card glass-card-inner">
            <span className="metric-label">Total votes (on-chain)</span>
            <span className="metric-value">{stats.totalVotes}</span>
          </div>
        </div>
      )}
      {chainStatus && (
        <div className="alert alert-info">
          <strong>Blockchain integrity: </strong>
          {chainStatus.valid
            ? "VALID – all block hashes and links check out."
            : `INVALID – ${chainStatus.reason || "reason unknown"}`}
        </div>
      )}
    </div>
  );
};

export default AdminPanel;


