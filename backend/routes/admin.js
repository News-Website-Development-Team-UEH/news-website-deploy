const {
  adminArticleController,
  adminCategoryController,
  adminUserController,
  adminCommentController,
  authorRequestController,
} = require("../controllers");
const { sendResponse } = require("../utils/response");
const { verifyToken, isAdmin } = require("../middlewares/authMiddleware");

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

const handleAdminRoutes = async (req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const path = parsedUrl.pathname;
  const method = req.method;

  try {
    // Authentication & Authorization
    if (!(await verifyToken(req, res))) return true;
    if (!(await isAdmin(req, res))) return true;

    // USERS
    // Lấy danh sách tất cả người dùng
    if (method === "GET" && path === "/admin/users")
      return await handleRoute(req, res, adminUserController, "getAll");

    // Xóa người dùng theo ID
    const userIdMatch = path.match(/^\/admin\/users\/(\d+)$/);
    if (method === "DELETE" && userIdMatch) {
      const id = userIdMatch[1];
      return await handleRoute(req, res, adminUserController, "delete", { id });
    }

    // CATEGORIES
    // Lấy danh sách tất cả danh mục
    if (method === "GET" && path === "/admin/categories")
      return await handleRoute(req, res, adminCategoryController, "getAll");

    // Tạo danh mục mới
    if (method === "POST" && path === "/admin/categories")
      return await handleRoute(req, res, adminCategoryController, "create");

    // Cập nhật danh mục theo ID
    const categoryIdMatch = path.match(/^\/admin\/categories\/(\d+)$/);
    if (categoryIdMatch && method === "PUT") {
      const id = categoryIdMatch[1];
      return await handleRoute(req, res, adminCategoryController, "update", {
        id,
      });
    }

    // Xóa danh mục theo ID
    if (categoryIdMatch && method === "DELETE") {
      const id = categoryIdMatch[1];
      return await handleRoute(req, res, adminCategoryController, "delete", {
        id,
      });
    }

    // ARTICLES
    // Tạo bài viết mới
    if (method === "POST" && path === "/admin/articles") {
      if (req.user && req.user.id) {
        req.body.author_id = req.user.id;
      }
      return await handleRoute(req, res, adminArticleController, "create");
    }

    // Cập nhật bài viết theo ID
    const articleIdMatch = path.match(/^\/admin\/articles\/(\d+)$/);
    if (articleIdMatch && method === "PUT") {
      const id = articleIdMatch[1];
      return await handleRoute(req, res, adminArticleController, "update", {
        id,
      });
    }

    // Xóa bài viết theo ID
    if (articleIdMatch && method === "DELETE") {
      const id = articleIdMatch[1];
      return await handleRoute(req, res, adminArticleController, "delete", {
        id,
      });
    }

    // COMMENTS
    // Duyệt bình luận
    const approveMatch = path.match(/^\/admin\/comments\/(\d+)\/approve$/);
    if (approveMatch && method === "PUT") {
      const id = approveMatch[1];
      return await handleRoute(req, res, adminCommentController, "approve", {
        id,
      });
    }

    // Từ chối bình luận
    const rejectMatch = path.match(/^\/admin\/comments\/(\d+)\/reject$/);
    if (rejectMatch && method === "PUT") {
      const id = rejectMatch[1];
      return await handleRoute(req, res, adminCommentController, "reject", {
        id,
      });
    }

    // Lấy danh sách tất cả yêu cầu
    if (method === "GET" && path === "/admin/author-requests")
      return await handleRoute(req, res, authorRequestController, "listAll");

    // Cập nhật trạng thái (duyệt / từ chối)
    const authorReqMatch = path.match(/^\/admin\/author-requests\/(\d+)$/);
    if (authorReqMatch && method === "PUT") {
      const id = authorReqMatch[1];
      return await handleRoute(
        req,
        res,
        authorRequestController,
        "updateStatus",
        { id }
      );
    }

    return false;
  } catch (err) {
    console.error("Lỗi định tuyến admin:", err);
    sendResponse(res, 500, { error: "Internal Server Error" });
    return true;
  }
};

module.exports = handleAdminRoutes;
