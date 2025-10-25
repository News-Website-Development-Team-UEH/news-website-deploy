const ControllerBase = require("./ControllerBase");
const User = require("../models/User");

class UserController extends ControllerBase {
  // Lấy thông tin hồ sơ của người dùng đã đăng nhập.
  async getProfile(req, res) {
    try {
      const userId = req.user.id;
      const user = await User.findById(userId, { excludePassword: true });

      if (!user) {
        return this.sendResponse(res, 404, {
          message: "Không tìm thấy người dùng",
        });
      }

      return this.sendResponse(res, 200, { user });
    } catch (error) {
      if (!res.headersSent) {
        return this.handleError(res, error);
      }
    }
  }

  // Cập nhật thông tin hồ sơ của người dùng đã đăng nhập.
  async updateProfile(req, res) {
    try {
      const userId = req.user.id;
      const { username, email, fullName, currentPassword, newPassword } =
        req.body;

      const user = await User.findById(userId);
      if (!this.checkExists(user, res, "Người dùng")) return true;

      // Đổi mật khẩu (chỉ khi có cả current và new)
      if (newPassword && currentPassword) {
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
          return this.sendResponse(res, 400, {
            error: "Mật khẩu hiện tại không đúng.",
          });
        }
        user.rawPassword = newPassword;
      }

      // Cập nhật thông tin khác
      if (username) user.username = username;
      if (email) user.email = email;
      if (fullName) user.fullName = fullName;

      await user.save();

      return this.sendResponse(res, 200, {
        message: "Cập nhật hồ sơ thành công.",
      });
    } catch (error) {
      console.error("Lỗi updateProfile:", error);

      const statusCode =
        error.message &&
        (error.message.includes("không hợp lệ") ||
          error.message.includes("đã tồn tại"))
          ? 400
          : 500;

      return this.sendResponse(res, statusCode, {
        error: error.message || "Lỗi máy chủ nội bộ.",
      });
    }
  }

  // Lấy danh sách category user đang theo dõi
  async getFollowedCategories(req, res) {
    try {
      const userId = req.user.id;
      const user = await User.findById(userId);
      if (!user)
        return this.sendResponse(res, 404, {
          error: "Người dùng không tồn tại.",
        });

      return this.sendResponse(res, 200, {
        categories: user
          .getFollowedCategories()
          .filter((id) => id != null)
          .map(Number),
      });
    } catch (error) {
      return this.handleError(res, error);
    }
  }

  // Follow category
  async followCategory(req, res) {
    try {
      const userId = req.user.id;
      const { categoryId } = req.body;

      const user = await User.findById(userId);
      if (!user)
        return this.sendResponse(res, 404, {
          error: "Người dùng không tồn tại.",
        });

      const catId = Number(categoryId);
      const followed = user.getFollowedCategories().map(Number);

      if (!followed.includes(catId)) {
        followed.push(catId);
        user.setFollowedCategories(followed);
        await user.save();
      }

      return this.sendResponse(res, 200, {
        message: "Theo dõi danh mục thành công.",
      });
    } catch (error) {
      return this.handleError(res, error);
    }
  }

  // Unfollow category
  async unfollowCategory(req, res) {
    try {
      const userId = req.user.id;
      const { categoryId } = req.body;

      const user = await User.findById(userId);
      if (!user)
        return this.sendResponse(res, 404, {
          error: "Người dùng không tồn tại.",
        });

      let followed = Array.isArray(user.getFollowedCategories())
        ? user.getFollowedCategories()
        : [];
      const catId = Number(categoryId);

      followed = followed.filter((id) => Number(id) !== catId);
      user.setFollowedCategories(followed);
      await user.save();

      return this.sendResponse(res, 200, {
        message: "Bỏ theo dõi danh mục thành công.",
        followedCategories: user.getFollowedCategories(),
      });
    } catch (error) {
      return this.handleError(res, error);
    }
  }
}

module.exports = new UserController();
