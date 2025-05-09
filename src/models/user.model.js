const { getDb } = require("../config/database")
const { ObjectId } = require("mongodb")
const bcrypt = require("bcryptjs")

const COLLECTION = "users"

const UserModel = {
  async findById(id) {
    const db = getDb()
    return db.collection(COLLECTION).findOne({ _id: new ObjectId(id) })
  },

  async findByEmail(email) {
    const db = getDb()
    return db.collection(COLLECTION).findOne({ email })
  },

  async create(userData) {
    const db = getDb()

    // Hash password
    const salt = await bcrypt.genSalt(10)
    userData.password = await bcrypt.hash(userData.password, salt)

    // Set default role and creation date
    userData.role = userData.role || "customer"
    userData.createdAt = new Date()

    const result = await db.collection(COLLECTION).insertOne(userData)
    return { ...userData, _id: result.insertedId }
  },

  async update(id, updateData) {
    const db = getDb()

    // Don't allow role updates through this method for security
    delete updateData.role

    // If updating password, hash it
    if (updateData.password) {
      const salt = await bcrypt.genSalt(10)
      updateData.password = await bcrypt.hash(updateData.password, salt)
    }

    updateData.updatedAt = new Date()

    await db.collection(COLLECTION).updateOne({ _id: new ObjectId(id) }, { $set: updateData })

    return this.findById(id)
  },

  async comparePassword(password, hashedPassword) {
    return bcrypt.compare(password, hashedPassword)
  },

  async getAll(query = {}, options = {}) {
    const db = getDb()
    const { limit = 10, skip = 0, sort = { createdAt: -1 } } = options

    return db.collection(COLLECTION).find(query).sort(sort).skip(skip).limit(limit).toArray()
  },
}

module.exports = UserModel
