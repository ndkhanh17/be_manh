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
    // Đảm bảo rằng chúng ta đang bao gồm role trong payload
    const payload = {
      id: user._id.toString(),
      email: user.email,
      role: user.role || "customer", // Đảm bảo role luôn có giá trị
    }

    console.log("Token payload:", payload)

    // Đảm bảo JWT_SECRET tồn tại
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not defined in environment variables!")
      throw new Error("Server configuration error")
    }

    return jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || "30d",
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
