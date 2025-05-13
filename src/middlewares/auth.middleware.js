const jwt = require("jsonwebtoken")

const authMiddleware = {
  authenticate(req, res, next) {
    try {
      // Get token from header
      const authHeader = req.headers.authorization

      console.log("Auth Header:", authHeader) // Debug log

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
          success: false,
          message: "No token, authorization denied",
        })
      }

      // Verify token
      const token = authHeader.split(" ")[1]

      console.log("Token extracted:", token.substring(0, 10) + "...") // Debug log - only show first 10 chars

      if (!token) {
        return res.status(401).json({
          success: false,
          message: "No token found in authorization header",
        })
      }

      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        // Add user to request with proper formatting
        req.user = {
          id: decoded.id,
          email: decoded.email,
          role: decoded.role,
        }

        // Log để debug
        console.log("User authenticated:", {
          id: req.user.id,
          email: req.user.email,
          role: req.user.role,
        })

        next()
      } catch (jwtError) {
        console.error("JWT verification error:", jwtError)
        return res.status(401).json({
          success: false,
          message: "Token is not valid or has expired",
          error: jwtError.message,
        })
      }
    } catch (error) {
      console.error("Authentication error:", error)
      res.status(401).json({
        success: false,
        message: "Token is not valid",
        error: error.message,
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

      // Log để debug
      console.log(`Authorization check: User role: ${req.user.role}, Required roles: ${roles.join(", ")}`)

      if (!roles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: `Not authorized to access this resource. Required roles: ${roles.join(", ")}, Your role: ${req.user.role}`,
        })
      }

      next()
    }
  },
}

module.exports = authMiddleware
