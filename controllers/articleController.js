const Article = require("../models/Article");
const { sendResponse } = require("../utils/response");
const ControllerBase = require("./ControllerBase");

class ArticleController extends ControllerBase {
  // Lấy tất cả bài viết (public)
  async getAll(req, res) {
    try {
      const articles = await Article.getAll();
      this.sendResponse(res, 200, { data: articles });
    } catch (err) {
      this.handleError(res, err);
    }
  }

  // Lấy bài viết theo ID (public)
  async getById(req, res) {
    try {
      const { id } = req.params;
      const article = await Article.getById(id);

      if (!(await this.checkExists(article, res, "Article"))) return;

      const related = await Article.getRelatedArticles(
        article.id,
        article.main_category_id
      );

      return this.sendResponse(res, 200, {
        data: { ...article, related_articles: related },
      });
    } catch (err) {
      return this.handleError(res, err);
    }
  }

  // Lấy bài viết theo danh mục (public)
  async getByCategory(req, res) {
    try {
      const { categoryId } = req.params;
      const articles = await Article.getByCategory(categoryId);
      this.sendResponse(res, 200, { data: articles });
    } catch (err) {
      this.handleError(res, err);
    }
  }

  // Tìm kiếm bài viết (public)
  async search(req, res) {
    try {
      const { q } = req.query;
      if (!q)
        return this.sendResponse(res, 400, {
          error: "Thiếu truy vấn tìm kiếm.",
        });
      const articles = await Article.search(q);
      this.sendResponse(res, 200, { data: articles });
    } catch (err) {
      this.handleError(res, err);
    }
  }

  // Lấy tất cả bài viết (public)
  async getLatest(req, res) {
    try {
      const articles = await Article.getLatest();
      this.sendResponse(res, 200, { data: articles });
    } catch (err) {
      this.handleError(res, err);
    }
  }

  // Lấy bài viết nhiều bình luận nhất (public)
  async getTopCommented(req, res) {
    try {
      const limit = parseInt(req.query?.limit, 10) || 5;
      const articles = await Article.getTopCommented(limit);
      this.sendResponse(res, 200, { data: articles });
    } catch (err) {
      this.handleError(res, err);
    }
  }

  // Lấy bài viết ngẫu nhiên (public)
  async getRandom(req, res) {
    try {
      const limit = parseInt(req.query?.limit, 10) || 3;
      const articles = await Article.getRandom(limit);
      this.sendResponse(res, 200, { data: articles });
    } catch (err) {
      this.handleError(res, err);
    }
  }

  // Tạo bài viết mới (author)
  async create(req, res) {
    try {
      const { title, description, content, main_category_id, sub_categories } =
        req.body;
      if (!title || !content || !main_category_id)
        return this.sendResponse(res, 400, {
          error: "Thiếu các trường bắt buộc.",
        });

      const article = await Article.create({
        title,
        description,
        content,
        main_category_id,
        author_id: req.user.id,
        status: "published",
        sub_categories,
      });

      this.sendResponse(res, 201, {
        message: "Bài viết đã được tạo (đang chờ phê duyệt).",
        data: article,
      });
    } catch (err) {
      this.handleError(res, err);
    }
  }

  // Lấy tất cả bài viết của một tác giả
  async getByAuthor(req, res) {
    try {
      const { authorId } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;

      const articles = await Article.getByAuthor(authorId, limit, offset);
      this.sendResponse(res, 200, { data: articles });
    } catch (err) {
      this.handleError(res, err);
    }
  }

  // Lấy tất cả bài viết đã xuất bản của chính tác giả
  async getMyArticles(req, res) {
    try {
      const authorId = req.user.id;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;

      const articles = await Article.getByAuthor(
        authorId,
        limit,
        offset,
        false
      );

      if (!articles) return this.sendResponse(res, 404, { data: [] });

      return this.sendResponse(res, 200, { data: articles });
    } catch (err) {
      return this.handleError(res, err);
    }
  }
}

module.exports = new ArticleController();
