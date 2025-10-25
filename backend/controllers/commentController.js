const Comment = require("../models/Comment");
const { sendResponse } = require("../utils/response");
const ControllerBase = require('./ControllerBase');

class CommentController extends ControllerBase {
  // Tạo bình luận mới
  async create(req, res) {
    try {
      const { articleId, content } = req.body;

      if (!articleId || !content)
        return this.sendResponse(res, 400, { error: "Thiếu thông tin bình luận." });

      const userId = req.user?.id || null;

      const comment = new Comment({
        article_id: parseInt(articleId),
        user_id: userId,
        content,
      });

      await comment.save();

      const msg =
        comment.status === "approved"
          ? "Bình luận đã được phê duyệt."
          : "Bình luận đang chờ phê duyệt.";

      this.sendResponse(res, 201, {
        message: msg,
        data: {
          id: comment.id,
          article_id: comment.article_id,
          user_id: userId,
          status: comment.status,
        },
      });
    } catch (err) {
      this.handleError(res, err);
    }
  }

  // Lấy bình luận đã phê duyệt theo bài viết
  async getApprovedByArticle(req, res) {
    try {
      const { articleId } = req.params;
      const comments = await Comment.findApprovedByArticle(articleId);
      this.sendResponse(res, 200, { data: comments });
    } catch (err) {
      this.handleError(res, err);
    }
  }
}

module.exports = new CommentController();
