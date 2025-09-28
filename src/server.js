const express = require('express');
require('dotenv').config();
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');

const productRoutes = require('../routes/productRoutes');
const categoryRoutes = require('../routes/categoryRoutes');
const authRoutes = require('../routes/authroutes');
const { verifyToken, requireRole } = require('../middleware/authmiddleware');


const app = express();
app.use(express.json());

// Seguridad base
app.use(helmet());
app.use(cors({
  origin: [
    'http://localhost:5173',  // tu frontend local (ajústalo)
    'http://localhost:3000'
  ],
  credentials: true
}));
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300
}));

// Rutas
app.use('/api/auth', authRoutes);                        // Auth
app.use('/api/products', verifyToken, productRoutes);    // Productos protegidos
app.use('/api/categories', categoryRoutes);              // Categorías públicas

// Endpoint raíz
app.get('/', (_req, res) => res.send('API CRUD con MySQL está funcionando!'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`));
