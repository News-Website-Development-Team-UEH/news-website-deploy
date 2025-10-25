require("dotenv").config();
const mysql = require("mysql2/promise");

class Database {
  constructor() {
    this.config = {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT || 3306,
      multipleStatements: true,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    };
    this.pool = null;
  }

  // ✅ Hàm khởi tạo kết nối và tạo bảng nếu chưa có
  async init() {
    try {
      this.pool = mysql.createPool(this.config);
      await this.createTables();
      console.log("✅ Database connected and tables ready.");
    } catch (err) {
      console.error("❌ Lỗi khi khởi tạo database:", err);
      throw err;
    }
  }

  // ✅ Hàm truy vấn chuẩn, chỉ trả về `rows`
  async query(sql, params = []) {
    if (!this.pool) {
      throw new Error(
        "❌ Database pool chưa được khởi tạo — hãy gọi db.init() trước."
      );
    }

    const connection = await this.pool.getConnection();
    try {
      const result = await connection.query(sql, params);
      return result; // ✅ Giữ nguyên cấu trúc [rows, fields]
    } finally {
      connection.release();
    }
  }

  // ✅ Tạo bảng nếu chưa có
  async createTables() {
    const connection = await this.pool.getConnection();
    try {
      const schema = `
        CREATE TABLE IF NOT EXISTS users (
          id INT PRIMARY KEY AUTO_INCREMENT,
          username VARCHAR(50) UNIQUE NOT NULL,
          email VARCHAR(100) UNIQUE NOT NULL,
          password VARCHAR(255),
          full_name VARCHAR(100),
          role ENUM('reader','author','admin') DEFAULT 'reader',
          provider ENUM('local','google') DEFAULT 'local',
          followed_categories JSON DEFAULT (JSON_ARRAY()),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS categories (
          id INT PRIMARY KEY AUTO_INCREMENT,
          name VARCHAR(100) NOT NULL,
          description VARCHAR(500)
        );

        CREATE TABLE IF NOT EXISTS articles (
          id INT PRIMARY KEY AUTO_INCREMENT,
          title VARCHAR(200) NOT NULL,
          description VARCHAR(500) NOT NULL,
          image_url VARCHAR(255),
          content TEXT NOT NULL,
          main_category_id INT,
          author_id INT,
          status ENUM('draft','pending','published') DEFAULT 'draft',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (main_category_id) REFERENCES categories(id) ON DELETE SET NULL,
          FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL
        );

        CREATE TABLE IF NOT EXISTS article_categories (
          article_id INT NOT NULL,
          category_id INT NOT NULL,
          PRIMARY KEY (article_id, category_id),
          FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
          FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS comments (
          id INT PRIMARY KEY AUTO_INCREMENT,
          article_id INT NOT NULL,
          user_id INT,
          content TEXT NOT NULL,
          status ENUM('pending','approved','rejected') DEFAULT 'pending',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
        );

        CREATE TABLE IF NOT EXISTS author_requests (
          id INT PRIMARY KEY AUTO_INCREMENT,
          user_id INT NOT NULL,
          reason TEXT NOT NULL,
          status ENUM('pending','approved','rejected') DEFAULT 'pending',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );
      `;
      await connection.query(schema);
      console.log("✅ All tables created successfully.");
    } finally {
      connection.release();
    }
  }
}

const db = new Database();
module.exports = db;
