const { MongoClient } = require("mongodb")

let db = null

const connectToDatabase = async () => {
  try {
    const client = new MongoClient(process.env.MONGODB_URI)
    await client.connect()

    db = client.db()
    console.log("Connected to MongoDB successfully")

    return db
  } catch (error) {
    console.error("MongoDB connection error:", error)
    process.exit(1)
  }
}

const getDb = () => {
  if (!db) {
    throw new Error("Database not initialized")
  }
  return db
}

module.exports = {
  connectToDatabase,
  getDb,
}
