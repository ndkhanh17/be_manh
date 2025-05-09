const { getDb } = require("../config/database")
const { ObjectId } = require("mongodb")

const COLLECTION = "categories"

const CategoryModel = {
  async findById(id) {
    const db = getDb()
    return db.collection(COLLECTION).findOne({ _id: new ObjectId(id) })
  },

  async findByName(name) {
    const db = getDb()
    return db.collection(COLLECTION).findOne({ name })
  },

  async create(categoryData) {
    const db = getDb()

    categoryData.createdAt = new Date()

    const result = await db.collection(COLLECTION).insertOne(categoryData)
    return { ...categoryData, _id: result.insertedId }
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

  async getAll() {
    const db = getDb()
    return db.collection(COLLECTION).find().toArray()
  },
}

module.exports = CategoryModel
