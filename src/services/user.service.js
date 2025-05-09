const UserModel = require("../models/user.model")

const UserService = {
  async getAllUsers(query = {}, options = {}) {
    return UserModel.getAll(query, options)
  },

  async getUserById(id) {
    const user = await UserModel.findById(id)
    if (!user) {
      throw new Error("User not found")
    }

    // Remove password from response
    const { password, ...userWithoutPassword } = user
    return userWithoutPassword
  },

  async updateUser(id, updateData) {
    // Check if user exists
    const user = await UserModel.findById(id)
    if (!user) {
      throw new Error("User not found")
    }

    // Check if email is being updated and if it already exists
    if (updateData.email && updateData.email !== user.email) {
      const existingUser = await UserModel.findByEmail(updateData.email)
      if (existingUser) {
        throw new Error("Email already in use")
      }
    }

    const updatedUser = await UserModel.update(id, updateData)

    // Remove password from response
    const { password, ...userWithoutPassword } = updatedUser
    return userWithoutPassword
  },

  async updateUserRole(id, role) {
    // Check if user exists
    const user = await UserModel.findById(id)
    if (!user) {
      throw new Error("User not found")
    }

    // Validate role
    const validRoles = ["customer", "admin"]
    if (!validRoles.includes(role)) {
      throw new Error("Invalid role")
    }

    const updatedUser = await UserModel.update(id, { role })

    // Remove password from response
    const { password, ...userWithoutPassword } = updatedUser
    return userWithoutPassword
  },
}

module.exports = UserService
