export function notFound(req, res) {
  console.warn(`[${req.requestId || "no-request-id"}] 404 ${req.method} ${req.originalUrl}`);
  return res.status(404).json({
    success: false,
    message: "Route not found"
  });
}

export function errorHandler(error, req, res, next) {
  if (res.headersSent) {
    return next(error);
  }

  const statusCode = error.statusCode || 500;
  console.error(
    `[${req.requestId || "no-request-id"}] ERROR ${req.method} ${req.originalUrl} status=${statusCode} message=${error.message || "Internal server error"}`
  );

  return res.status(statusCode).json({
    success: false,
    message: error.message || "Internal server error"
  });
}
