const StatsService = require("../services/stats.service")

const StatsController = {
  async getRevenueStats(req, res, next) {
    try {
      const { startDate, endDate } = req.query

      const stats = await StatsService.getRevenueStats(startDate, endDate)

      res.status(200).json({
        success: true,
        message: "Revenue statistics retrieved successfully",
        data: stats,
      })
    } catch (error) {
      next(error)
    }
  },

  async getRevenueTimeline(req, res, next) {
    try {
      const { period = "monthly", year, month } = req.query

      const timeline = await StatsService.getRevenueTimeline(period, year, month)

      res.status(200).json({
        success: true,
        message: "Revenue timeline retrieved successfully",
        data: timeline,
      })
    } catch (error) {
      next(error)
    }
  },

  async getTopSellingBooks(req, res, next) {
    try {
      const { limit = 10, startDate, endDate } = req.query

      const books = await StatsService.getTopSellingBooks(Number.parseInt(limit), startDate, endDate)

      res.status(200).json({
        success: true,
        message: "Top selling books retrieved successfully",
        data: books,
      })
    } catch (error) {
      next(error)
    }
  },

  async getUserStats(req, res, next) {
    try {
      const stats = await StatsService.getUserStats()

      res.status(200).json({
        success: true,
        message: "User statistics retrieved successfully",
        data: stats,
      })
    } catch (error) {
      next(error)
    }
  },
}

module.exports = StatsController
