function respond(res, statusCode, message, data) {
  const success = statusCode >= 200 && statusCode < 300;
  res.status(statusCode).json({ success, message, data });
}

export default respond;
