const { commentController, userController } = require("../controllers");
const authorRequestController = require("../controllers/authorRequestController");
const { sendResponse } = require("../utils/response");
const { verifyToken, isReader } = require("../middlewares/authMiddleware");

const handleReaderRoutes = async (req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const path = parsedUrl.pathname;
  const method = req.method;

  try {
    // Kiểm tra đăng nhập & role
    if (!(await verifyToken(req, res))) return true;
    if (!(await isReader(req, res))) return true;

    // COMMENT
    if (method === "POST" && path === "/reader/comments")
      return await commentController.create(req, res);

    // USER INFO
    if (method === "GET" && path === "/reader/profile")
      return await userController.getProfile(req, res);

    if (method === "PUT" && path === "/reader/profile")
      return await userController.updateProfile(req, res);

    // AUTHOR REQUEST
    if (method === "POST" && path === "/reader/author-requests")
      return await authorRequestController.applyForAuthor(req, res);

    if (method === "GET" && path === "/reader/author-requests")
      return await authorRequestController.getMyAuthorRequest(req, res);

    if (method === "GET" && path === "/reader/followed-categories")
      return await userController.getFollowedCategories(req, res);

    if (method === "POST" && path === "/reader/follow-category")
      return await userController.followCategory(req, res);

    if (method === "POST" && path === "/reader/unfollow-category")
      return await userController.unfollowCategory(req, res);

    return false;
  } catch (err) {
    console.error("Lỗi định tuyến reader:", err);
    sendResponse(res, 500, { error: "Internal Server Error" });
    return true;
  }
};

module.exports = handleReaderRoutes;
