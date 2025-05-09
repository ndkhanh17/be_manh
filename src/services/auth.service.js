const jwt = require("jsonwebtoken")
const UserModel = require("../models/user.model")

const AuthService = {
  async register(userData) {
    // Check if user already exists
    const existingUser = await UserModel.findByEmail(userData.email)
    if (existingUser) {
      throw new Error("User already exists with this email")
    }

    // Create new user
    const user = await UserModel.create(userData)

    // Generate JWT token
    const token = this.generateToken(user)

    // Remove password from response
    const { password, ...userWithoutPassword } = user

    return {
      user: userWithoutPassword,
      token,
    }
  },

  async login(email, password) {
    // Find user by email
    const user = await UserModel.findByEmail(email)
    if (!user) {
      throw new Error("Invalid credentials")
    }

    // Check password
    const isMatch = await UserModel.comparePassword(password, user.password)
    if (!isMatch) {
      throw new Error("Invalid credentials")
    }

    // Generate JWT token
    const token = this.generateToken(user)

    // Remove password from response
    const { password: pwd, ...userWithoutPassword } = user

    return {
      user: userWithoutPassword,
      token,
    }
  },

  generateToken(user) {
    return jwt.sign({ id: user._id, email: user.email, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    })
  },

  verifyToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET)
    } catch (error) {
      throw new Error("Invalid token")
    }
  },
}

module.exports = AuthService
