const User = require("../models/User");
const { sendResponse } = require("../utils/response");
const jwt = require("jsonwebtoken");
const ControllerBase = require("./ControllerBase");
const passport = require("passport");

// Nạp cấu hình Google OAuth2
require("../config/passport");

class AuthController extends ControllerBase {
  _redirectToFrontend(res, pathAndQuery, status = 302) {
    const FE_HOST = "https://news-website-frontend-vert.vercel.app";

    res.writeHead(status, {
      Location: `${FE_HOST}${pathAndQuery}`,
      "Content-Type": "text/plain",
    });
    res.end(`Redirecting to ${FE_HOST}${pathAndQuery}`);
    return true;
  }

  // Tạo JWT token
  _generateToken(user) {
    return jwt.sign(
      { id: user.id, role: user.role, username: user.username },
      process.env.JWT_SECRET || "secret123",
      { expiresIn: "1d" }
    );
  }

  // Đăng ký tài khoản
  async register(req, res) {
    try {
      const { username, email, password, full_name } = req.body;

      if (!username || !email || !password || !full_name)
        return this.sendResponse(res, 400, {
          error: "Thiếu các trường bắt buộc.",
        });

      const user = new User({
        username,
        email,
        raw_password: password,
        full_name,
        role: "reader",
      });

      await user.save();
      const token = this._generateToken(user);

      // Xóa password trước khi gửi về
      user.password = undefined;

      this.sendResponse(res, 201, {
        message: "Đã đăng ký thành công.",
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          full_name: user.full_name,
          role: user.role,
        },
      });
    } catch (err) {
      console.error("Register error:", err);
      const msg = err.message || "Registration failed.";
      if (msg.includes("đã tồn tại"))
        return this.sendResponse(res, 409, { error: msg });
      this.handleError(res, err);
    }
  }

  // Đăng nhập
  async login(req, res) {
    try {
      const { username, password } = req.body;

      if (!username || !password)
        return this.sendResponse(res, 400, {
          error: "Thiếu tên người dùng hoặc mật khẩu.",
        });

      const user = await User.findByUsername(username);
      if (!user)
        return this.sendResponse(res, 401, {
          error: "Thông tin xác thực sai.",
        });

      const match = await user.comparePassword(password);
      if (!match)
        return this.sendResponse(res, 401, {
          error: "Thông tin xác thực sai.",
        });

      const token = this._generateToken(user);

      this.sendResponse(res, 200, {
        message: "Đăng nhập thành công.",
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          full_name: user.full_name,
          role: user.role,
        },
      });
    } catch (err) {
      this.handleError(res, err);
    }
  }

  // Google Login (chuyển hướng đến Google)
  googleLogin(req, res, next) {
    passport.authenticate("google", { scope: ["profile", "email"] })(
      req,
      res,
      next
    );
  }

  // Google Callback
  googleCallback = (req, res, next) => {
    passport.authenticate("google", { session: false }, (err, user, info) => {
      if (err) {
        console.error("Google Auth Error:", err);
        const errorMessage = encodeURIComponent(
          err.message || "Xác thực Google không thành công"
        );
        return this._redirectToFrontend(
          res,
          `/formlogin.html?error=${errorMessage}`
        );
      }

      if (!user) {
        const errorMessage = encodeURIComponent(
          "Không tìm thấy người dùng Google."
        );
        return this._redirectToFrontend(
          res,
          `/formlogin.html?error=${errorMessage}`
        );
      }

      try {
        const token = this._generateToken(user);
        const userPayload = {
          id: user.id,
          username: user.username,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
        };

        const encodedUser = encodeURIComponent(JSON.stringify(userPayload));
        return this._redirectToFrontend(
          res,
          `/formlogin.html?token=${token}&user=${encodedUser}`
        );
      } catch (jwtErr) {
        console.error("JWT Error after Google Auth:", jwtErr);
        return this._redirectToFrontend(
          res,
          `/formlogin.html?error=${encodeURIComponent(
            "Lỗi máy chủ khi đăng nhập, vui lòng thử lại sau."
          )}`
        );
      }
    })(req, res, next);
  };
}

module.exports = new AuthController();
