const express = require("express")
const { body, validationResult, query } = require("express-validator")
const Budget = require("../models/Budget")
const auth = require("../middleware/auth")

const router = express.Router()

// Create budget
router.post(
  "/",
  auth,
  [
    body("name").notEmpty().trim().escape(),
    body("category").notEmpty().trim().escape(),
    body("limit").isNumeric().isFloat({ min: 0.01 }),
    body("period").isIn(["weekly", "monthly", "yearly"]),
    body("startDate").isISO8601(),
    body("endDate").isISO8601(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      // Check if budget already exists for this category and period
      const existingBudget = await Budget.findOne({
        userId: req.user.userId,
        category: req.body.category,
        period: req.body.period,
        isActive: true,
      })

      if (existingBudget) {
        return res.status(400).json({
          message: "Active budget already exists for this category and period",
        })
      }

      const budgetData = {
        ...req.body,
        userId: req.user.userId,
      }

      const budget = new Budget(budgetData)
      await budget.save()

      res.status(201).json({
        message: "Budget created successfully",
        budget,
      })
    } catch (error) {
      console.error("Budget creation error:", error)
      res.status(500).json({ message: "Server error" })
    }
  },
)

// Get budgets
router.get(
  "/",
  auth,
  [
    query("isActive").optional().isBoolean(),
    query("category").optional().trim(),
    query("period").optional().isIn(["weekly", "monthly", "yearly"]),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const filter = { userId: req.user.userId }

      if (req.query.isActive !== undefined) {
        filter.isActive = req.query.isActive === "true"
      }
      if (req.query.category) {
        filter.category = new RegExp(req.query.category, "i")
      }
      if (req.query.period) {
        filter.period = req.query.period
      }

      const budgets = await Budget.find(filter).sort({ createdAt: -1 })

      res.json({ budgets })
    } catch (error) {
      console.error("Get budgets error:", error)
      res.status(500).json({ message: "Server error" })
    }
  },
)

// Get budget by ID
router.get("/:id", auth, async (req, res) => {
  try {
    const budget = await Budget.findOne({
      _id: req.params.id,
      userId: req.user.userId,
    })

    if (!budget) {
      return res.status(404).json({ message: "Budget not found" })
    }

    res.json(budget)
  } catch (error) {
    console.error("Get budget error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Update budget
router.put(
  "/:id",
  auth,
  [
    body("name").optional().notEmpty().trim().escape(),
    body("limit").optional().isNumeric().isFloat({ min: 0.01 }),
    body("spent").optional().isNumeric().isFloat({ min: 0 }),
    body("isActive").optional().isBoolean(),
    body("alerts.enabled").optional().isBoolean(),
    body("alerts.threshold").optional().isNumeric().isFloat({ min: 0, max: 100 }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const budget = await Budget.findOneAndUpdate({ _id: req.params.id, userId: req.user.userId }, req.body, {
        new: true,
        runValidators: true,
      })

      if (!budget) {
        return res.status(404).json({ message: "Budget not found" })
      }

      res.json({
        message: "Budget updated successfully",
        budget,
      })
    } catch (error) {
      console.error("Update budget error:", error)
      res.status(500).json({ message: "Server error" })
    }
  },
)

// Delete budget
router.delete("/:id", auth, async (req, res) => {
  try {
    const budget = await Budget.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId,
    })

    if (!budget) {
      return res.status(404).json({ message: "Budget not found" })
    }

    res.json({ message: "Budget deleted successfully" })
  } catch (error) {
    console.error("Delete budget error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Add goal to budget
router.post(
  "/:id/goals",
  auth,
  [
    body("description").notEmpty().trim().escape(),
    body("targetAmount").isNumeric().isFloat({ min: 0.01 }),
    body("targetDate").isISO8601(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const budget = await Budget.findOne({
        _id: req.params.id,
        userId: req.user.userId,
      })

      if (!budget) {
        return res.status(404).json({ message: "Budget not found" })
      }

      budget.goals.push(req.body)
      await budget.save()

      res.status(201).json({
        message: "Goal added successfully",
        budget,
      })
    } catch (error) {
      console.error("Add goal error:", error)
      res.status(500).json({ message: "Server error" })
    }
  },
)

// Update goal
router.put(
  "/:id/goals/:goalId",
  auth,
  [
    body("description").optional().notEmpty().trim().escape(),
    body("targetAmount").optional().isNumeric().isFloat({ min: 0.01 }),
    body("currentAmount").optional().isNumeric().isFloat({ min: 0 }),
    body("targetDate").optional().isISO8601(),
    body("isCompleted").optional().isBoolean(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const budget = await Budget.findOne({
        _id: req.params.id,
        userId: req.user.userId,
      })

      if (!budget) {
        return res.status(404).json({ message: "Budget not found" })
      }

      const goal = budget.goals.id(req.params.goalId)
      if (!goal) {
        return res.status(404).json({ message: "Goal not found" })
      }

      Object.assign(goal, req.body)
      await budget.save()

      res.json({
        message: "Goal updated successfully",
        budget,
      })
    } catch (error) {
      console.error("Update goal error:", error)
      res.status(500).json({ message: "Server error" })
    }
  },
)

// Get budget analytics
router.get("/analytics/overview", auth, async (req, res) => {
  try {
    const budgets = await Budget.find({
      userId: req.user.userId,
      isActive: true,
    })

    const analytics = {
      totalBudgets: budgets.length,
      totalLimit: budgets.reduce((sum, budget) => sum + budget.limit, 0),
      totalSpent: budgets.reduce((sum, budget) => sum + budget.spent, 0),
      budgetsOverLimit: budgets.filter((budget) => budget.spent > budget.limit).length,
      budgetsNearLimit: budgets.filter(
        (budget) => budget.percentageSpent >= budget.alerts.threshold && budget.spent <= budget.limit,
      ).length,
      categoryBreakdown: budgets.map((budget) => ({
        category: budget.category,
        limit: budget.limit,
        spent: budget.spent,
        percentage: budget.percentageSpent,
        remaining: budget.remaining,
      })),
    }

    res.json(analytics)
  } catch (error) {
    console.error("Get analytics error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router
