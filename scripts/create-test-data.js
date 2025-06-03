const { MongoClient, ObjectId } = require("mongodb")

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/Budget-Tracker-&-Financial-Planner"

async function createDataForQendrim() {
  let client

  try {
    console.log("🔄 Creating data for qendrim@gmail.com...")

    client = new MongoClient(MONGODB_URI)
    await client.connect()
    const db = client.db()

    // Find qendrim@gmail.com user
    const user = await db.collection("users").findOne({ email: "qendrim@gmail.com" })

    if (!user) {
      console.log("❌ User qendrim@gmail.com not found. Please register first.")
      return
    }

    console.log(`📋 Creating data for: ${user.email} (ID: ${user._id})`)

    // Clear existing data for this user (optional)
    await db.collection("transactions").deleteMany({ userId: user._id })
    await db.collection("budgets").deleteMany({ userId: user._id })
    console.log("🗑️  Cleared existing data")

    // Create sample transactions
    const transactions = [
      {
        userId: user._id,
        amount: 4500,
        type: "income",
        category: "Salary",
        description: "Monthly salary payment",
        date: new Date("2025-05-01"),
        recurring: { isRecurring: true, frequency: "monthly", nextDate: new Date("2025-06-01") },
        tags: ["work", "monthly"],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        userId: user._id,
        amount: 500,
        type: "income",
        category: "Freelance",
        description: "Web development project",
        date: new Date("2025-05-15"),
        recurring: { isRecurring: false },
        tags: ["freelance", "project"],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        userId: user._id,
        amount: 1000,
        type: "expense",
        category: "Rent",
        description: "Monthly apartment rent",
        date: new Date("2025-05-01"),
        recurring: { isRecurring: true, frequency: "monthly", nextDate: new Date("2025-06-01") },
        tags: ["housing", "monthly"],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        userId: user._id,
        amount: 250,
        type: "expense",
        category: "Groceries",
        description: "Weekly grocery shopping",
        date: new Date("2025-05-20"),
        recurring: { isRecurring: false },
        tags: ["food", "weekly"],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        userId: user._id,
        amount: 120,
        type: "expense",
        category: "Transportation",
        description: "Monthly bus pass",
        date: new Date("2025-05-01"),
        recurring: { isRecurring: true, frequency: "monthly", nextDate: new Date("2025-06-01") },
        tags: ["transport", "monthly"],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        userId: user._id,
        amount: 80,
        type: "expense",
        category: "Entertainment",
        description: "Netflix and Spotify subscriptions",
        date: new Date("2025-05-01"),
        recurring: { isRecurring: true, frequency: "monthly", nextDate: new Date("2025-06-01") },
        tags: ["entertainment", "subscription"],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        userId: user._id,
        amount: 60,
        type: "expense",
        category: "Utilities",
        description: "Electricity bill",
        date: new Date("2025-05-10"),
        recurring: { isRecurring: false },
        tags: ["utilities", "electricity"],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]

    // Insert transactions
    const txResult = await db.collection("transactions").insertMany(transactions)
    console.log(`✅ Created ${txResult.insertedCount} transactions`)

    // Create sample budgets
    const budgets = [
      {
        userId: user._id,
        name: "Monthly Groceries Budget",
        category: "Groceries",
        limit: 400,
        spent: 250,
        period: "monthly",
        startDate: new Date("2025-05-01"),
        endDate: new Date("2025-05-31"),
        isActive: true,
        alerts: { enabled: true, threshold: 80 },
        goals: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        userId: user._id,
        name: "Transportation Budget",
        category: "Transportation",
        limit: 150,
        spent: 120,
        period: "monthly",
        startDate: new Date("2025-05-01"),
        endDate: new Date("2025-05-31"),
        isActive: true,
        alerts: { enabled: true, threshold: 90 },
        goals: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        userId: user._id,
        name: "Entertainment Budget",
        category: "Entertainment",
        limit: 200,
        spent: 80,
        period: "monthly",
        startDate: new Date("2025-05-01"),
        endDate: new Date("2025-05-31"),
        isActive: true,
        alerts: { enabled: true, threshold: 75 },
        goals: [
          {
            description: "Save for concert tickets",
            targetAmount: 150,
            currentAmount: 50,
            targetDate: new Date("2025-07-01"),
            isCompleted: false,
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]

    // Insert budgets
    const budgetResult = await db.collection("budgets").insertMany(budgets)
    console.log(`✅ Created ${budgetResult.insertedCount} budgets`)

    // Calculate totals
    const totalIncome = transactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)
    const totalExpenses = transactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0)
    const netIncome = totalIncome - totalExpenses

    console.log(`📊 Summary for ${user.email}:`)
    console.log(`   💰 Total Income: $${totalIncome}`)
    console.log(`   💸 Total Expenses: $${totalExpenses}`)
    console.log(`   📈 Net Income: $${netIncome}`)
    console.log(`   📋 Transactions: ${transactions.length}`)
    console.log(`   🎯 Budgets: ${budgets.length}`)

    console.log("🎉 Data created! Refresh your dashboard to see the data.")
  } catch (error) {
    console.error("❌ Failed to create data:", error)
  } finally {
    if (client) {
      await client.close()
    }
  }
}

createDataForQendrim()
