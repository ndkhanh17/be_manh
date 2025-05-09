const { getDb } = require("../config/database")
const { ObjectId } = require("mongodb")

const COLLECTION = "orders"

const OrderModel = {
  async findById(id) {
    const db = getDb()
    return db.collection(COLLECTION).findOne({ _id: new ObjectId(id) })
  },

  async create(orderData) {
    const db = getDb()

    orderData.createdAt = new Date()
    orderData.status = orderData.status || "pending"

    // Calculate totals if not provided
    if (!orderData.subtotal) {
      orderData.subtotal = orderData.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    }

    if (!orderData.total) {
      orderData.total = orderData.subtotal + (orderData.shippingFee || 0) - (orderData.discount || 0)
    }

    const result = await db.collection(COLLECTION).insertOne(orderData)
    return { ...orderData, _id: result.insertedId }
  },

  async update(id, updateData) {
    const db = getDb()

    updateData.updatedAt = new Date()

    await db.collection(COLLECTION).updateOne({ _id: new ObjectId(id) }, { $set: updateData })

    return this.findById(id)
  },

  async updateStatus(id, status) {
    const db = getDb()

    await db.collection(COLLECTION).updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          status,
          updatedAt: new Date(),
        },
      },
    )

    return this.findById(id)
  },

  async getByUser(userId, options = {}) {
    const db = getDb()
    const { limit = 10, skip = 0, sort = { createdAt: -1 } } = options

    return db
      .collection(COLLECTION)
      .find({ "customerInfo.userId": userId })
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .toArray()
  },

  async getAll(query = {}, options = {}) {
    const db = getDb()
    const { limit = 10, skip = 0, sort = { createdAt: -1 } } = options

    return db.collection(COLLECTION).find(query).sort(sort).skip(skip).limit(limit).toArray()
  },

  async getOrderStats() {
    const db = getDb()

    const stats = await db
      .collection(COLLECTION)
      .aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
            totalAmount: { $sum: "$total" },
          },
        },
      ])
      .toArray()

    return stats
  },

  async getRecentOrders(limit = 5) {
    const db = getDb()

    return db.collection(COLLECTION).find().sort({ createdAt: -1 }).limit(limit).toArray()
  },
}

module.exports = OrderModel
