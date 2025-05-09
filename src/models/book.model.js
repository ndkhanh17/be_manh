const { getDb } = require("../config/database")
const { ObjectId } = require("mongodb")

const COLLECTION = "books"

const BookModel = {
  async findById(id) {
    const db = getDb()
    return db.collection(COLLECTION).findOne({ _id: new ObjectId(id) })
  },

  async create(bookData) {
    const db = getDb()

    bookData.createdAt = new Date()
    bookData.stock = bookData.stock || 0
    bookData.sold = bookData.sold || 0

    const result = await db.collection(COLLECTION).insertOne(bookData)
    return { ...bookData, _id: result.insertedId }
  },

  async update(id, updateData) {
    const db = getDb()

    updateData.updatedAt = new Date()

    await db.collection(COLLECTION).updateOne({ _id: new ObjectId(id) }, { $set: updateData })

    return this.findById(id)
  },

  async delete(id) {
    const db = getDb()
    return db.collection(COLLECTION).deleteOne({ _id: new ObjectId(id) })
  },

  async getAll(query = {}, options = {}) {
    const db = getDb()
    const { limit = 10, skip = 0, sort = { createdAt: -1 } } = options

    return db.collection(COLLECTION).find(query).sort(sort).skip(skip).limit(limit).toArray()
  },

  async search(searchTerm, options = {}) {
    const db = getDb()
    const { limit = 10, skip = 0 } = options

    return db
      .collection(COLLECTION)
      .find({
        $or: [
          { title: { $regex: searchTerm, $options: "i" } },
          { author: { $regex: searchTerm, $options: "i" } },
          { description: { $regex: searchTerm, $options: "i" } },
        ],
      })
      .skip(skip)
      .limit(limit)
      .toArray()
  },

  async getByCategory(category, options = {}) {
    const db = getDb()
    const { limit = 10, skip = 0 } = options

    return db.collection(COLLECTION).find({ category }).skip(skip).limit(limit).toArray()
  },

  async getBestSellers(limit = 5) {
    const db = getDb()

    return db.collection(COLLECTION).find().sort({ sold: -1 }).limit(limit).toArray()
  },

  async getNewArrivals(limit = 5) {
    const db = getDb()

    return db.collection(COLLECTION).find().sort({ createdAt: -1 }).limit(limit).toArray()
  },

  async updateStock(id, quantity) {
    const db = getDb()

    return db.collection(COLLECTION).updateOne(
      { _id: new ObjectId(id) },
      {
        $inc: {
          stock: -quantity,
          sold: quantity,
        },
        $set: { updatedAt: new Date() },
      },
    )
  },
}

module.exports = BookModel
