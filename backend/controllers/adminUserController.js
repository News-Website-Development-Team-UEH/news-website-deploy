const User = require('../models/User');
const ControllerBase = require('./ControllerBase');

class AdminUserController extends ControllerBase {
    // Lấy tất cả người dùng
    async getAll(req, res) {
        try {
            const users = await User.findAll();
            this.sendResponse(res, 200, { data: users });
        } catch (err) {
            this.handleError(res, err);
        }
    }

    // Xóa người dùng
    async delete(req, res) {
        try {
            const { id } = req.params;
            const user = await User.findById(id);
            if (!await this.checkExists(user, res, 'Người dùng')) return;
            await user.delete();
            this.sendResponse(res, 200, { message: 'Người dùng đã xóa thành công.' });
        } catch (err) {
            this.handleError(res, err);
        }
    }
}

module.exports = new AdminUserController();
