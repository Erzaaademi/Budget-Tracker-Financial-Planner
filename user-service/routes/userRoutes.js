const express = require("express")
const jwt = require("jsonwebtoken")
const { body, validationResult } = require("express-validator")
const User = require("../models/User")
const auth = require("../middleware/auth")

const router = express.Router()

// Register user
router.post(
  "/register",
  [
    body("username").isLength({ min: 3 }).trim().escape(),
    body("email").isEmail().normalizeEmail(),
    body("password").isLength({ min: 6 }),
    body("firstName").notEmpty().trim().escape(),
    body("lastName").notEmpty().trim().escape(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const { username, email, password, firstName, lastName } = req.body

      // Check if user already exists
      const existingUser = await User.findOne({
        $or: [{ email }, { username }],
      })

      if (existingUser) {
        return res.status(400).json({ message: "User already exists" })
      }

      // Create new user
      const user = new User({
        username,
        email,
        password,
        firstName,
        lastName,
      })

      await user.save()

      // Generate JWT token
      const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET || "your-secret-key", {
        expiresIn: "7d",
      })

      res.status(201).json({
        message: "User created successfully",
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
      })
    } catch (error) {
      console.error("Registration error:", error)
      res.status(500).json({ message: "Server error" })
    }
  },
)

// Login user
router.post("/login", [body("email").isEmail().normalizeEmail(), body("password").notEmpty()], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { email, password } = req.body

    // Find user by email
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" })
    }

    // Check password
    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" })
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET || "your-secret-key", {
      expiresIn: "7d",
    })

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get user profile
router.get("/profile", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password")
    res.json(user)
  } catch (error) {
    console.error("Profile error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Update user profile
router.put(
  "/profile",
  auth,
  [
    body("firstName").optional().trim().escape(),
    body("lastName").optional().trim().escape(),
    body("preferences.currency").optional().trim(),
    body("preferences.theme").optional().isIn(["light", "dark"]),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const updates = req.body
      const user = await User.findByIdAndUpdate(req.user.userId, updates, { new: true, runValidators: true }).select(
        "-password",
      )

      res.json(user)
    } catch (error) {
      console.error("Profile update error:", error)
      res.status(500).json({ message: "Server error" })
    }
  },
)

module.exports = router
