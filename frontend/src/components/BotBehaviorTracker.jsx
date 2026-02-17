import React, { useEffect, useRef } from "react";

// Collect simple behavioral metrics to send with sensitive actions
// like login and vote. This is NOT real AI, but it simulates input
// to an AI-based or heuristic scoring system on the backend.

const BotBehaviorTracker = ({ onMetricsReady, action }) => {
  const mouseMoves = useRef(0);
  const startTime = useRef(Date.now());

  useEffect(() => {
    const handleMove = () => {
      mouseMoves.current += 1;
    };
    window.addEventListener("mousemove", handleMove);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      const timeToCompleteMs = Date.now() - startTime.current;
      onMetricsReady({
        action,
        mouseMoves: mouseMoves.current,
        timeToCompleteMs
      });
    };
  }, [action, onMetricsReady]);

  return null;
};

export default BotBehaviorTracker;


