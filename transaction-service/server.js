const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const dotenv = require("dotenv")
const transactionRoutes = require("./routes/transactionRoutes")

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3002

// Middleware
app.use(cors())
app.use(express.json())

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://mongo:27017/Budget-Tracker-&-Financial-Planner", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Transaction Service: Connected to MongoDB"))
  .catch((err) => console.error("Transaction Service: MongoDB connection error:", err))

// Routes
app.use("/api/transactions", transactionRoutes)

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "Transaction Service is running" })
})

app.listen(PORT, () => {
  console.log(`Transaction Service running on port ${PORT}`)
})
