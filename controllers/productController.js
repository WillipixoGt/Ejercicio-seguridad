// controllers/productController.js
const db = require('../db');

// GET /api/products
exports.getAllProducts = async (_req, res, next) => {
  try {
    const q = await db.query(
      'SELECT id, name, description, price, category_id, created_at FROM products ORDER BY id DESC'
    );
    const rows = Array.isArray(q?.rows) ? q.rows : (Array.isArray(q) ? q : []);
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

// POST /api/products
exports.createProduct = async (req, res, next) => {
  try {
    const { name, description = null, price, category_id = null } = req.body || {};
    if (!name || price === undefined || price === null || isNaN(Number(price))) {
      return res.status(400).json({ msg: 'name y price son obligatorios; price debe ser numérico' });
    }

    await db.query(
      'INSERT INTO products (name, description, price, category_id) VALUES (?, ?, ?, ?)',
      [name, description, Number(price), category_id]
    );

    // devuelve el último insertado (tomamos el mayor id)
    const q2 = await db.query(
      'SELECT id, name, description, price, category_id, created_at FROM products ORDER BY id DESC LIMIT 1'
    );
    const rows2 = Array.isArray(q2?.rows) ? q2.rows : (Array.isArray(q2) ? q2 : []);
    res.status(201).json(rows2[0] || null);
  } catch (err) {
    next(err);
  }
};

// GET /api/products/:id
exports.getProductById = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ msg: 'id inválido' });

    const q = await db.query(
      'SELECT id, name, description, price, category_id, created_at FROM products WHERE id = ?',
      [id]
    );
    const rows = Array.isArray(q?.rows) ? q.rows : (Array.isArray(q) ? q : []);
    const product = rows[0];
    if (!product) return res.status(404).json({ msg: 'Producto no encontrado' });
    res.json(product);
  } catch (err) {
    next(err);
  }
};

// PUT /api/products/:id
exports.updateProduct = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ msg: 'id inválido' });

    const { name, description, price, category_id } = req.body || {};
    const fields = [];
    const params = [];

    if (name !== undefined) { fields.push('name = ?'); params.push(name); }
    if (description !== undefined) { fields.push('description = ?'); params.push(description); }
    if (price !== undefined) {
      if (isNaN(Number(price))) return res.status(400).json({ msg: 'price debe ser numérico' });
      fields.push('price = ?'); params.push(Number(price));
    }
    if (category_id !== undefined) { fields.push('category_id = ?'); params.push(category_id); }

    if (fields.length === 0) return res.status(400).json({ msg: 'Nada que actualizar' });

    params.push(id);
    await db.query(`UPDATE products SET ${fields.join(', ')} WHERE id = ?`, params);

    const q2 = await db.query(
      'SELECT id, name, description, price, category_id, created_at FROM products WHERE id = ?',
      [id]
    );
    const rows2 = Array.isArray(q2?.rows) ? q2.rows : (Array.isArray(q2) ? q2 : []);
    const product = rows2[0];
    if (!product) return res.status(404).json({ msg: 'Producto no encontrado tras actualizar' });
    res.json(product);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/products/:id
exports.deleteProduct = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ msg: 'id inválido' });

    const q = await db.query('DELETE FROM products WHERE id = ?', [id]);
    // Opcional: comprobar afectación si tu wrapper la expone
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
