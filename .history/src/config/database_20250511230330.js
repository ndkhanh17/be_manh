const { MongoClient, ObjectId } = require("mongodb")
require("dotenv").config()

let db = null
let client = null

const connectToDatabase = async () => {
  try {
    const uri = process.env.MONGODB_URI
    console.log("Đang kết nối đến MongoDB với URI:", uri.replace(/:([^:@]+)@/, ":****@"))

    client = new MongoClient(uri)
    await client.connect()

    // Lấy tên database từ URI hoặc sử dụng mặc định
    const dbName = uri.split("/").pop().split("?")[0] || "ayabook"
    console.log("Sử dụng database:", dbName)

    db = client.db(dbName)
    console.log("Kết nối MongoDB thành công!")

    // Liệt kê các collections để kiểm tra
    const collections = await db.listCollections().toArray()
    console.log("Collections hiện có:", collections.map((c) => c.name).join(", "))

    return db
  } catch (error) {
    console.error("Lỗi kết nối MongoDB:", error)
    process.exit(1)
  }
}

const getDb = () => {
  if (!db) {
    throw new Error("Database chưa được khởi tạo! Hãy gọi connectToDatabase() trước")
  }
  return db
}

const closeConnection = async () => {
  if (client) {
    await client.close()
    console.log("Đã đóng kết nối MongoDB")
  }
}

module.exports = {
  connectToDatabase,
  getDb,
  closeConnection,
  ObjectId,
}
