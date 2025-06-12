const express = require("express")
const { body, validationResult, query } = require("express-validator")
const Transaction = require("../models/Transaction")
const auth = require("../middleware/auth")
const axios = require("axios")

const router = express.Router()

// Helper function to calculate transaction statistics
async function calculateTransactionStats(userId) {
  try {
    // Get all transactions for the user
    const transactions = await Transaction.find({ userId })

    // Calculate summary by type (income/expense)
    const summary = transactions.reduce((acc, transaction) => {
      const type = transaction.type
      const amount = transaction.amount
      
      if (!acc[type]) {
        acc[type] = { _id: type, total: 0 }
      }
      acc[type].total += amount
      return acc
    }, {})

    // Calculate category breakdown
    const categoryBreakdown = transactions.reduce((acc, transaction) => {
      if (transaction.type === 'expense') {
        const category = transaction.category
        if (!acc[category]) {
          acc[category] = { _id: category, total: 0 }
        }
        acc[category].total += transaction.amount
      }
      return acc
    }, {})

    // Convert to array and sort by total
    const categoryArray = Object.values(categoryBreakdown).sort((a, b) => b.total - a.total)

    return {
      summary: Object.values(summary),
      categoryBreakdown: categoryArray
    }
  } catch (error) {
    console.error('Error calculating transaction stats:', error)
    throw error
  }
}

// Helper function to recalculate budget spent amount from all transactions
async function recalculateBudgetSpent(budgetId, userToken) {
  try {
    const budgetServiceUrl = process.env.BUDGET_SERVICE_URL || "http://localhost:3003"

    console.log(`🔄 Recalculating budget spent for budget: ${budgetId}`)

    // Get all transactions for this budget
    const allTransactions = await Transaction.find({
      budgetId: budgetId,
      type: "expense",
    })

    // Calculate total spent from all transactions
    const totalSpent = allTransactions.reduce((sum, transaction) => sum + transaction.amount, 0)

    console.log(`📊 Found ${allTransactions.length} transactions, total: $${totalSpent}`)

    // Update budget with the calculated total
    const updateResponse = await axios.put(
      `${budgetServiceUrl}/api/budgets/${budgetId}`,
      { spent: totalSpent },
      {
        headers: {
          Authorization: `Bearer ${userToken}`,
          "Content-Type": "application/json",
        },
        timeout: 5000,
      },
    )

    console.log(`✅ Budget updated successfully. New spent: $${updateResponse.data.budget.spent}`)
    return updateResponse.data.budget
  } catch (error) {
    console.error("❌ Error recalculating budget:", error.response?.data || error.message)
    return null
  }
}

// Create transaction
router.post(
  "/",
  auth,
  [
    body("amount").isNumeric().isFloat({ min: 0.01 }),
    body("type").isIn(["income", "expense"]),
    body("category").notEmpty().trim().escape(),
    body("description").notEmpty().trim().escape(),
    body("date").optional().isISO8601(),
    body("budgetId").optional().isMongoId(),
    body("tags").optional().isArray(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      console.log("💰 Creating transaction:", req.body)

      const transactionData = {
        ...req.body,
        userId: req.user.userId,
      }

      const transaction = new Transaction(transactionData)
      await transaction.save()

      console.log("✅ Transaction created successfully:", transaction._id)

      // Recalculate budget if budgetId is provided and transaction is expense
      if (req.body.budgetId && req.body.type === "expense") {
        console.log("🎯 Recalculating budget for expense transaction...")

        const userToken = req.header("Authorization")?.replace("Bearer ", "")
        const updatedBudget = await recalculateBudgetSpent(req.body.budgetId, userToken)

        if (updatedBudget) {
          console.log("🎉 Budget recalculated successfully")
        } else {
          console.log("⚠️ Budget recalculation failed")
        }
      }

      res.status(201).json({
        message: "Transaction created successfully",
        transaction,
      })
    } catch (error) {
      console.error("❌ Transaction creation error:", error)
      res.status(500).json({ message: "Server error" })
    }
  },
)

// Get transactions with filtering and pagination
router.get(
  "/",
  auth,
  [
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 100 }),
    query("type").optional().isIn(["income", "expense"]),
    query("category").optional().trim(),
    query("startDate").optional().isISO8601(),
    query("endDate").optional().isISO8601(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const { page = 1, limit = 10, type, category, startDate, endDate } = req.query

      // Build filter
      const filter = { userId: req.user.userId }

      if (type) filter.type = type
      if (category) filter.category = new RegExp(category, "i")

      if (startDate || endDate) {
        filter.date = {}
        if (startDate) filter.date.$gte = new Date(startDate)
        if (endDate) filter.date.$lte = new Date(endDate)
      }

      const skip = (page - 1) * limit

      const transactions = await Transaction.find(filter).sort({ date: -1 }).skip(skip).limit(Number.parseInt(limit))

      const total = await Transaction.countDocuments(filter)

      res.json({
        transactions,
        pagination: {
          current: Number.parseInt(page),
          pages: Math.ceil(total / limit),
          total,
        },
      })
    } catch (error) {
      console.error("Get transactions error:", error)
      res.status(500).json({ message: "Server error" })
    }
  },
)

// Get transaction statistics
router.get("/stats/summary", auth, async (req, res) => {
  try {
    const stats = await calculateTransactionStats(req.user.userId)
    res.json(stats)
  } catch (error) {
    console.error("Get transaction stats error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get transaction by ID
router.get("/:id", auth, async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      userId: req.user.userId,
    })

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" })
    }

    res.json(transaction)
  } catch (error) {
    console.error("Get transaction error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Update transaction
router.put(
  "/:id",
  auth,
  [
    body("amount").optional().isNumeric().isFloat({ min: 0.01 }),
    body("type").optional().isIn(["income", "expense"]),
    body("category").optional().notEmpty().trim().escape(),
    body("description").optional().notEmpty().trim().escape(),
    body("date").optional().isISO8601(),
    body("budgetId").optional().isMongoId(),
    body("tags").optional().isArray(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      console.log("🔄 Updating transaction:", req.params.id)

      // Get the original transaction
      const originalTransaction = await Transaction.findOne({
        _id: req.params.id,
        userId: req.user.userId,
      })

      if (!originalTransaction) {
        return res.status(404).json({ message: "Transaction not found" })
      }

      const userToken = req.header("Authorization")?.replace("Bearer ", "")
      const budgetsToRecalculate = new Set()

      // Track which budgets need recalculation
      if (originalTransaction.budgetId && originalTransaction.type === "expense") {
        budgetsToRecalculate.add(originalTransaction.budgetId.toString())
      }

      // Update the transaction
      const transaction = await Transaction.findOneAndUpdate(
        { _id: req.params.id, userId: req.user.userId },
        req.body,
        { new: true, runValidators: true },
      )

      // Track new budget if changed
      const newBudgetId = req.body.budgetId !== undefined ? req.body.budgetId : originalTransaction.budgetId
      const newType = req.body.type || originalTransaction.type

      if (newBudgetId && newType === "expense") {
        budgetsToRecalculate.add(newBudgetId.toString())
      }

      // Recalculate all affected budgets
      for (const budgetId of budgetsToRecalculate) {
        console.log(`🎯 Recalculating budget: ${budgetId}`)
        await recalculateBudgetSpent(budgetId, userToken)
      }

      res.json({
        message: "Transaction updated successfully",
        transaction,
      })
    } catch (error) {
      console.error("❌ Update transaction error:", error)
      res.status(500).json({ message: "Server error" })
    }
  },
)

// Delete transaction
router.delete("/:id", auth, async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      userId: req.user.userId,
    })

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" })
    }

    console.log("🗑️ Deleting transaction:", transaction._id)

    const budgetToRecalculate = transaction.budgetId
    const userToken = req.header("Authorization")?.replace("Bearer ", "")

    // Delete the transaction
    await Transaction.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId,
    })

    // Recalculate budget if it was linked to one
    if (budgetToRecalculate && transaction.type === "expense") {
      console.log("🎯 Recalculating budget after deletion...")
      await recalculateBudgetSpent(budgetToRecalculate, userToken)
    }

    res.json({ message: "Transaction deleted successfully" })
  } catch (error) {
    console.error("❌ Delete transaction error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get transaction statistics
router.get(
  "/stats/summary",
  auth,
  [query("startDate").optional().isISO8601(), query("endDate").optional().isISO8601()],
  async (req, res) => {
    try {
      const { startDate, endDate } = req.query

      const filter = { userId: req.user.userId }

      if (startDate || endDate) {
        filter.date = {}
        if (startDate) filter.date.$gte = new Date(startDate)
        if (endDate) filter.date.$lte = new Date(endDate)
      }

      const stats = await Transaction.aggregate([
        { $match: filter },
        {
          $group: {
            _id: "$type",
            total: { $sum: "$amount" },
            count: { $sum: 1 },
          },
        },
      ])

      const categoryStats = await Transaction.aggregate([
        { $match: { ...filter, type: "expense" } },
        {
          $group: {
            _id: "$category",
            total: { $sum: "$amount" },
            count: { $sum: 1 },
          },
        },
        { $sort: { total: -1 } },
      ])

      res.json({
        summary: stats,
        categoryBreakdown: categoryStats,
      })
    } catch (error) {
      console.error("Get stats error:", error)
      res.status(500).json({ message: "Server error" })
    }
  },
)

module.exports = router
