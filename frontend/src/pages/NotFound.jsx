import React from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div>
      <h1 className="page-title">Page not found</h1>
      <p className="muted-text">
        The page you are looking for does not exist. Go back to the{" "}
        <Link to="/">dashboard</Link>.
      </p>
    </div>
  );
};

export default NotFound;


