const Category = require('../models/Category');
const { sendResponse } = require('../utils/response');
const ControllerBase = require('./ControllerBase');

class AdminCategoryController extends ControllerBase {
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
            const { name } = req.body;
            if (!name) return this.sendResponse(res, 400, { error: 'Tên danh mục không được trống.' });
            const category = new Category({ name });
            await category.save();
            this.sendResponse(res, 201, { message: 'Danh mục đã tạo.', data: category });
        } catch (err) {
            if (err.message.includes('đã tồn tại')) return this.sendResponse(res, 409, { error: 'Tên danh mục đã tồn tại.' });
            this.handleError(res, err);
        }
    }

    // Cập nhật danh mục
    async update(req, res) {
        try {
            const { id } = req.params;
            const { name } = req.body;
            if (!name) return this.sendResponse(res, 400, { error: 'Tên danh mục không được trống.' });
            const category = await Category.findById(id);
            if (!await this.checkExists(category, res, 'Danh mục')) return;
            category.name = name;
            await category.save();
            this.sendResponse(res, 200, { message: 'Danh mục đã cập nhật.', data: category });
        } catch (err) {
            if (err.message.includes('đã tồn tại')) return this.sendResponse(res, 409, { error: 'Tên danh mục đã tồn tại.' });
            this.handleError(res, err);
        }
    }

    // Xóa danh mục
    async delete(req, res) {
        try {
            const { id } = req.params;
            const category = await Category.findById(id);
            if (!await this.checkExists(category, res, 'Danh mục')) return;
            await category.delete();
            this.sendResponse(res, 200, { message: 'Danh mục đã xóa.' });
        } catch (err) { this.handleError(res, err); }
    }
}

module.exports = new AdminCategoryController();