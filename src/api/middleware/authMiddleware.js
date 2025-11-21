import jwt from 'jsonwebtoken';
import User from '../../models/User.js';

export const protect = async (req, res, next) => {
  let token;
  if (req.cookies && req.cookies.jwt) {
    try {
      token = req.cookies.jwt;
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      next();
    } catch (error) {
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      res.status(403).json({ 
        message: `User role ${req.user.role} is not authorized to access this route` 
      });
      return;
    }
    next();
  };
};