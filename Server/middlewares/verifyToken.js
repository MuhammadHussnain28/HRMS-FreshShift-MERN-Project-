import jwt from 'jsonwebtoken';

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    const error = new Error('Access denied. No token provided.');
    error.statusCode = 401;
    return next(error);
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    req.user = { id: decoded.id, role: decoded.role };
    next();
  } catch (err) {
    return next(err);
  }
};

export default verifyToken;
