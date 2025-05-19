const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const budgetController = require('../controllers/budget.controller');

// Validation middleware
const validateBudget = [
  body('name').trim().notEmpty().withMessage('Budget name is required'),
  body('amount').isNumeric().withMessage('Amount must be a number'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('period').isIn(['daily', 'weekly', 'monthly', 'yearly']).withMessage('Invalid period'),
  body('startDate').isISO8601().withMessage('Invalid start date'),
  body('endDate').isISO8601().withMessage('Invalid end date')
];

// Routes
router.post('/', validateBudget, budgetController.createBudget);
router.get('/', budgetController.getBudgets);
router.get('/report', budgetController.getBudgetReport);
router.put('/:id', validateBudget, budgetController.updateBudget);
router.delete('/:id', budgetController.deleteBudget);

module.exports = router;
