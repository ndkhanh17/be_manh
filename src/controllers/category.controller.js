const CategoryService = require("../services/category.service")

const CategoryController = {
  async getAllCategories(req, res, next) {
    try {
      const categories = await CategoryService.getAllCategories()

      res.status(200).json({
        success: true,
        count: categories.length,
        data: categories,
      })
    } catch (error) {
      next(error)
    }
  },

  async getCategoryById(req, res, next) {
    try {
      const { id } = req.params
      const category = await CategoryService.getCategoryById(id)

      res.status(200).json({
        success: true,
        data: category,
      })
    } catch (error) {
      next(error)
    }
  },

  async createCategory(req, res, next) {
    try {
      const categoryData = req.body
      const category = await CategoryService.createCategory(categoryData)

      res.status(201).json({
        success: true,
        message: "Category created successfully",
        data: category,
      })
    } catch (error) {
      next(error)
    }
  },

  async updateCategory(req, res, next) {
    try {
      const { id } = req.params
      const updateData = req.body
      const category = await CategoryService.updateCategory(id, updateData)

      res.status(200).json({
        success: true,
        message: "Category updated successfully",
        data: category,
      })
    } catch (error) {
      next(error)
    }
  },

  async deleteCategory(req, res, next) {
    try {
      const { id } = req.params
      await CategoryService.deleteCategory(id)

      res.status(200).json({
        success: true,
        message: "Category deleted successfully",
      })
    } catch (error) {
      next(error)
    }
  },
}

module.exports = CategoryController
