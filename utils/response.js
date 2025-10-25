/**
 * Gửi phản hồi JSON đến client.
 * @param {object} res Đối tượng phản hồi của Node.js.
 * @param {number} statusCode Mã trạng thái HTTP (ví dụ: 200, 201, 400, 500).
 * @param {object} payload Dữ liệu JSON cần gửi.
 */
function sendResponse(res, statusCode, payload) {
  if (res.writableEnded) {
    console.warn("Response đã được gửi trước đó! Bỏ qua lần gửi trùng.");
    console.trace("Gọi lại sendResponse ở:");
    return;
  }

  console.log(`Gửi response ${statusCode}:`, payload);
  res.writeHead(statusCode, { "Content-Type": "application/json" });
  res.end(JSON.stringify(payload));
}

module.exports = { sendResponse };
