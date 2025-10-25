const BaseModel = require("./BaseModel");
const db = require("../utils/db");

class Article extends BaseModel {
  static tableName = "articles";

  constructor(data = {}) {
    super(data.id);
    this.title = data.title;
    this.description = data.description;
    this.image_url = data.image_url;
    this.content = data.content;
    this.main_category_id = data.main_category_id || data.categoryId;
    this.author_id = data.author_id;
    this.status = data.status || "draft";
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  validate() {
    if (!this.title || this.title.length < 5)
      throw new Error("Tiêu đề phải có ít nhất 5 ký tự.");
    if (!this.content || this.content.length < 50)
      throw new Error("Nội dung bài viết phải có ít nhất 50 ký tự.");
    if (!this.main_category_id)
      throw new Error("Bài viết phải thuộc danh mục chính.");
    if (!this.author_id) throw new Error("Bài viết phải có tác giả.");
  }

  // Lưu bài viết (thêm mới hoặc cập nhật)
  async save(sub_categories = []) {
    this.validate();

    if (this.id) {
      const sql = `
                UPDATE articles
                SET title=?, description=?, image_url=?, content=?, main_category_id=?, author_id=?, status=?, updated_at=NOW()
                WHERE id=?
            `;
      await db.query(sql, [
        this.title,
        this.description || null,
        this.image_url || null,
        this.content,
        this.main_category_id,
        this.author_id,
        this.status,
        this.id,
      ]);
    } else {
      const sql = `
                INSERT INTO articles 
                (title, description, image_url, content, main_category_id, author_id, status, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
            `;
      const [result] = await db.query(sql, [
        this.title,
        this.description || null,
        this.image_url || null,
        this.content,
        this.main_category_id,
        this.author_id,
        this.status,
      ]);
      this.id = result.insertId;

      if (sub_categories.length > 0) {
        const values = sub_categories.map((catId) => [this.id, catId]);
        await db.query(
          `INSERT INTO article_categories (article_id, category_id) VALUES ?`,
          [values]
        );
      }
    }

    return this;
  }

  // Tạo bài viết mới
  static async create(data) {
    const article = new Article(data);
    await article.save(data.sub_categories || []);
    return article;
  }

  // Lấy bài viết mới nhất
  static async getLatest() {
    const [rows] = await db.query(`
            SELECT 
                a.id, a.title, a.description, a.image_url, a.created_at,
                c.name AS category_name,
                u.full_name AS author_name
            FROM articles AS a
            JOIN categories AS c ON a.main_category_id = c.id
            JOIN users AS u ON a.author_id = u.id
            WHERE a.status = 'published'
            ORDER BY a.created_at DESC, a.id DESC
            LIMIT 1
        `);
    return rows[0] || null;
  }

  // Lấy các bài viết được bình luận nhiều nhất
  static async getTopCommented(limit = 5) {
    const safeLimit = parseInt(limit, 10) || 5;
    const [rows] = await db.query(`
            SELECT 
                a.id, a.title, a.description, a.image_url, a.created_at,
                c.name AS category_name,
                u.full_name AS author_name,
                COUNT(cm.id) AS comment_count
            FROM articles AS a
            JOIN categories AS c ON a.main_category_id = c.id
            JOIN users AS u ON a.author_id = u.id
            LEFT JOIN comments AS cm ON cm.article_id = a.id AND cm.status = 'approved'
            WHERE a.status = 'published'
            GROUP BY a.id
            ORDER BY comment_count DESC
            LIMIT ${safeLimit}
        `);
    return rows;
  }

  // Lấy các bài viết ngẫu nhiên
  static async getRandom(limit = 3) {
    const safeLimit = parseInt(limit, 10) || 3;
    const [rows] = await db.query(`
            SELECT 
                a.id, a.title, a.description, a.image_url, a.created_at,
                c.name AS category_name,
                u.full_name AS author_name
            FROM articles AS a
            JOIN categories AS c ON a.main_category_id = c.id
            JOIN users AS u ON a.author_id = u.id
            WHERE a.status = 'published'
            ORDER BY RAND()
            LIMIT ${safeLimit}
        `);
    return rows;
  }

  // Lấy các bài viết liên quan
  static async getRelatedArticles(articleId, mainCategoryId) {
    const [rows] = await db.query(
      `
            SELECT id, title, image_url, created_at
            FROM articles
            WHERE main_category_id=? AND id!=? AND status='published'
            ORDER BY created_at DESC
            LIMIT 5
        `,
      [mainCategoryId, articleId]
    );
    return rows;
  }

  // Lấy các bài viết theo danh mục
  static async getByCategory(categoryId) {
    const [rows] = await db.query(
      `
            SELECT 
                a.id, a.title, a.description, a.image_url, a.created_at,
                c.name AS category_name,
                u.full_name AS author_name
            FROM articles AS a
            JOIN categories AS c ON a.main_category_id = c.id
            JOIN users AS u ON a.author_id = u.id
            WHERE a.main_category_id=? AND a.status='published'
            ORDER BY a.created_at DESC
        `,
      [categoryId]
    );
    return rows;
  }

  // Tìm kiếm bài viết
  static async search(query) {
    const [rows] = await db.query(
      `
            SELECT 
                a.id, a.title, a.description, a.image_url, a.created_at,
                c.name AS category_name,
                u.full_name AS author_name
            FROM articles AS a
            JOIN categories AS c ON a.main_category_id = c.id
            JOIN users AS u ON a.author_id = u.id
            WHERE (a.title LIKE ? OR a.content LIKE ? OR a.description LIKE ?) 
            AND a.status='published'
            ORDER BY a.created_at DESC
        `,
      [`%${query}%`, `%${query}%`, `%${query}%`]
    );
    return rows;
  }

  // Lấy tất cả bài viết
  static async getAll() {
    const [rows] = await db.query(`
            SELECT 
                a.id, a.title, a.description, a.image_url, a.created_at, a.updated_at,
                c.name AS category_name,
                u.full_name AS author_name
            FROM articles AS a
            JOIN categories AS c ON a.main_category_id = c.id
            JOIN users AS u ON a.author_id = u.id
            WHERE a.status='published'
            ORDER BY a.created_at DESC
        `);
    return rows;
  }

  // Lấy tất cả bài viết cho admin
  static async getAllForAdmin() {
    const [rows] = await db.query(`
            SELECT 
                a.id, a.title, a.status, a.created_at, a.updated_at,
                u.full_name AS author_name
            FROM articles AS a
            JOIN users AS u ON a.author_id = u.id
            ORDER BY a.created_at DESC
        `);
    return rows;
  }

  // Lấy tất cả bài viết của một tác giả
  static async getByAuthor(
    authorId,
    limit = 10,
    offset = 0,
    includeDraft = false
  ) {
    const safeAuthorId = Number(authorId);
    const safeLimit = Math.max(1, Number(limit));
    const safeOffset = Math.max(0, Number(offset));

    if (isNaN(safeAuthorId)) {
      throw new Error(`Invalid authorId: ${authorId}`);
    }

    let sql = `
    SELECT 
        a.id, a.title, a.description, a.image_url, a.status, a.created_at,
        c.name AS category_name
    FROM articles AS a
    JOIN categories AS c ON a.main_category_id = c.id
    WHERE a.author_id = ?
  `;

    if (!includeDraft) sql += " AND a.status='published'";

    sql += `
    ORDER BY a.created_at DESC
    LIMIT ${safeLimit} OFFSET ${safeOffset}
  `;

    const [rows] = await db.query(sql, [safeAuthorId]);
    return rows;
  }

  // Lấy bài viết theo ID
  static async getById(id) {
    const [rows] = await db.query(
      `
            SELECT 
                a.*,
                u.full_name AS author_name,
                c_main.name AS main_category_name
            FROM articles AS a
            LEFT JOIN users AS u ON a.author_id = u.id
            LEFT JOIN categories AS c_main ON a.main_category_id = c_main.id
            WHERE a.id=? AND a.status='published'
        `,
      [id]
    );

    if (rows.length === 0) return null;

    const article = rows[0];

    const [subCategories] = await db.query(
      `
            SELECT c.id, c.name
            FROM article_categories AS ac
            JOIN categories AS c ON ac.category_id = c.id
            WHERE ac.article_id=?
        `,
      [id]
    );

    article.sub_categories = subCategories;
    return article;
  }

  // Lấy tất cả bài viết
  static async getAll() {
    const [rows] = await db.query(`
            SELECT 
                a.id, a.title, a.description, a.image_url, a.created_at, a.updated_at,
                c.name AS category_name,
                u.full_name AS author_name
            FROM articles AS a
            JOIN categories AS c ON a.main_category_id = c.id
            JOIN users AS u ON a.author_id = u.id
            WHERE a.status='published'
            ORDER BY a.created_at DESC
        `);
    return rows;
  }
}

module.exports = Article;
