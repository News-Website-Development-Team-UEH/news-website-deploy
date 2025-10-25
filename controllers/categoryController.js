const Category = require('../models/Category');
const { sendResponse } = require('../utils/response');
const ControllerBase = require('./ControllerBase');

class CategoryController extends ControllerBase {
    // Lấy tất cả danh mục
    async getAll(req, res) {
        try {
            const categories = await Category.findAll();
            this.sendResponse(res, 200, { data: categories });
        } catch (err) { this.handleError(res, err); }
    }

    // Tạo danh mục mới
    async create(req, res) {
        try {
            const category = new Category(req.body);
            await category.save();
            this.sendResponse(res, 201, { message: 'Danh mục đã tạo', data: category });
        } catch (err) { this.handleError(res, err); }
    }
}

module.exports = new CategoryController();