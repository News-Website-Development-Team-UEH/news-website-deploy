const {
  articleController,
  authController,
  categoryController,
  commentController,
  aiController,
} = require("../controllers");
const { sendResponse } = require("../utils/response");
const passport = require("passport");
const { verifyToken } = require("../middlewares/authMiddleware");

require("../config/passport");

const handleRoute = async (
  req,
  res,
  controller,
  methodName,
  params = {},
  query = {}
) => {
  req.params = { ...req.params, ...params };
  req.query = { ...req.query, ...query };

  if (typeof controller[methodName] === "function") {
    return await controller[methodName](req, res);
  } else {
    return sendResponse(res, 501, { error: "Chức năng chưa được triển khai." });
  }
};

const handlePublicRoutes = async (req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const path = parsedUrl.pathname;
  const method = req.method;

  req.params = {};
  req.query = Object.fromEntries(parsedUrl.searchParams.entries());

  try {
    // AUTH
    if (method === "POST" && path === "/auth/register")
      return await handleRoute(req, res, authController, "register");

    if (method === "POST" && path === "/auth/login")
      return await handleRoute(req, res, authController, "login");

    // GOOGLE AUTH
    if (method === "GET" && path === "/auth/google") {
      return new Promise((resolve) => {
        authController.googleLogin(req, res, () => resolve(true));
      });
    }

    if (method === "GET" && path === "/auth/google/callback") {
      return new Promise((resolve) => {
        authController.googleCallback(req, res, () => resolve(true));
      });
    }

    // ARTICLES
    if (method === "GET" && path === "/articles")
      return await handleRoute(req, res, articleController, "getAll");

    if (method === "GET" && path.startsWith("/articles/search"))
      return await handleRoute(req, res, articleController, "search");

    if (method === "GET" && path === "/articles/latest")
      return await handleRoute(req, res, articleController, "getLatest");

    if (method === "GET" && path === "/articles/top-commented")
      return await handleRoute(req, res, articleController, "getTopCommented");

    if (method === "GET" && path === "/articles/random")
      return await handleRoute(req, res, articleController, "getRandom");

    // Lấy chi tiết bài viết
    const articleDetailsMatch = path.match(/^\/articles\/(\d+)$/);
    if (method === "GET" && articleDetailsMatch) {
      const id = articleDetailsMatch[1];
      return await handleRoute(req, res, articleController, "getById", { id });
    }

    // Lấy bài viết theo category
    const categoryMatch = path.match(/^\/articles\/category\/(\d+)$/);
    if (method === "GET" && categoryMatch) {
      const categoryId = categoryMatch[1];
      return await handleRoute(req, res, articleController, "getByCategory", {
        categoryId,
      });
    }

    // Lấy bài viết theo author
    const authorArticlesMatch = path.match(/^\/author\/(\d+)\/articles$/);
    if (method === "GET" && authorArticlesMatch) {
      const authorId = authorArticlesMatch[1];
      req.params.authorId = authorId;
      req.query.status = "published";
      return await handleRoute(req, res, articleController, "getByAuthor", {
        authorId,
      });
    }

    // COMMENTS
    // Lấy bình luận đã duyệt của bài viết
    const articleCommentsMatch = path.match(/^\/articles\/(\d+)\/comments$/);
    if (method === "GET" && articleCommentsMatch) {
      const articleId = articleCommentsMatch[1];
      return await handleRoute(
        req,
        res,
        commentController,
        "getApprovedByArticle",
        { articleId }
      );
    }

    if (method === "POST" && path === "/comments") {
      const isVerified = await verifyToken(req, res);
      if (!isVerified) return true; // nếu chưa đăng nhập → chặn
      return await handleRoute(req, res, commentController, "create");
    }

    if (method === "POST" && path === "/ai/summary") {
      return await handleRoute(req, res, aiController, "summarize");
    }

    // CATEGORIES
    if (method === "GET" && path === "/categories")
      return await handleRoute(req, res, categoryController, "getAll");

    // SUBSCRIPTIONS
    if (method === "POST" && path === "/subscribe")
      return await handleRoute(req, res, subscriptionController, "subscribe");

    // Không match route
    return false;
  } catch (err) {
    console.error("Lỗi định tuyến công khai:", err);
    sendResponse(res, 500, { error: "Internal Server Error" });
    return true;
  }
};

module.exports = handlePublicRoutes;
