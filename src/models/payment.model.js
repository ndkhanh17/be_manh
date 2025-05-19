const { getDb, ObjectId } = require("../config/database")

const COLLECTION = "payments"

const PaymentModel = {
  async findById(id) {
    const db = getDb()
    return db.collection(COLLECTION).findOne({ _id: new ObjectId(id) })
  },

  async findByOrderId(orderId) {
    const db = getDb()
    return db.collection(COLLECTION).findOne({ orderId: new ObjectId(orderId) })
  },

  async create(paymentData) {
    const db = getDb()

    // Thêm timestamps
    paymentData.createdAt = new Date()
    paymentData.updatedAt = new Date()

    // Chuyển đổi orderId thành ObjectId nếu là string
    if (paymentData.orderId && typeof paymentData.orderId === "string") {
      paymentData.orderId = new ObjectId(paymentData.orderId)
    }

    const result = await db.collection(COLLECTION).insertOne(paymentData)
    return { ...paymentData, _id: result.insertedId }
  },

  async update(id, updateData) {
    const db = getDb()

    // Cập nhật timestamp
    updateData.updatedAt = new Date()

    await db.collection(COLLECTION).updateOne({ _id: new ObjectId(id) }, { $set: updateData })

    return this.findById(id)
  },

  async getUserPayments(userId, options = {}) {
    const db = getDb()
    const { page = 1, limit = 10, sort = { createdAt: -1 } } = options
    const skip = (page - 1) * limit

    // Đếm tổng số thanh toán
    const total = await db.collection(COLLECTION).countDocuments({ userId: new ObjectId(userId) })

    // Lấy danh sách thanh toán với phân trang
    const payments = await db
      .collection(COLLECTION)
      .find({ userId: new ObjectId(userId) })
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .toArray()

    return {
      payments,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  },
}

module.exports = PaymentModel
