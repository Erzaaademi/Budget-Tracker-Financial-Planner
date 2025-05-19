const Budget = require('../models/budget.model');

// Create a new budget
exports.createBudget = async (req, res) => {
  try {
    const budget = new Budget({
      ...req.body,
      userId: req.user.id
    });
    await budget.save();
    res.status(201).json(budget);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all budgets for a user
exports.getBudgets = async (req, res) => {
  try {
    const budgets = await Budget.find({ userId: req.user.id });
    res.json(budgets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get budget report
exports.getBudgetReport = async (req, res) => {
  try {
    const currentDate = new Date();
    const budgets = await Budget.find({
      userId: req.user.id,
      startDate: { $lte: currentDate },
      endDate: { $gte: currentDate }
    });

    const report = budgets.map(budget => ({
      name: budget.name,
      category: budget.category,
      amount: budget.amount,
      currentSpending: budget.currentSpending,
      remainingBudget: budget.amount - budget.currentSpending,
      percentageUsed: ((budget.currentSpending / budget.amount) * 100).toFixed(2),
      period: budget.period,
      isOverBudget: budget.currentSpending > budget.amount
    }));

    const summary = {
      totalBudget: budgets.reduce((sum, b) => sum + b.amount, 0),
      totalSpending: budgets.reduce((sum, b) => sum + b.currentSpending, 0),
      overBudgetCategories: report.filter(r => r.isOverBudget).map(r => r.category)
    };

    res.json({
      summary,
      details: report
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update budget
exports.updateBudget = async (req, res) => {
  try {
    const budget = await Budget.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true }
    );
    
    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }
    
    res.json(budget);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete budget
exports.deleteBudget = async (req, res) => {
  try {
    const budget = await Budget.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }
    
    res.json({ message: 'Budget deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
