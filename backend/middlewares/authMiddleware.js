const jwt = require('jsonwebtoken');
const { sendResponse } = require('../utils/response');

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    console.error("Lỗi: Biến môi trường 'JWT_SECRET' chưa được đặt! Vui lòng cấu hình nó.");
}

/**
 * Middleware để kiểm tra và xác thực token JWT.
 * Gán thông tin user đã giải mã vào req.user.
 * Trả về true nếu xác thực thành công, false và gửi response lỗi nếu thất bại.
 */
const verifyToken = async (req) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) return false;

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        return true;
    } catch {
        return false;
    }
};

/**
 * Middleware để kiểm tra xem người dùng đã xác thực có vai trò 'admin' hay không.
 * Phải được gọi SAU verifyToken.
 * Trả về true nếu là admin, false và gửi response lỗi nếu không phải.
 */
const isAdmin = async (req) => {
    return req.user && req.user.role === 'admin';
};

/**
 * Middleware để kiểm tra xem người dùng đã xác thực có vai trò 'author' hoặc 'admin' (vai trò cao hơn) hay không.
 * Phải được gọi SAU verifyToken.
 * Trả về true nếu là author/admin, false và gửi response lỗi nếu không phải.
 */
const isAuthor = async (req) => {
    return req.user && (req.user.role === 'author' || req.user.role === 'admin');
};

/**
 * Middleware để kiểm tra xem người dùng đã xác thực có ít nhất vai trò 'reader' hay không.
 * Tức là bất kỳ người dùng đã đăng nhập nào.
 * Phải được gọi SAU verifyToken.
 * Trả về true nếu đã đăng nhập, false và gửi response lỗi nếu chưa.
 */
const isReader = async (req, res) => {
    // Bất kỳ user nào có req.user (tức là đã đăng nhập thành công) đều được coi là Reader
    // Hoặc kiểm tra rõ ràng role: (req.user.role === 'reader' || req.user.role === 'author' || req.user.role === 'admin')
    if (!req.user) {
        sendResponse(res, 403, { error: 'Truy cập bị từ chối. Vui lòng đăng nhập.' });
        return false;
    }
    // Nếu req.user tồn tại, request được phép tiếp tục (tức là user đã được xác thực/là Reader)
    return true;
};

module.exports = { 
    verifyToken, 
    isAdmin,
    isAuthor, 
    isReader  
};