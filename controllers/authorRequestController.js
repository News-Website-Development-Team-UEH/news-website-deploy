const AuthorRequest = require("../models/AuthorRequest");
const ControllerBase = require("./ControllerBase");
const db = require("../utils/db");

class AuthorRequestController extends ControllerBase {
  // Reader gửi yêu cầu đăng ký làm tác giả
  async applyForAuthor(req, res) {
    try {
      const userId = req.user.id;
      const { reason } = req.body;

      const pending = await AuthorRequest.findPendingByUser(userId);
      if (pending.length > 0) {
        return this.sendResponse(res, 400, {
          error: "Bạn đã gửi yêu cầu và đang chờ duyệt.",
        });
      }

      const request = await AuthorRequest.createRequest(userId, reason);
      this.sendResponse(res, 201, {
        message: "Đã gửi yêu cầu trở thành tác giả.",
        request,
      });
    } catch (err) {
      this.handleError(res, err);
    }
  }

  // Admin xem danh sách tất cả yêu cầu
  async listAll(req, res) {
    try {
      const requests = await AuthorRequest.findAllWithUser();
      this.sendResponse(res, 200, { requests });
    } catch (err) {
      this.handleError(res, err);
    }
  }

  // Admin duyệt hoặc từ chối yêu cầu
  async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!["approved", "rejected"].includes(status)) {
        return this.sendResponse(res, 400, {
          error: "Trạng thái không hợp lệ.",
        });
      }

      const request = await AuthorRequest.findById(id);
      if (!request) {
        return this.sendResponse(res, 404, {
          error: "Không tìm thấy yêu cầu.",
        });
      }

      await AuthorRequest.updateStatus(id, status);

      // Nếu duyệt → đổi role user
      if (status === "approved") {
        await db.query("UPDATE users SET role='author' WHERE id=?", [
          request.user_id,
        ]);
      }

      this.sendResponse(res, 200, { message: `Yêu cầu đã được ${status}.` });
    } catch (err) {
      this.handleError(res, err);
    }
  }

  // Người dùng xem yêu cầu của chính mình
  async getMyAuthorRequest(req, res) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return this.sendResponse(res, 401, {
          success: false,
          message: "Không xác thực được người dùng.",
        });
      }

      const [rows] = await db.query(
        "SELECT * FROM author_requests WHERE user_id = ? ORDER BY created_at DESC LIMIT 1",
        [userId]
      );

      if (!rows || rows.length === 0) {
        return this.sendResponse(res, 404, {
          success: false,
          message: "Bạn chưa gửi yêu cầu trở thành tác giả.",
        });
      }

      this.sendResponse(res, 200, {
        success: true,
        data: rows[0],
      });
    } catch (error) {
      console.error("Error fetching author request:", error);
      this.sendResponse(res, 500, {
        success: false,
        message: "Lỗi server khi lấy yêu cầu của bạn.",
      });
    }
  }
}

module.exports = new AuthorRequestController();
