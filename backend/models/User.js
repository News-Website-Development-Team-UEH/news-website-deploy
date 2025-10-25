const BaseModel = require("./BaseModel");
const db = require("../utils/db");
const bcrypt = require("bcrypt");
const {
  validateUsername,
  validateEmail,
  validatePassword,
} = require("../utils/validator");

const SALT_ROUNDS = 10;

class User extends BaseModel {
  static tableName = "users";

  constructor(data = {}) {
    super(data.id);
    this.username = data.username;
    this.email = data.email;
    this.password = data.password;
    this.fullName = data.full_name || data.fullName;
    this.role = data.role || "reader";
    this.createdAt = data.created_at;
    this.rawPassword = data.raw_password || null;

    try {
      const raw = data.followed_categories;
      if (!raw) this.followedCategories = [];
      else if (Array.isArray(raw)) this.followedCategories = raw;
      else this.followedCategories = JSON.parse(raw);
    } catch {
      console.warn("Lỗi parse followed_categories:", data.followed_categories);
      this.followedCategories = [];
    }
  }

  getFollowedCategories() {
    return Array.isArray(this.followedCategories)
      ? this.followedCategories
      : [];
  }

  setFollowedCategories(categoryIds) {
    if (!Array.isArray(categoryIds)) {
      throw new Error("Danh sách category phải là một mảng.");
    }
    this.followedCategories = categoryIds;
  }

  validate() {
    if (!validateUsername(this.username))
      throw new Error("Tên đăng nhập không hợp lệ (3-20 ký tự, chỉ chữ/số/_).");

    if (!validateEmail(this.email)) throw new Error("Email không hợp lệ.");

    if (this.rawPassword && !validatePassword(this.rawPassword))
      throw new Error("Mật khẩu không hợp lệ (ít nhất 6 ký tự).");

    if (!this.fullName || this.fullName.length < 3)
      throw new Error("Tên đầy đủ phải có ít nhất 3 ký tự.");
  }

  async save() {
    this.validate();

    // Kiểm tra trùng username/email
    const existingUsername = await User.findByUsername(this.username);
    if (existingUsername && existingUsername.id !== this.id)
      throw new Error("Tên đăng nhập đã tồn tại.");

    const existingEmail = await User.findByEmail(this.email);
    if (existingEmail && existingEmail.id !== this.id)
      throw new Error("Email đã tồn tại.");

    // Nếu có rawPassword => hash mật khẩu mới
    if (this.rawPassword) {
      this.password = await bcrypt.hash(this.rawPassword, SALT_ROUNDS);
      this.rawPassword = null;
    }

    // Chuẩn bị dữ liệu category
    const followedCategoriesStr = JSON.stringify(
      Array.isArray(this.followedCategories) ? this.followedCategories : []
    );

    // Cập nhật hoặc thêm mới
    if (this.id) {
      const sql = `
        UPDATE users
        SET username = ?, email = ?, password = ?, full_name = ?, role = ?, followed_categories = ?
        WHERE id = ?
      `;
      await db.query(sql, [
        this.username ?? null,
        this.email ?? null,
        this.password ?? null,
        this.fullName ?? null,
        this.role ?? null,
        followedCategoriesStr ?? "[]",
        this.id,
      ]);
    } else {
      const sql = `
        INSERT INTO users (username, email, password, full_name, role, created_at, followed_categories)
        VALUES (?, ?, ?, ?, ?, NOW(), ?)
      `;
      const [result] = await db.query(sql, [
        this.username ?? null,
        this.email ?? null,
        this.password ?? null,
        this.fullName ?? null,
        this.role ?? null,
        followedCategoriesStr ?? "[]",
      ]);
      this.id = result.insertId;
    }

    return this;
  }

  // So sánh mật khẩu
  async comparePassword(candidatePassword) {
    if (!this.password) return false;
    return bcrypt.compare(candidatePassword, this.password);
  }

  // Finders
  static async findById(id) {
    const [rows] = await db.query(`SELECT * FROM users WHERE id = ?`, [id]);
    if (rows.length === 0) return null;
    return new User(rows[0]);
  }

  // Tìm người dùng theo username
  static async findByUsername(username) {
    const [rows] = await db.query(`SELECT * FROM users WHERE username = ?`, [
      username,
    ]);
    if (rows.length === 0) return null;
    return new User(rows[0]);
  }

  static async findByEmail(email) {
    const [rows] = await db.query(`SELECT * FROM users WHERE email = ?`, [
      email,
    ]);
    if (rows.length === 0) return null;
    return new User(rows[0]);
  }
}

module.exports = User;
