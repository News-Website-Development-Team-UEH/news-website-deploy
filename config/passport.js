const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User");

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL;

// Kiểm tra đủ biến môi trường mới kích hoạt
if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET && GOOGLE_CALLBACK_URL) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: GOOGLE_CALLBACK_URL,
        scope: ["profile", "email"],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Lấy email và tên đầy đủ
          const email =
            profile.emails && profile.emails.length > 0
              ? profile.emails[0].value
              : null;
          const full_name =
            profile.displayName ||
            `${profile.name?.givenName || ""} ${
              profile.name?.familyName || ""
            }`.trim();

          if (!email) {
            return done(
              new Error("Thông tin email trong Google profile bị thiếu"),
              null
            );
          }

          // Tìm user theo email
          let user = await User.findByEmail(email);

          if (user) {
            // Nếu user đã tồn tại → đăng nhập
            return done(null, user);
          }

          // Nếu chưa có → tạo user mới Google
          let baseUsername = email.substring(0, email.indexOf("@"));

          // Làm sạch username: chỉ giữ chữ, số, gạch dưới
          baseUsername = baseUsername
            .replace(/[^a-zA-Z0-9_]/g, "")
            .toLowerCase();

          // Nếu quá ngắn, thêm tiền tố
          if (baseUsername.length < 3) {
            baseUsername = "google_user_" + baseUsername;
          }

          // Đảm bảo username là duy nhất
          let username = baseUsername;
          let count = 1;
          while (await User.findByUsername(username)) {
            const trimmed = baseUsername.substring(
              0,
              15 - String(count).length
            );
            username = `${trimmed}${count++}`;
          }

          // Tạo user mới (KHÔNG truyền raw_password)
          const newUser = new User({
            username,
            email,
            full_name,
            role: "reader",
            password: null, 
            provider: "google", 
          });

          await newUser.save();
          return done(null, newUser);
        } catch (err) {
          return done(err, null);
        }
      }
    )
  );
} else {
  console.warn(
    "GOOGLE_CLIENT_ID / SECRET / CALLBACK_URL chưa được thiết lập — Google OAuth chưa kích hoạt."
  );
}

// Serialize & Deserialize
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => done(null, { id }));

module.exports = passport;
