class ControllerBase {
  // Gửi phản hồi
  sendResponse(res, status, payload) {
    // Nếu response đã được gửi, không gửi lại nữa
    if (res.headersSent) {
      console.warn(
        "Cảnh báo: Response đã được gửi, bỏ qua sendResponse trùng."
      );
      return false;
    }

    res.writeHead(status, { "Content-Type": "application/json" });
    res.end(JSON.stringify(payload));
    return true; // báo hiệu đã gửi
  }

  handleError(res, err) {
    console.error("Lỗi Controller:", err);

    // Nếu đã gửi response trước đó thì không gửi lại
    if (res.headersSent) {
      console.warn("Response đã được gửi trước khi handleError chạy.");
      return;
    }

    return this.sendResponse(res, 500, {
      error: err.message || "Lỗi máy chủ nội bộ",
    });
  }

  // Kiểm tra entity có tồn tại
  async checkExists(entity, res, name = "Item") {
    if (!entity) {
      // Đảm bảo dùng return khi gọi sendResponse
      this.sendResponse(res, 404, { error: `${name} not found.` });
      return false;
    }
    return true;
  }

  // Các phương thức polymorphic để override ở controller con
  // Đảm bảo dùng return khi gọi sendResponse
  async getAll(req, res) {
    return this.sendResponse(res, 501, { error: "Not implemented" });
  }
  async create(req, res) {
    return this.sendResponse(res, 501, { error: "Not implemented" });
  }
  async update(req, res) {
    return this.sendResponse(res, 501, { error: "Not implemented" });
  }
  async delete(req, res) {
    return this.sendResponse(res, 501, { error: "Not implemented" });
  }
}

module.exports = ControllerBase;
