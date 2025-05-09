const CategoryModel = require("../models/category.model")
const BookModel = require("../models/book.model")

const CategoryService = {
  async getAllCategories() {
    return CategoryModel.getAll()
  },

  async getCategoryById(id) {
    const category = await CategoryModel.findById(id)
    if (!category) {
      throw new Error("Category not found")
    }
    return category
  },

  async createCategory(categoryData) {
    // Check if category already exists
    const existingCategory = await CategoryModel.findByName(categoryData.name)
    if (existingCategory) {
      throw new Error("Category already exists with this name")
    }

    return CategoryModel.create(categoryData)
  },

  async updateCategory(id, updateData) {
    // Check if category exists
    const category = await CategoryModel.findById(id)
    if (!category) {
      throw new Error("Category not found")
    }

    // Check if name is being updated and if it already exists
    if (updateData.name && updateData.name !== category.name) {
      const existingCategory = await CategoryModel.findByName(updateData.name)
      if (existingCategory) {
        throw new Error("Category already exists with this name")
      }
    }

    return CategoryModel.update(id, updateData)
  },

  async deleteCategory(id) {
    // Check if category exists
    const category = await CategoryModel.findById(id)
    if (!category) {
      throw new Error("Category not found")
    }

    // Check if category is being used by any books
    const books = await BookModel.getByCategory(category.name, { limit: 1 })
    if (books.length > 0) {
      throw new Error("Cannot delete category that is being used by books")
    }

    return CategoryModel.delete(id)
  },
}

module.exports = CategoryService
