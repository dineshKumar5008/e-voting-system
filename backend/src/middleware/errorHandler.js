export const notFound = (req, res, next) => {
  res.status(404).json({ message: "Route not found" });
};

// Generic error handler with no stack traces in production
export const errorHandler = (err, req, res, next) => {
  console.error(err);
  const statusCode = err.statusCode || 500;
  const message =
    err.message || "An unexpected error occurred. Please try again later.";
  res.status(statusCode).json({ message });
};


