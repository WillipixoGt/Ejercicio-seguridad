const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');

router.post('/categories', categoryController.createCategory);
router.get('/categories', categoryController.getCategories);    
router.get('/categories/:id/products', categoryController.getProductsByCategory);
router.post('/categories/:id/products', categoryController.createProductInCategory);

module.exports = router;
