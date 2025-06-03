const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const dotenv = require("dotenv")
const userRoutes = require("./routes/userRoutes")

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json())

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://mongo:27017/Budget-Tracker-&-Financial-Planner", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("User Service: Connected to MongoDB"))
  .catch((err) => console.error("User Service: MongoDB connection error:", err))

// Routes
app.use("/api/users", userRoutes)

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "User Service is running" })
})

app.listen(PORT, () => {
  console.log(`User Service running on port ${PORT}`)
})
