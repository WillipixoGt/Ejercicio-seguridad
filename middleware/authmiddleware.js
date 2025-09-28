// src/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

exports.verifyToken = (req, res, next) => {
  try {
    const h = req.headers.authorization || '';
    const token = h.startsWith('Bearer ') ? h.slice(7) : null;
    if (!token) return res.status(401).json({ msg: 'Token no proporcionado' });

    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload; // { sub, email, role, name, iat, exp }
    next();
  } catch (err) {
    return res.status(401).json({ msg: 'Token inválido' });
  }
};

exports.requireRole = (...roles) => {
  return (req, res, next) => {
    const role = req.user?.role;
    if (!role || !roles.includes(role)) {
      return res.status(403).json({ msg: 'Acceso denegado' });
    }
    next();
  };
};
