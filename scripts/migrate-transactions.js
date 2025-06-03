const { MongoClient } = require("mongodb")

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/Budget-Tracker-&-Financial-Planner"

async function migrateTransactions() {
  let client

  try {
    console.log("🔄 Starting transaction migration...")
    console.log("📡 Connecting to MongoDB...")

    // Create MongoDB client
    client = new MongoClient(MONGODB_URI)
    await client.connect()

    const db = client.db()
    const collection = db.collection("transactions")

    // Check current count
    const totalCount = await collection.countDocuments()
    console.log(`📊 Found ${totalCount} transactions to migrate`)

    if (totalCount === 0) {
      console.log("ℹ️  No transactions found to migrate")
      return
    }

    // Show sample before migration
    const sampleBefore = await collection.findOne()
    console.log("📋 Sample transaction before migration:", JSON.stringify(sampleBefore, null, 2))

    // Perform migration
    console.log("🔄 Updating transaction structure...")

    const updateResult = await collection.updateMany({}, [
      {
        $set: {
          recurring: {
            isRecurring: { $ifNull: ["$isRecurring", false] },
          },
          tags: { $ifNull: ["$tags", []] },
          createdAt: { $ifNull: ["$createdAt", new Date()] },
          updatedAt: { $ifNull: ["$updatedAt", new Date()] },
        },
      },
    ])

    console.log(`✅ Updated ${updateResult.modifiedCount} transactions`)

    // Remove old isRecurring field if it exists
    const unsetResult = await collection.updateMany({ isRecurring: { $exists: true } }, { $unset: { isRecurring: "" } })

    console.log(`🗑️  Removed old isRecurring field from ${unsetResult.modifiedCount} transactions`)

    // Show sample after migration
    const sampleAfter = await collection.findOne()
    console.log("📋 Sample transaction after migration:", JSON.stringify(sampleAfter, null, 2))

    console.log("🎉 Migration completed successfully!")
  } catch (error) {
    console.error("❌ Migration failed:", error)
    process.exit(1)
  } finally {
    if (client) {
      await client.close()
      console.log("📡 Database connection closed")
    }
  }
}

// Run migration
migrateTransactions()
