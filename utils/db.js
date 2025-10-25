require("dotenv").config();
const mysql = require("mysql2/promise");

class Database {
  constructor() {
    this.config = {
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASS || "",
      multipleStatements: true,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    };
    this.dbName = process.env.DB_NAME || "news_website";
    this.pool = null;
  }

  async createDatabase() {
    const tempConnection = await mysql.createConnection(this.config);
    try {
      await tempConnection.query(
        `CREATE DATABASE IF NOT EXISTS \`${this.dbName}\`;`
      );
      console.log(`Database '${this.dbName}' ensured.`);
    } finally {
      await tempConnection.end();
    }
  }

  async createTables() {
    const connection = await this.pool.getConnection();
    try {
      await connection.query(`USE \`${this.dbName}\`;`);
      const schema = `
      -- Bảng users (hỗ trợ cả local & Google)
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NULL,
  full_name VARCHAR(100),
  role ENUM('reader', 'author', 'admin') DEFAULT 'reader',
  provider ENUM('local', 'google') DEFAULT 'local',
  followed_categories JSON DEFAULT (JSON_ARRAY()),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- Bảng categories
CREATE TABLE IF NOT EXISTS categories (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  description VARCHAR(500) NULL
);

-- Bảng articles
CREATE TABLE IF NOT EXISTS articles (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(200) NOT NULL,
  description VARCHAR(500) NOT NULL,
  image_url VARCHAR(255) NULL,
  content TEXT NOT NULL,
  main_category_id INT,
  author_id INT,
  status ENUM('draft','pending','published') DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (main_category_id) REFERENCES categories(id) ON DELETE SET NULL,
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Bảng liên kết bài viết - danh mục phụ
CREATE TABLE IF NOT EXISTS article_categories (
  article_id INT NOT NULL,
  category_id INT NOT NULL,
  PRIMARY KEY (article_id, category_id),
  FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- Bảng comments
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

-- Bảng yêu cầu trở thành tác giả
CREATE TABLE IF NOT EXISTS author_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  reason TEXT NOT NULL,
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
    `;

      await connection.query(schema.trim());
      console.log("All tables created successfully (without subscriptions).");
    } finally {
      connection.release();
    }
  }

  async getConnection() {
    if (!this.pool) {
      throw new Error(
        "Connection pool is not initialized. Please call 'init()' first."
      );
    }
    return this.pool.getConnection();
  }

  async query(sql, params) {
    if (!this.pool) {
      throw new Error(
        "Connection pool is not initialized. Please call 'init()' first."
      );
    }
    return this.pool.execute(sql, params);
  }

  async init() {
    try {
      await this.createDatabase();
      this.config.database = this.dbName;
      this.pool = mysql.createPool(this.config);
      await this.createTables();
      console.log("Database and tables are ready.");
    } catch (err) {
      console.error("Lỗi khi khởi tạo database/tables:", err);
      throw err;
    }
  }
}

const db = new Database();
module.exports = db;
