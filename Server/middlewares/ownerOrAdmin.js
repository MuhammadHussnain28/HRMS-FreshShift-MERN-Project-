const ownerOrAdmin = (getOwnerId) => (req, res, next) => {
  const ownerId = getOwnerId(req);

  if (req.user.role === 'hr_admin' || req.user.id === ownerId.toString()) {
    return next();
  }

  const error = new Error('Access denied. You can only access your own resources.');
  error.statusCode = 403;
  return next(error);
};

export default ownerOrAdmin;
