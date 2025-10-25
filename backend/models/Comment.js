const BaseModel = require("./BaseModel");
const db = require("../utils/db");

const BANNED_KEYWORDS = ["spam", "lừa đảo", "rác", "liên kết", "quảng cáo"];
const MAX_URL_COUNT = 2;

class Comment extends BaseModel {
  static tableName = "comments";

  constructor(data = {}) {
    super(data.id);
    this.article_id = data.article_id;
    this.user_id = data.user_id;
    this.content = data.content;
    this.status = data.status || "pending";
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Kiểm duyệt tự động
  performAutoModeration() {
    const lowerContent = this.content.toLowerCase();

    for (const keyword of BANNED_KEYWORDS) {
      if (lowerContent.includes(keyword)) return "pending";
    }

    const urlMatches = lowerContent.match(/https?:\/\/[^\s]+/g);
    if ((urlMatches?.length || 0) > MAX_URL_COUNT) return "pending";

    return "approved";
  }

  async save() {
    if (this.id) {
      // Cập nhật comment (Admin)
      const sql = `UPDATE comments SET content=?, status=? WHERE id=?`;
      await db.query(sql, [this.content, this.status, this.id]);
    } else {
      // Tạo mới comment + auto moderation
      this.status = this.performAutoModeration();
      const userIdToInsert = Number(this.user_id) || null;
      const sql = `INSERT INTO comments (article_id, user_id, content, status, created_at) VALUES (?, ?, ?, ?, NOW())`;
      const [result] = await db.query(sql, [
        this.article_id,
        userIdToInsert,
        this.content,
        this.status,
      ]);
      this.id = result.insertId;
    }
    return this;
  }

  // Lấy comment đã duyệt theo bài viết, kèm thông tin người dùng
  static async findApprovedByArticle(articleId) {
    const [rows] = await db.query(
      `
    SELECT 
      c.id,
      c.article_id,
      c.user_id,
      u.username,
      u.full_name,
      c.content,
      c.status,
      c.created_at
    FROM comments AS c
    LEFT JOIN users AS u ON c.user_id = u.id
    WHERE c.article_id = ?
      AND c.status = 'approved'
    ORDER BY c.created_at DESC
    `,
      [articleId]
    );
    return rows;
  }

  // Lấy comment chờ duyệt (Admin)
  static async getPendingComments() {
    const [rows] = await db.query(
      `SELECT * FROM comments WHERE status='pending' ORDER BY created_at ASC`
    );
    return rows;
  }
}

module.exports = Comment;
