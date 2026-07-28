const authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    const error = new Error('Access denied. Insufficient permissions.');
    error.statusCode = 403;
    return next(error);
  }
  next();
};

export default authorize;
