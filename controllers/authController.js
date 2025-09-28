// controllers/authController.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db'); // <-- esta ruta es correcta si db.js está en la raíz

const ROUNDS = Number(process.env.HASH_ROUNDS || 10);
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES = process.env.JWT_EXPIRES || '2d';

function signToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES }
  );
}

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body || {};
    if (!name || !email || !password) {
      return res.status(400).json({ msg: 'name, email y password son obligatorios' });
    }

    // Destructuring SEGURO: si db.query devuelve { rows }, tomamos rows; si no, caemos a []
    const q1 = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    const existRows = Array.isArray(q1?.rows) ? q1.rows : (Array.isArray(q1) ? q1 : []);
    if (existRows.length > 0) {
      return res.status(409).json({ msg: 'El email ya está registrado' });
    }

    const password_hash = await bcrypt.hash(password, ROUNDS);
    const userRole = role === 'admin' ? 'admin' : 'user';

    await db.query(
      'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [name, email, password_hash, userRole]
    );

    const q2 = await db.query(
      'SELECT id, name, email, role, created_at FROM users WHERE email = ?',
      [email]
    );
    const rows2 = Array.isArray(q2?.rows) ? q2.rows : (Array.isArray(q2) ? q2 : []);
    const user = rows2[0];

    const token = signToken(user);
    return res.status(201).json({ user, token });
  } catch (err) {
    // Log útil en dev
    console.error('[register] error:', err);
    return next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ msg: 'email y password son obligatorios' });
    }

    const q = await db.query(
      'SELECT id, name, email, password_hash, role, created_at FROM users WHERE email = ?',
      [email]
    );
    const rows = Array.isArray(q?.rows) ? q.rows : (Array.isArray(q) ? q : []);
    const user = rows[0];
    if (!user) return res.status(401).json({ msg: 'Credenciales inválidas' });

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ msg: 'Credenciales inválidas' });

    delete user.password_hash;
    const token = signToken(user);
    return res.json({ user, token });
  } catch (err) {
    console.error('[login] error:', err);
    return next(err);
  }
};

exports.me = async (req, res, next) => {
  try {
    const { sub } = req.user || {};
    if (!sub) return res.status(401).json({ msg: 'No autorizado' });

    const q = await db.query(
      'SELECT id, name, email, role, created_at FROM users WHERE id = ?',
      [sub]
    );
    const rows = Array.isArray(q?.rows) ? q.rows : (Array.isArray(q) ? q : []);
    const user = rows[0] || null;
    return res.json({ user });
  } catch (err) {
    console.error('[me] error:', err);
    return next(err);
  }
};
