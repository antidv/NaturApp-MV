const express = require('express');
const Product = require('../models/Product');
const router = express.Router();

router.get('/', async (req, res) => {
  const categories = await Product.distinct('category');
  res.json(categories);
});

module.exports = router;
