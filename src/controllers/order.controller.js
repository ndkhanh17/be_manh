const OrderService = require("../services/order.service")

const OrderController = {
  async createOrder(req, res, next) {
    try {
      const orderData = req.body

      // If user is authenticated, add userId to customerInfo
      if (req.user) {
        orderData.customerInfo = {
          ...orderData.customerInfo,
          userId: req.user.id,
        }
      }

      const order = await OrderService.createOrder(orderData)

      res.status(201).json({
        success: true,
        message: "Order created successfully",
        data: order,
      })
    } catch (error) {
      next(error)
    }
  },

  async getOrderById(req, res, next) {
    try {
      const { id } = req.params
      const order = await OrderService.getOrderById(id)

      // Check if user is authorized to view this order
      if (
        req.user.role !== "admin" &&
        (!order.customerInfo.userId || order.customerInfo.userId.toString() !== req.user.id)
      ) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to view this order",
        })
      }

      res.status(200).json({
        success: true,
        data: order,
      })
    } catch (error) {
      next(error)
    }
  },

  async updateOrderStatus(req, res, next) {
    try {
      const { id } = req.params
      const { status } = req.body

      const order = await OrderService.updateOrderStatus(id, status)

      res.status(200).json({
        success: true,
        message: "Order status updated successfully",
        data: order,
      })
    } catch (error) {
      next(error)
    }
  },

  async getUserOrders(req, res, next) {
    try {
      const { page = 1, limit = 10 } = req.query

      const options = {
        skip: (Number.parseInt(page) - 1) * Number.parseInt(limit),
        limit: Number.parseInt(limit),
      }

      const orders = await OrderService.getUserOrders(req.user.id, options)

      res.status(200).json({
        success: true,
        count: orders.length,
        data: orders,
      })
    } catch (error) {
      next(error)
    }
  },

  async getAllOrders(req, res, next) {
    try {
      const { page = 1, limit = 10, status } = req.query

      const query = {}
      if (status) {
        query.status = status
      }

      const options = {
        skip: (Number.parseInt(page) - 1) * Number.parseInt(limit),
        limit: Number.parseInt(limit),
      }

      const orders = await OrderService.getAllOrders(query, options)

      res.status(200).json({
        success: true,
        count: orders.length,
        data: orders,
      })
    } catch (error) {
      next(error)
    }
  },

  async getOrderStats(req, res, next) {
    try {
      const stats = await OrderService.getOrderStats()

      res.status(200).json({
        success: true,
        data: stats,
      })
    } catch (error) {
      next(error)
    }
  },

  async getRecentOrders(req, res, next) {
    try {
      const { limit = 5 } = req.query
      const orders = await OrderService.getRecentOrders(Number.parseInt(limit))

      res.status(200).json({
        success: true,
        count: orders.length,
        data: orders,
      })
    } catch (error) {
      next(error)
    }
  },
}

module.exports = OrderController
