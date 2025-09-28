const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port: Number(process.env.DB_PORT || 3306),
  waitForConnections: true,
  connectionLimit: 10,
});

(async () => {
  try {
    const conn = await pool.getConnection();
    console.log('Conexión a MySQL establecida exitosamente.');
    conn.release();
  } catch (err) {
    console.error('Error conectando a MySQL:', err.message);
  }
})();

module.exports = {
  query: async (sql, params) => {
    const [rows] = await pool.execute(sql, params);
    return { rows };
  },
  pool
};