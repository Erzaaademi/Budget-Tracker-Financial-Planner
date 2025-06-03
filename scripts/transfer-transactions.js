const { MongoClient, ObjectId } = require("mongodb")

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/Budget-Tracker-&-Financial-Planner"

async function transferToCurrentUser() {
  let client

  try {
    console.log("🔄 Starting data transfer...")

    client = new MongoClient(MONGODB_URI)
    await client.connect()
    const db = client.db()

    // Find the user qendrim@gmail.com
    const currentUser = await db.collection("users").findOne({ email: "qendrim@gmail.com" })

    if (!currentUser) {
      console.log("❌ User qendrim@gmail.com not found. Please make sure you're registered.")
      return
    }

    console.log(`📋 Found user: ${currentUser.email} (ID: ${currentUser._id})`)

    // Find the test user
    const testUser = await db.collection("users").findOne({ email: "test@gmail.com" })

    if (!testUser) {
      console.log("❌ Test user not found.")
      return
    }

    // Transfer transactions from test user to current user
    const txResult = await db
      .collection("transactions")
      .updateMany({ userId: testUser._id }, { $set: { userId: currentUser._id } })

    console.log(`✅ Transferred ${txResult.modifiedCount} transactions`)

    // Transfer budgets from test user to current user
    const budgetResult = await db
      .collection("budgets")
      .updateMany({ userId: testUser._id }, { $set: { userId: currentUser._id } })

    console.log(`✅ Transferred ${budgetResult.modifiedCount} budgets`)

    // Show summary of transferred data
    const totalTransactions = await db.collection("transactions").countDocuments({ userId: currentUser._id })
    const totalBudgets = await db.collection("budgets").countDocuments({ userId: currentUser._id })

    console.log(`📊 Total data for ${currentUser.email}:`)
    console.log(`   - Transactions: ${totalTransactions}`)
    console.log(`   - Budgets: ${totalBudgets}`)

    console.log("🎉 Transfer completed! Refresh your dashboard to see the data.")
  } catch (error) {
    console.error("❌ Transfer failed:", error)
  } finally {
    if (client) {
      await client.close()
    }
  }
}

transferToCurrentUser()
