import React, { useEffect, useState } from "react";
import api from "../api/client.js";

const Dashboard = () => {
  const [stats, setStats] = useState({ totalVotes: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/vote/stats");
        setStats(res.data);
      } catch (e) {
        // ignore for public dashboard
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div>
      <h1 className="page-title">Public election dashboard</h1>
      <p className="muted-text">
        This dashboard shows aggregate turnout only. Individual votes are never
        visible and are stored as encrypted hashes on a blockchain.
      </p>
      <div className="dashboard-grid">
        <div className="metric-card glass-card-inner">
          <span className="metric-label">Total votes polled</span>
          <span className="metric-value">
            {loading ? "…" : stats.totalVotes ?? 0}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;


