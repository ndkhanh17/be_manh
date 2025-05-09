const OrderModel = require("../models/order.model")
const BookModel = require("../models/book.model")
const UserModel = require("../models/user.model")

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
}

module.exports = OrderService
