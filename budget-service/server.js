const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const dotenv = require("dotenv")
const budgetRoutes = require("./routes/budgetRoutes")

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3003

// Middleware
app.use(cors())
app.use(express.json())

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://mongo:27017/Budget-Tracker-&-Financial-Planner", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Budget Service: Connected to MongoDB"))
  .catch((err) => console.error("Budget Service: MongoDB connection error:", err))

// Routes
app.use("/api/budgets", budgetRoutes)

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "Budget Service is running" })
})

app.listen(PORT, () => {
  console.log(`Budget Service running on port ${PORT}`)
})
