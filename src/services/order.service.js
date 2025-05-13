const OrderModel = require("../models/order.model")
const BookModel = require("../models/book.model")
const UserModel = require("../models/user.model")
const { getDb } = require("../config/database")

const OrderService = {
  async createOrder(orderData) {
    // Validate user if userId is provided
    if (orderData.customerInfo && orderData.customerInfo.userId) {
      const user = await UserModel.findById(orderData.customerInfo.userId)
      if (!user) {
        throw new Error("User not found")
      }
    }

    // Check stock for each book and update stock
    for (const item of orderData.items) {
      const book = await BookModel.findById(item.id)
      if (!book) {
        throw new Error(`Book with ID ${item.id} not found`)
      }

      if (book.stock < item.quantity) {
        throw new Error(`Not enough stock for book: ${book.title}`)
      }

      // Update book stock
      await BookModel.updateStock(item.id, item.quantity)
    }

    // Create order
    return OrderModel.create(orderData)
  },

  async getOrderById(id) {
    const order = await OrderModel.findById(id)
    if (!order) {
      throw new Error("Order not found")
    }
    return order
  },

  async updateOrderStatus(id, status) {
    // Validate status
    const validStatuses = ["pending", "processing", "completed", "cancelled"]
    if (!validStatuses.includes(status)) {
      throw new Error("Invalid order status")
    }

    // Check if order exists
    const order = await OrderModel.findById(id)
    if (!order) {
      throw new Error("Order not found")
    }

    // If cancelling an order that was not cancelled before, restore stock
    if (status === "cancelled" && order.status !== "cancelled") {
      for (const item of order.items) {
        await BookModel.updateStock(item.id, -item.quantity) // Negative to add back to stock
      }
    }

    return OrderModel.updateStatus(id, status)
  },

  async getUserOrders(userId, options = {}) {
    // Validate user
    const user = await UserModel.findById(userId)
    if (!user) {
      throw new Error("User not found")
    }

    return OrderModel.getByUser(userId, options)
  },

  async getAllOrders(query = {}, options = {}) {
    return OrderModel.getAll(query, options)
  },

  async getOrderStats() {
    return OrderModel.getOrderStats()
  },

  async getRecentOrders(limit = 5) {
    return OrderModel.getRecentOrders(limit)
  },

  // Thêm phương thức lấy lịch sử đơn hàng chi tiết
  async getOrderHistory(userId, options = {}) {
    // Validate user
    const user = await UserModel.findById(userId)
    if (!user) {
      throw new Error("User not found")
    }

    const { page = 1, limit = 10, sort = { createdAt: -1 }, status, startDate, endDate } = options
    const skip = (page - 1) * limit

    // Xây dựng query
    const query = { "customerInfo.userId": userId }

    // Lọc theo trạng thái nếu có
    if (status) {
      query.status = status
    }

    // Lọc theo khoảng thời gian
    if (startDate || endDate) {
      query.createdAt = {}

      if (startDate) {
        query.createdAt.$gte = new Date(startDate)
      }

      if (endDate) {
        query.createdAt.$lte = new Date(endDate)
      }
    }

    const db = getDb()

    // Đếm tổng số đơn hàng
    const total = await db.collection("orders").countDocuments(query)

    // Lấy danh sách đơn hàng
    const orders = await db.collection("orders").find(query).sort(sort).skip(skip).limit(limit).toArray()

    return {
      orders,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  },
}

module.exports = OrderService
