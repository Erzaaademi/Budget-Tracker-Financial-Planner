const mongoose = require("mongoose")

const budgetSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    limit: {
      type: Number,
      required: true,
      min: 0,
    },
    spent: {
      type: Number,
      default: 0,
      min: 0,
    },
    period: {
      type: String,
      enum: ["weekly", "monthly", "yearly"],
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    alerts: {
      enabled: {
        type: Boolean,
        default: true,
      },
      threshold: {
        type: Number,
        default: 80,
        min: 0,
        max: 100,
      },
    },
    goals: [
      {
        description: {
          type: String,
          required: true,
          trim: true,
        },
        targetAmount: {
          type: Number,
          required: true,
          min: 0,
        },
        currentAmount: {
          type: Number,
          default: 0,
          min: 0,
        },
        targetDate: {
          type: Date,
          required: true,
        },
        isCompleted: {
          type: Boolean,
          default: false,
        },
      },
    ],
  },
  {
    timestamps: true,
  },
)

// Index for better query performance
budgetSchema.index({ userId: 1, category: 1 })
budgetSchema.index({ userId: 1, isActive: 1 })

// Virtual for percentage spent
budgetSchema.virtual("percentageSpent").get(function () {
  return this.limit > 0 ? (this.spent / this.limit) * 100 : 0
})

// Virtual for remaining amount
budgetSchema.virtual("remaining").get(function () {
  return Math.max(0, this.limit - this.spent)
})

budgetSchema.set("toJSON", { virtuals: true })

module.exports = mongoose.model("Budget", budgetSchema)
