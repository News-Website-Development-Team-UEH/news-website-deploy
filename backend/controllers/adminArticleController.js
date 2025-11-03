const Article = require("../models/Article");
const ControllerBase = require("./ControllerBase");

class AdminArticleController extends ControllerBase {
  async getAll(req, res) {
    try {
      const articles = await Article.getAll();
      this.sendResponse(res, 200, { data: articles });
    } catch (err) {
      this.handleError(res, err);
    }
  }

  // Tạo mới bài viết
  async create(req, res) {
    try {
      const article = await Article.create({
        ...req.body,
        status: "published",
      });
      this.sendResponse(res, 201, {
        message: "Bài viết đã được tạo và xuất bản.",
        data: article,
      });
    } catch (err) {
      this.handleError(res, err);
    }
  }

  // Lấy chi tiết bài viết theo ID
  async getById(req, res) {
    try {
      const { id } = req.params;
      const article = await Article.findById(id);
      if (!(await this.checkExists(article, res, "Bài viết"))) return;
      this.sendResponse(res, 200, article);
    } catch (err) {
      this.handleError(res, err);
    }
  }

  // Cập nhật bài viết theo ID
  async update(req, res) {
    try {
      const { id } = req.params;
      const article = await Article.findById(id);
      if (!(await this.checkExists(article, res, "Bài viết"))) return;

      const updateData = { ...req.body };
      delete updateData.status;

      Object.assign(article, updateData);
      await article.save();

      this.sendResponse(res, 200, {
        message: "Bài viết đã được cập nhật.",
        data: article,
      });
    } catch (err) {
      this.handleError(res, err);
    }
  }

  // Xóa bài viết theo ID
  async delete(req, res) {
    try {
      const { id } = req.params;
      const article = await Article.findById(id);
      if (!(await this.checkExists(article, res, "Bài viết"))) return;
      await article.delete();
      this.sendResponse(res, 200, { message: "Bài viết đã xóa." });
    } catch (err) {
      this.handleError(res, err);
    }
  }
}

module.exports = new AdminArticleController();
