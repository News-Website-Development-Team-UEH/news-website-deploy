const http = require("http");
const url = require("url");
const fs = require("fs");
const path = require("path");
const db = require("./utils/db");
require("dotenv").config();

const handlePublicRoutes = require("./routes/public");
const handleReaderRoutes = require("./routes/reader");
const handleAuthorRoutes = require("./routes/author");
const handleAdminRoutes = require("./routes/admin");

const PORT = process.env.PORT || 10000;
const FRONTEND_DIR = path.join(__dirname, "../frontend");
const UPLOAD_DIR = path.join(__dirname, "uploads");
const INDEX_FILE = path.join(FRONTEND_DIR, "index.html");

const mimeTypes = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".ico": "image/x-icon",
  ".svg": "image/svg+xml",
};

// Gửi lỗi server
const sendServerError = (res, err) => {
  if (res.headersSent) return;
  console.error("Lỗi xử lý request:", err);
  res.writeHead(500, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "Lỗi server" }));
};

// Serve file tĩnh + fallback SPA
const serveStaticFile = (req, res, pathname) => {
  if (res.headersSent) return;

  // Serve ảnh từ thư mục /uploads
  if (pathname.startsWith("/uploads/")) {
    const filePath = path.join(UPLOAD_DIR, pathname.replace("/uploads/", ""));
    fs.stat(filePath, (err, stats) => {
      if (err || !stats.isFile()) {
        res.writeHead(404, { "Content-Type": "text/plain" });
        return res.end("Ảnh không tồn tại");
      }

      const ext = path.extname(filePath);
      res.writeHead(200, {
        "Content-Type": mimeTypes[ext] || "application/octet-stream",
      });
      fs.createReadStream(filePath).pipe(res);
    });
    return;
  }

  // Serve frontend
  const filePath = path.join(
    FRONTEND_DIR,
    pathname === "/" ? "index.html" : pathname
  );

  fs.stat(filePath, (err, stats) => {
    if (res.headersSent) return;

    if (err || !stats || !stats.isFile()) {
      fs.stat(INDEX_FILE, (err2, stats2) => {
        if (!err2 && stats2 && stats2.isFile()) {
          res.writeHead(200, { "Content-Type": "text/html" });
          fs.createReadStream(INDEX_FILE).pipe(res);
        } else {
          console.error("Không tìm thấy index.html trong frontend:", err2);
          res.writeHead(404, { "Content-Type": "text/plain" });
          res.end("File Not Found");
        }
      });
    } else {
      const ext = path.extname(filePath);
      res.writeHead(200, { "Content-Type": mimeTypes[ext] || "text/plain" });
      fs.createReadStream(filePath).pipe(res);
    }
  });
};

// Tạo server
// Tạo server HTTP
const server = http.createServer(async (req, res) => {
  const allowedOrigins = [
    "https://news-website-frontend-vert.vercel.app",
    "https://news-website-deploy-iykm.onrender.com",
    "http://localhost:5500",
  ];

  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Vary", "Origin");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  // Xử lý preflight request (OPTIONS)
  if (req.method === "OPTIONS") {
    res.writeHead(204);
    return res.end();
  }

  // Nhận body
  let body = "";
  req.on("data", (chunk) => (body += chunk.toString()));

  req.on("end", async () => {
    try {
      req.body = body ? JSON.parse(body) : {};
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Dữ liệu JSON không hợp lệ." }));
      return;
    }

    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    try {
      if (await handlePublicRoutes(req, res)) return;
      if (
        pathname.startsWith("/reader") &&
        (await handleReaderRoutes(req, res))
      )
        return;
      if (
        pathname.startsWith("/author") &&
        (await handleAuthorRoutes(req, res))
      )
        return;
      if (pathname.startsWith("/admin") && (await handleAdminRoutes(req, res)))
        return;

      if (
        pathname.startsWith("/api") ||
        pathname.startsWith("/admin") ||
        pathname.startsWith("/author") ||
        pathname.startsWith("/reader")
      ) {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Không tìm thấy tài nguyên." }));
        return;
      }

      serveStaticFile(req, res, pathname);
    } catch (err) {
      sendServerError(res, err);
    }
  });
});

// Khởi động server
server.listen(PORT, async () => {
  console.log(`Server đang chạy tại cổng ${PORT}`);
  try {
    await db.init();
    console.log("Database kết nối thành công");
  } catch (err) {
    console.error("Lỗi kết nối database:", err);
    process.exit(1);
  }
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`Cổng ${PORT} đang được sử dụng. Hãy đổi cổng khác.`);
  } else {
    console.error("Server error:", err);
  }
  process.exit(1);
});
