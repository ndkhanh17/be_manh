const AuthService = require("../services/auth.service")

const AuthController = {
  async register(req, res, next) {
    try {
      const userData = req.body
      const result = await AuthService.register(userData)

      res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: result,
      })
    } catch (error) {
      next(error)
    }
  },

  async login(req, res, next) {
    try {
      const { email, password } = req.body
      const result = await AuthService.login(email, password)

      res.status(200).json({
        success: true,
        message: "Login successful",
        data: result,
      })
    } catch (error) {
      next(error)
    }
  },
}

module.exports = AuthController
