const express = require('express');
const router = express.Router();

// Importa el controller como objeto completo (sin destructuring)
const ctrl = require('../controllers/productController');

// Utilidad: escoger el primer handler disponible entre varios alias comunes
function pickHandler(action, ...candidates) {
  for (const name of candidates) {
    if (typeof ctrl[name] === 'function') return ctrl[name];
  }
  throw new Error(
    `[productRoutes] No encontré handler para "${action}". ` +
    `Define alguna de estas funciones en controllers/productController.js: ${candidates.join(', ')}`
  );
}

// ===== Handlers (detecta nombres comunes) =====
const listHandler   = pickHandler('list',
  'getAllProducts', 'getAll', 'list', 'index', 'findAll', 'getProducts');

const createHandler = pickHandler('create',
  'createProduct', 'create', 'store', 'addProduct');

const getByIdHandler = pickHandler('getById',
  'getProductById', 'getById', 'show', 'findById');

const updateHandler = pickHandler('update',
  'updateProduct', 'update', 'put');

const deleteHandler = pickHandler('delete',
  'deleteProduct', 'remove', 'destroy');

// ===== Rutas estilo Opción A (base /api/products) =====
// GET    /api/products
router.get('/', listHandler);

// POST   /api/products
router.post('/', createHandler);

// GET    /api/products/:id
router.get('/:id', getByIdHandler);

// PUT    /api/products/:id
router.put('/:id', updateHandler);

// DELETE /api/products/:id
router.delete('/:id', deleteHandler);

module.exports = router;
