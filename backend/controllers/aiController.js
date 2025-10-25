const fetch = global.fetch || ((...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args)));
const dotenv = require("dotenv");
const Article = require("../models/Article");

dotenv.config();

const HF_API_URL = "https://api-inference.huggingface.co/models/VietAI/vit5-base-vietnews-summarization";

function cleanText(text) {
  return text
    .normalize("NFKC")
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, "") // ký tự điều khiển
    .replace(/�/g, "") // ký tự lỗi font
    .replace(/\s+/g, " ") // khoảng trắng thừa
    .replace(/[^\p{L}\p{N}\p{P}\p{Z}]/gu, "") // ký tự lạ khác
    .replace(/\.{2,}/g, ".") // xóa dấu chấm thừa
    .trim();
}

// Hàm tóm tắt 1 chunk văn bản
async function summarizeChunk(text, retries = 3) {
  if (!text || text.trim().length < 20) {
    return null;
  }

  try {
    const response = await fetch(HF_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.HF_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: text.slice(0, 1000), // giới hạn độ dài input
        parameters: {
          max_length: 250,
          min_length: 50,
          do_sample: false,
        },
      }),
    });

    // Kiểm tra status
    if (!response.ok) {
      if (response.status === 503 && retries > 0) {
        await new Promise(r => setTimeout(r, 2000));
        return summarizeChunk(text, retries - 1);
      }
      throw new Error(`HF API error: ${response.status}`);
    }

    const data = await response.json();

    if (Array.isArray(data) && data[0]?.summary_text) {
      let summary = cleanText(data[0].summary_text);
      return summary;
    }

    return null;
  } catch (err) {
    console.error("Chunk summary error:", err.message);
    return null;
  }
}

exports.summarize = async (req, res) => {
  try {
    let { text, articleId } = req.body;
    let content = text;

    // Lấy nội dung bài viết nếu có articleId
    if (!content && articleId) {
      const article = await Article.findById(articleId);
      if (!article) {
        res.writeHead(404, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ error: "Không tìm thấy bài viết." }));
      }
      content = `${article.title}. ${article.description}. ${article.content}`;
    }

    if (!content) {
      res.writeHead(400, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: "Thiếu nội dung cần tóm tắt." }));
    }

    content = cleanText(content);

    // --- Chia chunk ~500 từ ---
    const words = content.split(" ");
    const chunks = [];
    for (let i = 0; i < words.length; i += 500) {
      chunks.push(words.slice(i, i + 500).join(" "));
    }

    // --- Tóm tắt từng chunk ---
    const intermediateSummaries = [];
    for (const chunk of chunks) {
      const summary = await summarizeChunk(chunk);
      if (summary && summary.length > 10) {
        intermediateSummaries.push(summary);
      }
    }

    // --- Gộp các summary + tóm tắt lần cuối ---
    let finalSummary = "Không thể tóm tắt được nội dung.";
    
    if (intermediateSummaries.length > 0) {
      const combinedText = intermediateSummaries.join(" ");
      
      // Nếu chỉ có 1 chunk, dùng luôn kết quả đó
      if (chunks.length === 1) {
        finalSummary = combinedText;
      } else {
        // Tóm tắt lần cuối nếu có nhiều chunks
        const summary = await summarizeChunk(combinedText);
        if (summary && summary.length > 10) {
          finalSummary = summary;
        } else {
          finalSummary = combinedText;
        }
      }
    }

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ articleId, summary: finalSummary }));
  } catch (err) {
    console.error("AI summary error:", err);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Lỗi khi gọi AI." }));
  }
};