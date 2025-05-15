const express = require('express');
const router = express.Router();

// Shembull: GET /api/transactions
router.get('/', (req, res) => {
  res.json({ message: 'Transaction Service is working!' });
});

module.exports = router;
