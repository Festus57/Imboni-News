export const notFound = (req, res, next) => {
  const error = new Error(`Not Found — ${req.originalUrl}`);
  res.status(404);
  next(error);
};

export const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ success: false, message: 'Request body contains invalid JSON.' });
  }

  if (err.name === 'MulterError') {
    const status = err.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
    return res.status(status).json({ success: false, message: err.code === 'LIMIT_FILE_SIZE' ? 'Uploaded file is too large.' : 'File upload failed.' });
  }

  if (err.name === 'CastError') return res.status(400).json({ success: false, message: 'Invalid resource identifier.' });
  if (err.message?.startsWith('Origin is not allowed by CORS')) return res.status(403).json({ success: false, message: 'Request origin is not allowed.' });

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || err.keyPattern || {})[0] || 'value';
    return res.status(400).json({
      success: false,
      message: `${field} already exists.`,
    });
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ success: false, message: messages.join(', ') });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ success: false, message: 'Invalid token.' });
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ success: false, message: 'Token expired.' });
  }

  const isProduction = process.env.NODE_ENV === 'production';
  res.status(statusCode).json({
    success: false,
    message: isProduction && statusCode >= 500 ? 'An unexpected server error occurred.' : (err.message || 'Server Error'),
    ...(isProduction ? {} : { stack: err.stack }),
  });
};
