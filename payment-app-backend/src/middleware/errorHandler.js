const errorHandler = (err, req, res, next) => {
  const timestamp = new Date().toISOString();
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';

  console.error(`[${timestamp}] ERROR:`, {
    status,
    message,
    path: req.path,
    method: req.method,
    stack: err.stack
  });

  res.status(status).json({
    success: false,
    error: {
      status,
      message,
      timestamp,
      path: req.path
    }
  });
};

module.exports = errorHandler;
