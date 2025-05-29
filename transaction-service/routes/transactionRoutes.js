const express = require("express")
const { body, validationResult, query } = require("express-validator")
const Transaction = require("../models/Transaction")
const auth = require("../middleware/auth")

const router = express.Router()

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
    body("tags").optional().isArray(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const transactionData = {
        ...req.body,
        userId: req.user.userId,
      }

      const transaction = new Transaction(transactionData)
      await transaction.save()

      res.status(201).json({
        message: "Transaction created successfully",
        transaction,
      })
    } catch (error) {
      console.error("Transaction creation error:", error)
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
    body("tags").optional().isArray(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const transaction = await Transaction.findOneAndUpdate(
        { _id: req.params.id, userId: req.user.userId },
        req.body,
        { new: true, runValidators: true },
      )

      if (!transaction) {
        return res.status(404).json({ message: "Transaction not found" })
      }

      res.json({
        message: "Transaction updated successfully",
        transaction,
      })
    } catch (error) {
      console.error("Update transaction error:", error)
      res.status(500).json({ message: "Server error" })
    }
  },
)

// Delete transaction
router.delete("/:id", auth, async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId,
    })

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" })
    }

    res.json({ message: "Transaction deleted successfully" })
  } catch (error) {
    console.error("Delete transaction error:", error)
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
