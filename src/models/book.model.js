const { getDb } = require("../config/database")
const { ObjectId } = require("mongodb")

const BookModel = {
  async findById(id) {
    const db = getDb()
    return db.collection("books").findOne({ _id: new ObjectId(id) })
  },

  async create(bookData) {
    const db = getDb()

    // Add timestamps
    bookData.createdAt = new Date()
    bookData.updatedAt = new Date()

    // Convert category to ObjectId if it's a string
    if (bookData.category && typeof bookData.category === "string") {
      bookData.category = new ObjectId(bookData.category)
    }

    const result = await db.collection("books").insertOne(bookData)
    return this.findById(result.insertedId)
  },

  async update(id, updateData) {
    const db = getDb()

    // Update timestamp
    updateData.updatedAt = new Date()

    // Convert category to ObjectId if it's a string
    if (updateData.category && typeof updateData.category === "string") {
      updateData.category = new ObjectId(updateData.category)
    }

    await db.collection("books").updateOne({ _id: new ObjectId(id) }, { $set: updateData })

    return this.findById(id)
  },

  async getAll(query = {}, options = {}) {
    const db = getDb()
    const { skip = 0, limit = 20, sort = { createdAt: -1 } } = options

    // Handle text search
    if (query.search) {
      query.$text = { $search: query.search }
      delete query.search
    }

    // Handle category filter
    if (query.category) {
      query.category = new ObjectId(query.category)
    }

    // Handle price range
    if (query.minPrice || query.maxPrice) {
      query.price = {}
      if (query.minPrice) {
        query.price.$gte = Number.parseFloat(query.minPrice)
        delete query.minPrice
      }
      if (query.maxPrice) {
        query.price.$lte = Number.parseFloat(query.maxPrice)
        delete query.maxPrice
      }
    }

    const total = await db.collection("books").countDocuments(query)

    const books = await db.collection("books").find(query).sort(sort).skip(skip).limit(limit).toArray()

    return {
      books,
      total,
      page: Math.floor(skip / limit) + 1,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  },

  async delete(id) {
    const db = getDb()
    return db.collection("books").deleteOne({ _id: new ObjectId(id) })
  },

  async getBestsellers(limit = 10) {
    const db = getDb()
    return db.collection("books").find({ isBestseller: true }).sort({ soldCount: -1 }).limit(limit).toArray()
  },

  async getNewArrivals(limit = 10) {
    const db = getDb()
    return db.collection("books").find().sort({ createdAt: -1 }).limit(limit).toArray()
  },

  async updateStock(id, quantity) {
    const db = getDb()
    return db.collection("books").updateOne(
      { _id: new ObjectId(id) },
      {
        $inc: {
          stock: -quantity,
          soldCount: quantity,
        },
        $set: { updatedAt: new Date() },
      },
    )
  },

  async searchBooks(params = {}) {
    const db = getDb()
    const {
      name = "",
      category = "",
      minPrice = 0,
      maxPrice = Number.MAX_SAFE_INTEGER,
      page = 1,
      limit = 10,
      sort = { createdAt: -1 },
    } = params

    const query = {}

    // Tìm kiếm theo tên (title)
    if (name && name.trim() !== "") {
      query.title = { $regex: name, $options: "i" }
    }

    // Tìm kiếm theo danh mục
    if (category && category.trim() !== "") {
      try {
        if (ObjectId.isValid(category)) {
          query.category = new ObjectId(category)
        } else {
          query.category = category
        }
      } catch (error) {
        console.error("Lỗi khi xử lý ID danh mục:", error)
      }
    }

    // Tìm kiếm theo khoảng giá
    if (minPrice > 0 || maxPrice < Number.MAX_SAFE_INTEGER) {
      query.price = {}

      if (minPrice > 0) {
        query.price.$gte = Number(minPrice)
      }

      if (maxPrice < Number.MAX_SAFE_INTEGER) {
        query.price.$lte = Number(maxPrice)
      }
    }

    // Tính toán skip cho phân trang
    const skip = (Number(page) - 1) * Number(limit)

    // Đếm tổng số kết quả
    const total = await db.collection("books").countDocuments(query)

    // Lấy dữ liệu với phân trang và sắp xếp
    const books = await db.collection("books").find(query).sort(sort).skip(skip).limit(Number(limit)).toArray()

    return {
      books,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
    }
  },
}

module.exports = BookModel
