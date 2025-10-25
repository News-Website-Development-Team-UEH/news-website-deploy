const Comment = require("../models/Comment");
const { sendResponse } = require("../utils/response");
const ControllerBase = require('./ControllerBase');

class AdminCommentController extends ControllerBase {
  // Lấy tất cả bình luận chờ duyệt
    async getAll(req, res) {
      try {
          const comments = await Comment.getPendingComments();
          this.sendResponse(res, 200, { data: comments });
      } catch (err) { this.handleError(res, err); }
  }

  // Duyệt bình luận
  async approve(req, res) {
      try {
          const { id } = req.params;
          const comment = await Comment.findById(id);
          if (!await this.checkExists(comment, res, 'Bình luận')) return;
          comment.status = "approved";
          await comment.save();
          this.sendResponse(res, 200, { message: 'Bình luận đã duyệt.', data: comment });
      } catch (err) { this.handleError(res, err); }
  }

  // Từ chối bình luận
  async reject(req, res) {
      try {
          const { id } = req.params;
          const comment = await Comment.findById(id);
          if (!await this.checkExists(comment, res, 'Bình luận')) return;
          comment.status = "rejected";
          await comment.save();
          this.sendResponse(res, 200, { message: 'Bình luận đã từ chối.', data: comment });
      } catch (err) { this.handleError(res, err); }
  }

  delete = this.reject;
}

module.exports = new AdminCommentController();