const express = require("express")
const router = express.Router()
const UploadController = require("../controllers/upload.controller")
const authMiddleware = require("../middlewares/auth.middleware")
const multer = require("multer")
const path = require("path")
const fs = require("fs")

// Đảm bảo thư mục uploads tồn tại
const uploadsDir = path.join(__dirname, "../uploads")
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
  console.log("Created uploads directory at:", uploadsDir)
}

// Cấu hình multer để lưu trữ file
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
    const ext = path.extname(file.originalname)
    cb(null, file.fieldname + "-" + uniqueSuffix + ext)
  },
})

// Lọc file - chỉ chấp nhận ảnh
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true)
  } else {
    cb(new Error("Chỉ chấp nhận file ảnh!"), false)
  }
}

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // giới hạn 5MB
  },
  fileFilter: fileFilter,
})

// Middleware để xử lý lỗi multer
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    console.error("Multer error:", err)
    return res.status(400).json({
      success: false,
      message: `Lỗi upload: ${err.message}`,
    })
  } else if (err) {
    console.error("Upload error:", err)
    return res.status(500).json({
      success: false,
      message: `Lỗi server: ${err.message}`,
    })
  }
  next()
}

// Route upload ảnh (yêu cầu đăng nhập)
router.post(
  "/image",
  authMiddleware.authenticate,
  upload.single("image"),
  handleMulterError,
  UploadController.uploadImage,
)

// Route upload nhiều ảnh (yêu cầu đăng nhập)
router.post(
  "/images",
  authMiddleware.authenticate,
  upload.array("images", 5), // tối đa 5 ảnh
  handleMulterError,
  UploadController.uploadMultipleImages,
)

// Route xóa ảnh (yêu cầu quyền admin)
router.delete(
  "/image/:filename",
  authMiddleware.authenticate,
  authMiddleware.authorize("admin"),
  UploadController.deleteImage,
)

module.exports = router
