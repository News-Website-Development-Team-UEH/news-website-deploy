const BaseModel = require("./BaseModel");
const db = require("../utils/db");

class AuthorRequest extends BaseModel {
  static tableName = "author_requests";

  constructor(data = {}) {
    super(data.id);
    this.user_id = data.user_id;
    this.reason = data.reason;
    this.status = data.status || "pending";
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Lấy yêu cầu đang chờ duyệt của 1 user
  static async findPendingByUser(userId) {
    const [rows] = await db.query(
      "SELECT * FROM author_requests WHERE user_id=? AND status='pending'",
      [userId]
    );
    return rows.map(row => new this(row));
  }

  // Lấy tất cả yêu cầu kèm thông tin user
  static async findAllWithUser() {
    const [rows] = await db.query(`
      SELECT ar.*, u.username, u.email, u.role
      FROM author_requests ar
      JOIN users u ON u.id = ar.user_id
      ORDER BY ar.created_at DESC
    `);
    return rows.map(row => new this(row));
  }

  // Cập nhật trạng thái
  static async updateStatus(id, status) {
    const [result] = await db.query(
      "UPDATE author_requests SET status=?, updated_at=NOW() WHERE id=?",
      [status, id]
    );
    return result.affectedRows > 0;
  }

  // Tạo yêu cầu mới
  static async createRequest(userId, reason) {
    const [result] = await db.query(
      "INSERT INTO author_requests (user_id, reason, status, created_at) VALUES (?, ?, 'pending', NOW())",
      [userId, reason]
    );
    return new this({ id: result.insertId, user_id: userId, reason, status: "pending" });
  }

  // Tìm yêu cầu theo ID
  static async findById(id) {
    const [rows] = await db.query("SELECT * FROM author_requests WHERE id=?", [id]);
    if (!rows.length) return null;
    return new this(rows[0]);
  }
}

module.exports = AuthorRequest;
