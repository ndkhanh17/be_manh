const { getDb, ObjectId } = require("../config/database")

const StatsService = {
  async getRevenueStats(startDate, endDate) {
    const db = getDb()

    const matchStage = {}

    // Nếu có ngày bắt đầu và kết thúc, thêm điều kiện lọc
    if (startDate || endDate) {
      matchStage.createdAt = {}

      if (startDate) {
        matchStage.createdAt.$gte = new Date(startDate)
      }

      if (endDate) {
        matchStage.createdAt.$lte = new Date(endDate)
      }
    }

    // Chỉ tính các đơn hàng đã hoàn thành
    matchStage.status = "completed"

    const stats = await db
      .collection("orders")
      .aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: "$total" },
            averageOrderValue: { $avg: "$total" },
            orderCount: { $sum: 1 },
            totalItems: { $sum: { $size: "$items" } },
          },
        },
        {
          $project: {
            _id: 0,
            totalRevenue: 1,
            averageOrderValue: 1,
            orderCount: 1,
            totalItems: 1,
          },
        },
      ])
      .toArray()

    // Nếu không có dữ liệu, trả về giá trị mặc định
    if (stats.length === 0) {
      return {
        totalRevenue: 0,
        averageOrderValue: 0,
        orderCount: 0,
        totalItems: 0,
      }
    }

    return stats[0]
  },

  async getRevenueTimeline(period = "monthly", year, month) {
    const db = getDb()

    let groupStage = {}
    const matchStage = { status: "completed" }

    // Xử lý lọc theo năm và tháng
    if (year) {
      const startDate = new Date(Number.parseInt(year), 0, 1)
      const endDate = new Date(Number.parseInt(year) + 1, 0, 1)

      matchStage.createdAt = {
        $gte: startDate,
        $lt: endDate,
      }
    }

    // Cấu hình nhóm dữ liệu theo khoảng thời gian
    switch (period) {
      case "daily":
        if (year && month) {
          const startDate = new Date(Number.parseInt(year), Number.parseInt(month) - 1, 1)
          const endDate = new Date(Number.parseInt(year), Number.parseInt(month), 0)

          matchStage.createdAt = {
            $gte: startDate,
            $lte: endDate,
          }
        }

        groupStage = {
          _id: { $dayOfMonth: "$createdAt" },
          revenue: { $sum: "$total" },
          orderCount: { $sum: 1 },
        }
        break

      case "monthly":
        groupStage = {
          _id: { $month: "$createdAt" },
          revenue: { $sum: "$total" },
          orderCount: { $sum: 1 },
        }
        break

      case "yearly":
        groupStage = {
          _id: { $year: "$createdAt" },
          revenue: { $sum: "$total" },
          orderCount: { $sum: 1 },
        }
        break

      default:
        groupStage = {
          _id: { $month: "$createdAt" },
          revenue: { $sum: "$total" },
          orderCount: { $sum: 1 },
        }
    }

    const timeline = await db
      .collection("orders")
      .aggregate([
        { $match: matchStage },
        { $group: groupStage },
        { $sort: { _id: 1 } },
        {
          $project: {
            _id: 0,
            period: "$_id",
            revenue: 1,
            orderCount: 1,
          },
        },
      ])
      .toArray()

    return {
      period,
      data: timeline,
    }
  },

  async getTopSellingBooks(limit = 10, startDate, endDate) {
    const db = getDb()

    const matchStage = { status: "completed" }

    // Nếu có ngày bắt đầu và kết thúc, thêm điều kiện lọc
    if (startDate || endDate) {
      matchStage.createdAt = {}

      if (startDate) {
        matchStage.createdAt.$gte = new Date(startDate)
      }

      if (endDate) {
        matchStage.createdAt.$lte = new Date(endDate)
      }
    }

    const topBooks = await db
      .collection("orders")
      .aggregate([
        { $match: matchStage },
        { $unwind: "$items" },
        {
          $group: {
            _id: "$items.id",
            title: { $first: "$items.title" },
            totalSold: { $sum: "$items.quantity" },
            totalRevenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
          },
        },
        { $sort: { totalSold: -1 } },
        { $limit: limit },
        {
          $lookup: {
            from: "books",
            localField: "_id",
            foreignField: "_id",
            as: "bookDetails",
          },
        },
        {
          $project: {
            _id: 1,
            title: 1,
            totalSold: 1,
            totalRevenue: 1,
            author: { $arrayElemAt: ["$bookDetails.author", 0] },
            price: { $arrayElemAt: ["$bookDetails.price", 0] },
            category: { $arrayElemAt: ["$bookDetails.category", 0] },
          },
        },
      ])
      .toArray()

    return topBooks
  },

  async getUserStats() {
    const db = getDb()

    // Thống kê tổng số người dùng
    const totalUsers = await db.collection("users").countDocuments()

    // Thống kê người dùng theo vai trò
    const usersByRole = await db
      .collection("users")
      .aggregate([
        {
          $group: {
            _id: "$role",
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0,
            role: "$_id",
            count: 1,
          },
        },
      ])
      .toArray()

    // Thống kê người dùng mới trong 30 ngày qua
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const newUsers = await db.collection("users").countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
    })

    // Thống kê người dùng có đơn hàng
    const usersWithOrders = await db
      .collection("orders")
      .aggregate([
        {
          $group: {
            _id: "$customerInfo.userId",
            orderCount: { $sum: 1 },
            totalSpent: { $sum: "$total" },
          },
        },
        { $match: { _id: { $ne: null } } },
        { $count: "count" },
      ])
      .toArray()

    return {
      totalUsers,
      usersByRole,
      newUsers,
      usersWithOrders: usersWithOrders.length > 0 ? usersWithOrders[0].count : 0,
    }
  },
}

module.exports = StatsService
