function summarizeBody(body) {
  if (!body || typeof body !== "object") {
    return [];
  }

  return Object.keys(body);
}

export function requestLogger(req, res, next) {
  const startedAt = Date.now();
  const requestId = `${startedAt}-${Math.random().toString(36).slice(2, 8)}`;

  req.requestId = requestId;

  console.log(
    `[${requestId}] -> ${req.method} ${req.originalUrl} bodyKeys=${summarizeBody(req.body).join(",") || "-"} queryKeys=${Object.keys(req.query || {}).join(",") || "-"}`
  );

  res.on("finish", () => {
    const durationMs = Date.now() - startedAt;
    const userId = req.user?.userId ?? "-";
    const fileName = req.file?.filename ?? "-";
    console.log(
      `[${requestId}] <- ${res.statusCode} ${req.method} ${req.originalUrl} userId=${userId} file=${fileName} durationMs=${durationMs}`
    );
  });

  next();
}
