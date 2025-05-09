const AuthService = require("../services/auth.service")

const authMiddleware = {
  authenticate(req, res, next) {
    try {
      // Get token from header
      const authHeader = req.headers.authorization

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
          success: false,
          message: "No token, authorization denied",
        })
      }

      // Verify token
      const token = authHeader.split(" ")[1]
      const decoded = AuthService.verifyToken(token)

      // Add user to request
      req.user = decoded
      next()
    } catch (error) {
      res.status(401).json({
        success: false,
        message: "Token is not valid",
      })
    }
  },

  authorize(...roles) {
    return (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Not authenticated",
        })
      }

      if (!roles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to access this resource",
        })
      }

      next()
    }
  },
}

module.exports = authMiddleware
