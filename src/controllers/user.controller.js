const UserService = require("../services/user.service")

const UserController = {
  async getAllUsers(req, res, next) {
    try {
      const { page = 1, limit = 10 } = req.query

      const options = {
        skip: (Number.parseInt(page) - 1) * Number.parseInt(limit),
        limit: Number.parseInt(limit),
      }

      const users = await UserService.getAllUsers({}, options)

      res.status(200).json({
        success: true,
        count: users.length,
        data: users,
      })
    } catch (error) {
      next(error)
    }
  },

  async getUserById(req, res, next) {
    try {
      const { id } = req.params

      // Check if user is authorized to view this user
      if (req.user.role !== "admin" && req.user.id !== id) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to view this user",
        })
      }

      const user = await UserService.getUserById(id)

      res.status(200).json({
        success: true,
        data: user,
      })
    } catch (error) {
      next(error)
    }
  },

  async updateUser(req, res, next) {
    try {
      const { id } = req.params
      const updateData = req.body

      // Check if user is authorized to update this user
      if (req.user.role !== "admin" && req.user.id !== id) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to update this user",
        })
      }

      const user = await UserService.updateUser(id, updateData)

      res.status(200).json({
        success: true,
        message: "User updated successfully",
        data: user,
      })
    } catch (error) {
      next(error)
    }
  },

  async updateUserRole(req, res, next) {
    try {
      const { id } = req.params
      const { role } = req.body

      const user = await UserService.updateUserRole(id, role)

      res.status(200).json({
        success: true,
        message: "User role updated successfully",
        data: user,
      })
    } catch (error) {
      next(error)
    }
  },

  async getCurrentUser(req, res, next) {
    try {
      const user = await UserService.getUserById(req.user.id)

      res.status(200).json({
        success: true,
        data: user,
      })
    } catch (error) {
      next(error)
    }
  },
}

module.exports = UserController
