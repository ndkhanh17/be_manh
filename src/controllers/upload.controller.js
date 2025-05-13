const fs = require("fs")
const path = require("path")

const UploadController = {
  async uploadImage(req, res, next) {
    try {
      console.log("Upload request received", {
        user: req.user ? `${req.user.email} (${req.user.role})` : "No user",
        files: req.file ? "File present" : "No file",
      })

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Không có file nào được upload",
        })
      }

      // Đảm bảo thư mục uploads tồn tại
      const uploadsDir = path.join(__dirname, "../uploads")
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true })
      }

      // Tạo URL cho file đã upload
      const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`

      res.status(200).json({
        success: true,
        message: "Upload ảnh thành công",
        data: {
          filename: req.file.filename,
          originalname: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size,
          url: fileUrl,
        },
      })
    } catch (error) {
      console.error("Error in uploadImage:", error)
      next(error)
    }
  },

  async uploadMultipleImages(req, res, next) {
    try {
      console.log("Multiple upload request received", {
        user: req.user ? `${req.user.email} (${req.user.role})` : "No user",
        files: req.files ? `${req.files.length} files present` : "No files",
      })

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Không có file nào được upload",
        })
      }

      // Đảm bảo thư mục uploads tồn tại
      const uploadsDir = path.join(__dirname, "../uploads")
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true })
      }

      // Tạo URL cho các file đã upload
      const filesData = req.files.map((file) => {
        return {
          filename: file.filename,
          originalname: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          url: `${req.protocol}://${req.get("host")}/uploads/${file.filename}`,
        }
      })

      res.status(200).json({
        success: true,
        message: "Upload nhiều ảnh thành công",
        data: filesData,
      })
    } catch (error) {
      console.error("Error in uploadMultipleImages:", error)
      next(error)
    }
  },

  async deleteImage(req, res, next) {
    try {
      const { filename } = req.params

      // Kiểm tra tên file có hợp lệ không
      if (!filename || filename.includes("..")) {
        return res.status(400).json({
          success: false,
          message: "Tên file không hợp lệ",
        })
      }

      const filePath = path.join(__dirname, "../uploads", filename)

      // Kiểm tra file có tồn tại không
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({
          success: false,
          message: "File không tồn tại",
        })
      }

      // Xóa file
      fs.unlinkSync(filePath)

      res.status(200).json({
        success: true,
        message: "Xóa ảnh thành công",
      })
    } catch (error) {
      console.error("Error in deleteImage:", error)
      next(error)
    }
  },
}

module.exports = UploadController
