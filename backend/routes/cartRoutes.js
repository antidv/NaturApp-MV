const express = require('express');
const router = express.Router();

// Esta ruta es de ejemplo; el carrito se mantiene principalmente en cliente.
router.get('/', (req, res) => {
  res.json({ message: 'Carrito backend no implementado; usar local storage en el cliente.' });
});

module.exports = router;
