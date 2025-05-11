const AuthService = require("../services/auth.service")

const AuthController = {
  async register(req, res, next) {
    try {
      console.log("Nhận yêu cầu đăng ký:", {
        email: req.body.email,
        name: req.body.name,
      })

      const userData = req.body

      // Kiểm tra dữ liệu đầu vào
      if (!userData.email || !userData.password) {
        return res.status(400).json({
          success: false,
          message: "Email và mật khẩu là bắt buộc",
        })
      }

      const result = await AuthService.register(userData)
      console.log("Đăng ký thành công, ID người dùng:", result.user._id)

      res.status(201).json({
        success: true,
        message: "Đăng ký người dùng thành công",
        data: result,
      })
    } catch (error) {
      console.error("Lỗi khi đăng ký:", error)

      // Trả về lỗi chi tiết hơn
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Lỗi server khi đăng ký",
        error: process.env.NODE_ENV === "development" ? error.stack : undefined,
      })
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
