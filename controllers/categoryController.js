const db = require('../db');

// Crear categoría
exports.createCategory = async (req, res) => {
  const { name, description } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO categories (name, description) VALUES (?, ?)',
      [name, description || null]
    );
    const [rows] = await db.query('SELECT * FROM categories WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear la categoría' });
  }
};

// Listar categorías (útil para probar)
exports.getCategories = async (_req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM categories ORDER BY id');
    res.status(200).json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener categorías' });
  }
};

// C) Productos por categoría (1–N)
exports.getProductsByCategory = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query(
      `SELECT p.id, p.name, p.description, p.price, p.category_id
       FROM products p
       WHERE p.category_id = ? ORDER BY p.id`,
      [id]
    );
    res.status(200).json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al listar productos por categoría' });
  }
};

// Crear producto dentro de una categoría
exports.createProductInCategory = async (req, res) => {
  const { id } = req.params; // category id
  const { name, description, price } = req.body;
  try {
    const [result] = await db.query(
      `INSERT INTO products (name, description, price, category_id)
       VALUES (?, ?, ?, ?)`,
      [name, description || null, Number(price), id]
    );
    const [rows] = await db.query('SELECT * FROM products WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear producto en la categoría' });
  }
};
