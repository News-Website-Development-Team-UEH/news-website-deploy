const { adminArticleController, userController } = require("../controllers");
const { sendResponse } = require("../utils/response");
const { verifyToken, isAuthor } = require("../middlewares/authMiddleware");
const articleController = require("../controllers/articleController");

const handleAuthorRoutes = async (req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const path = parsedUrl.pathname;
  const method = req.method;

  try {
    // Lấy bài viết theo authorId
    const authorArticlesMatch = path.match(/^\/author\/(\d+)\/articles$/);
    if (authorArticlesMatch && method === "GET") {
      req.params = { authorId: authorArticlesMatch[1] };
      return await articleController.getByAuthor(req, res);
    }

    const tokenOk = await verifyToken(req);
    if (!tokenOk)
      return sendResponse(res, 401, { error: "Token không hợp lệ hoặc thiếu." });

    const isOk = await isAuthor(req);
    if (!isOk)
      return sendResponse(res, 403, { error: "Chỉ Author hoặc Admin mới có quyền." });

    // Tạo bài viết mới
    if (method === "POST" && path === "/author/articles") {
      req.body.author_id = req.user.id;
      return await adminArticleController.create(req, res);
    }

    // Cập nhật bài viết
    const articleIdMatch = path.match(/^\/author\/articles\/(\d+)$/);
    if (articleIdMatch && method === "PUT") {
      req.params = { id: articleIdMatch[1] };
      return await adminArticleController.update(req, res);
    }

    // Lấy bài viết theo ID
    if (articleIdMatch && method === "GET") {
      req.params = { id: articleIdMatch[1] };
      return await adminArticleController.getById(req, res);
    }

    // Xoá bài viết
    if (articleIdMatch && method === "DELETE") {
      req.params = { id: articleIdMatch[1] };
      return await adminArticleController.delete(req, res);
    }

    // Lấy bài viết của chính author đăng nhập
    if (method === "GET" && path === "/me/articles") {
      req.params = { authorId: req.user.id };
      return await articleController.getByAuthor(req, res);
    }

    // Quản lý danh mục theo dõi
    if (method === "GET" && path === "/author/followed-categories") {
      return await userController.getFollowedCategories(req, res);
    }

    if (method === "POST" && path === "/author/follow-category") {
      return await userController.followCategory(req, res);
    }

    if (method === "POST" && path === "/author/unfollow-category") {
      return await userController.unfollowCategory(req, res);
    }

    return false;
  } catch (err) {
    console.error("Lỗi định tuyến author:", err);
    return sendResponse(res, 500, { error: "Internal Server Error" });
  }
};

module.exports = handleAuthorRoutes;
