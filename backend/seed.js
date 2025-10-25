const db = require("./utils/db");
const bcrypt = require("bcrypt");

const seedDatabase = async () => {
  try {
    await db.init();
    console.log(
      "Bắt đầu tạo dữ liệu thực tế cho web tin tức AI"
    );

    // Clear old data
    await db.query("SET FOREIGN_KEY_CHECKS = 0");
    await db.query("TRUNCATE TABLE article_categories");
    await db.query("TRUNCATE TABLE comments");
    await db.query("TRUNCATE TABLE articles");
    await db.query("TRUNCATE TABLE categories");
    await db.query("TRUNCATE TABLE users");
    await db.query("SET FOREIGN_KEY_CHECKS = 1");

    // Hash passwords
    const hashedPassword = await bcrypt.hash("password123", 10);

    // 1. Insert users
    // ID 1: 'admin', ID 2: 'reader1', ID 3: 'author1', ID 4: 'author2', ID 5: 'reader2'
    await db.query(
      `INSERT INTO users (username, email, password, full_name, role) VALUES 
        ('admin', 'admin@ai-news.com', ?, 'Admin AI', 'admin'),
        ('reader1', 'reader1@ai-news.com', ?, 'AI Reader One', 'reader'),
        ('author1', 'author1@ai-news.com', ?, 'AI Author One', 'author'), 
        ('author2', 'author2@ai-news.com', ?, 'AI Author Two', 'author'), 
        ('reader2', 'reader2@ai-news.com', ?, 'AI Reader Two', 'reader');`,
      [
        hashedPassword,
        hashedPassword,
        hashedPassword,
        hashedPassword,
        hashedPassword,
      ]
    );
    console.log("5 users created.");

    // 2. Insert categories (ĐÃ CẬP NHẬT CÓ CỘT DESCRIPTION)
    // ID: 1: 'AI Research', 2: 'Machine Learning', 3: 'AI Application', 4: 'Ethics & Policy', 5: 'Society & Future of Work'
    await db.query(
      `INSERT INTO categories (name, description) VALUES 
    ('Nghiên cứu AI', 'Nghiên cứu mới, công bố khoa học và đột phá lý thuyết trong lĩnh vực Trí tuệ Nhân tạo.'), 
    ('Học máy', 'Các thuật toán, mô hình học máy, Deep Learning, và khoa học dữ liệu.'), 
    ('Ứng dụng AI', 'Ứng dụng thực tế của AI trong các ngành công nghiệp như y tế, tài chính, và bảo mật.'),
    ('Đạo đức & Chính sách', 'Các vấn đề về đạo đức, luật pháp, quy định và chính sách quản lý AI trên toàn cầu.'),
    ('Xã hội & Tương lai việc làm', 'Tác động của AI đến thị trường lao động, xã hội, giáo dục và đời sống con người.');`
    );
    console.log("5 categories created with new names and descriptions.");

    // 3. Insert articles
    // Lưu ý: TÔI ĐÃ SỬA LỖI CÚ PHÁP BẰNG CÁCH TÁCH THÀNH NHIỀU CÂU LỆNH INSERT RIÊNG LẺ
    // và đồng bộ tên cột: description, main_category_id, author_id
    // Mỗi câu lệnh INSERT INTO articles... được thực thi riêng rẽ (không còn bao bọc bởi một dấu '`' lớn nữa).

    // Bài viết ID 1: FPT AI Factory
    // Society & Future of Work (5)
    await db.query(
      `INSERT INTO articles (title, description, image_url, content, main_category_id, author_id, status)
    VALUES (
      'FPT ra mắt FPT AI Factory, hướng tới xây dựng Trí tuệ Nhân tạo Chủ quyền cho doanh nghiệp',
      'FPT cùng NVIDIA giới thiệu FPT AI Factory, một nền tảng giúp doanh nghiệp tự chủ phát triển và triển khai ứng dụng AI an toàn, hướng đến Trí tuệ Nhân tạo Chủ quyền (Sovereign AI).',
      'https://devops.vn/uploads/images/2025/09/0199769b-353b-7341-8152-a0e4ba64b429.webp',
      'Tại một sự kiện công nghệ gần đây, FPT cùng các đối tác lớn như NVIDIA đã thảo luận về xu hướng Trí tuệ Nhân tạo Chủ quyền (Sovereign AI). Sự kiện này, FPT đã giới thiệu nền tảng FPT AI Factory, một giải pháp được thiết kế để giúp doanh nghiệp tự chủ phát triển và triển khai ứng dụng AI một cách an toàn.

      Trong khuôn khổ sự kiện “Boosting Efficiency & Security in the Digital Transformation Era”, đại diện FPT và các đối tác công nghệ như NVIDIA, F5, và Tech Data APAC đã tập trung vào vấn đề an ninh dữ liệu và chủ quyền AI. Đây được xem là yếu tố then chốt trong bối cảnh các doanh nghiệp ngày càng tích hợp sâu trí tuệ nhân tạo vào quá trình vận hành và kinh doanh.

      Bà Nguyễn Thị Phương Anh, Giám đốc Vận hành FPT AI Factory, đã giới thiệu chi tiết về nền tảng này. Theo đại diện FPT, đây là một “nhà máy AI” sở hữu năng lực tính toán quy mô lớn, có khả năng xử lý hàng tỷ tỷ phép tính mỗi giây và tích hợp sẵn hệ sinh thái Generative AI. Nền tảng được thiết kế để giúp doanh nghiệp rút ngắn thời gian tạo ra một “nhân sự AI”, tối ưu hóa các mô hình ngôn ngữ lớn (LLM) hiện có.

      Mục tiêu của FPT AI Factory không chỉ dừng lại ở việc cung cấp hạ tầng mạnh mẽ. Giải pháp này còn bao gồm các công cụ linh hoạt và ứng dụng AI có sẵn, nhằm giúp doanh nghiệp tăng tốc đổi mới. Qua đó, FPT cam kết hỗ trợ các tổ chức cân bằng giữa việc triển khai công nghệ AI tiên tiến và việc đảm bảo các yếu tố về an toàn, bền vững và lợi thế cạnh tranh lâu dài.

      Nguồn: FPT Smart Cloud',
      5, -- Society & Future of Work
      1, -- admin
      'published'
    );`
    );

    // Bài viết ID 2: PTIT NVIDIA
    // Machine Learning (2)
    await db.query(
      `INSERT INTO articles (title, description, image_url, content, main_category_id, author_id, status)
    VALUES (
      'Giảng viên PTIT trở thành Đại sứ của NVIDIA, mở ra cơ hội chứng chỉ quốc tế cho sinh viên PTIT',
      'TS. Vũ Hoài Nam, giảng viên Khoa Trí tuệ nhân tạo PTIT, được công nhận là Đại sứ NVIDIA, mang lại cho sinh viên PTIT cơ hội học tập và nhận chứng chỉ quốc tế DLI có giá trị toàn cầu.',
      'https://devops.vn/uploads/images/2025/09/6277c304-a500-4528-b361-35ad11dccb3a.webp',
      'Tiến sĩ Vũ Hoài Nam, giảng viên Khoa Trí tuệ nhân tạo Học viện Công nghệ Bưu chính Viễn thông (PTIT), đã chính thức được công nhận là Đại sứ của NVIDIA tại Việt Nam. Thành tựu này mang lại cho sinh viên PTIT cơ hội tiếp cận trực tiếp với hệ sinh thái AI hàng đầu và được cấp các chứng chỉ quốc tế có giá trị toàn cầu.

      Tập đoàn công nghệ NVIDIA vừa chính thức công nhận TS. Vũ Hoài Nam, giảng viên Khoa Trí tuệ nhân tạo tại Học viện Công nghệ Bưu chính Viễn thông (PTIT), là Đại sứ của University Ambassador sau khi ông vượt qua kỳ sát hạch chuyên môn của hãng.

      Chương trình này là một sáng kiến toàn cầu của NVIDIA nhằm kết nối với các giảng viên và nhà nghiên cứu xuất sắc tại các trường đại học hàng đầu, tạo thành một cầu nối để đưa những công nghệ AI tiên tiến nhất vào môi trường học thuật.

      Với vai trò mới này, TS. Vũ Hoài Nam sẽ được cấp quyền truy cập toàn diện vào kho tài nguyên giáo dục và công nghệ của NVIDIA. Điều này bao gồm các bộ công cụ phát triển phần mềm (SDK), các mô hình AI đã được huấn luyện trước, và quan trọng nhất là các chương trình đào tạo từ NVIDIA Deep Learning Institute – DLI.

      Lợi ích lớn nhất và trực tiếp nhất cho sinh viên PTIT là cơ hội được học tập và nhận các chứng chỉ quốc tế của NVIDIA ngay tại trường. Các chứng chỉ này được công nhận rộng rãi trên toàn thế giới và là một lợi thế cạnh tranh rất lớn cho sinh viên khi tham gia vào thị trường lao động trong lĩnh vực AI, khoa học dữ liệu và học máy.

      Bên cạnh công tác giảng dạy, TS. Vũ Hoài Nam còn được biết đến là mentor cho nhiều dự án nghiên cứu của sinh viên tại Trung tâm Sáng tạo và Vườn ươm PTIT (PTIT IEC). Việc trở thành Đại sứ NVIDIA sẽ tiếp thêm nguồn lực để ông hỗ trợ tốt hơn cho các sinh viên đam mê AI trong hành trình nghiên cứu và phát triển sự nghiệp.

      Sự kiện này không chỉ là một thành tựu cá nhân của TS. Vũ Hoài Nam mà còn là một bước tiến quan trọng của PTIT trong việc quốc tế hóa chương trình đào tạo và tăng cường hợp tác với các tập đoàn công nghệ hàng đầu thế giới, khẳng định vị thế là một trong những cơ sở đào tạo nhân lực AI chất lượng cao tại Việt Nam.

      Nguồn: PTIT',
      2, -- Machine Learning
      2, -- reader1
      'published'
    );`
    );

    // Bài viết ID 3: VNPT Cyber Immunity
    // AI Application (3)
    await db.query(
      `INSERT INTO articles (title, description, image_url, content, main_category_id, author_id, status)
    VALUES (
      'VNPT Cyber Immunity chia sẻ phương pháp ứng dụng AI trong Reverse Engineering tại Security Bootcamp 2025',
      'Các kỹ sư bảo mật VNPT Cyber Immunity trình bày cách ứng dụng AI trong Reverse Engineering (phân tích ngược) để tăng tốc và nâng cao độ chính xác trong kiểm thử bảo mật và phân tích mã độc.',
      'https://devops.vn/uploads/images/2025/09/01994380-f8cd-7ce4-b063-fda0484174ec.webp',
      'Tại sự kiện Security Bootcamp 2025 đang diễn ra ở Huế, các kỹ sư bảo mật của VNPT Cyber Immunity đã trình bày một tham luận đáng chú ý, giới thiệu cách ứng dụng Trí tuệ nhân tạo để tạo ra bước đột phá trong lĩnh vực kiểm thử bảo mật và phân tích mã độc.

      Trong khuôn khổ Diễn đàn An toàn thông tin Security Bootcamp 2025 (diễn ra từ ngày 12–14/9), các chuyên gia từ VNPT Cyber Immunity đã mang đến một góc nhìn mới mẻ về vai trò của AI trong các tác vụ an ninh mạng chuyên sâu.

      Với chủ đề chung của sự kiện là Cyber Resilience, bài tham luận có tiêu đề “AI & Reverse Engineering: Đòn bẩy tối thượng cho chuyên gia Pentest Black Box” đã tập trung vào việc giải quyết một trong những thách thức lớn nhất của ngành bảo mật: quá trình phân tích ngược. Đây là phương pháp phân tích phần mềm hoặc firmware để tìm ra các lỗ hổng tiềm ẩn khi không có mã nguồn, một công việc đòi hỏi rất nhiều thời gian và chuyên môn sâu.

      Theo chia sẻ của các kỹ sư VNPT Cyber Immunity, phương pháp truyền thống yêu cầu các chuyên gia phải mất hàng giờ, thậm chí hàng ngày để phân tích thủ công từng dòng mã. Tuy nhiên, với sự trợ giúp của các mô hình AI hiện đại, quy trình này có thể được tăng tốc đáng kể.

      Bài trình bày đã chứng minh cách AI có thể tự động thực hiện các công việc phức tạp như giải thích chức năng của các đoạn code, nhận diện các hàm quan trọng, dự đoán cấu trúc dữ liệu và hỗ trợ phân tích firmware một cách hiệu quả. Việc này không chỉ giúp rút ngắn đáng kể thời gian làm việc cho các chuyên gia bảo mật mà còn nâng cao độ chính xác trong việc phát hiện các rủi ro.

      Những chia sẻ từ VNPT Cyber Immunity cho thấy AI không còn là một khái niệm tương lai mà đã trở thành một vũ khí mạnh mẽ, một người trợ lý đắc lực cho các chuyên gia pentest. Cách tiếp cận này hứa hẹn sẽ mở ra một chương mới trong lĩnh vực nghiên cứu lỗ hổng bảo mật, giúp các tổ chức chủ động hơn trong việc bảo vệ hệ thống của mình trước các mối đe dọa.',
      3, -- AI Application
      1, -- admin
      'published'
    );`
    );

    // Bài viết ID 4: AI trong an ninh mạng 2025
    // AI Application (3)
    await db.query(
      `INSERT INTO articles (title, description, image_url, content, main_category_id, author_id, status)
    VALUES (
      'AI trong an ninh mạng 2025: Thách thức hay Cơ hội?',
      'Viettel Threat Intelligence báo cáo: AI đang được tội phạm mạng khai thác để tạo ra các cuộc tấn công lừa đảo, deepfake tinh vi, buộc các hệ thống phòng thủ phải tích hợp sâu công nghệ AI.',
      'https://devops.vn/uploads/images/2025/09/01993e20-3083-753e-a1b5-6ab47586b6d0.webp',
      'Trí tuệ nhân tạo đang định hình lại cuộc chiến an ninh mạng theo hai hướng trái ngược: vừa là công cụ đắc lực cho tội phạm mạng tạo ra các cuộc tấn công tinh vi chưa từng có, vừa là chìa khóa cho các hệ thống phòng thủ thế hệ mới. Một báo cáo gần đây từ Viettel Threat Intelligence đã chỉ ra bức tranh toàn cảnh về thách thức và cơ hội này.

      Theo báo cáo tình hình nguy cơ An toàn thông tin 6 tháng đầu năm 2025 do Viettel Threat Intelligence công bố, Trí tuệ nhân tạo và công nghệ deepfake đã trở thành những yếu tố then chốt, thúc đẩy một làn sóng tấn công mạng mới. Thực tế cho thấy, tội phạm mạng đang khai thác sức mạnh của AI để gia tăng tốc độ, quy mô và độ tinh vi của các chiến dịch độc hại.

      Báo cáo chỉ ra rằng, AI đang giúp tội phạm mạng tự động hóa và cá nhân hóa các chiến dịch lừa đảo ở quy mô chưa từng có. Các hình thức tấn công như phishing qua email, SMS, hay lừa đảo qua giọng nói giờ đây được AI tạo ra với nội dung cực kỳ thuyết phục, nhắm đến từng cá nhân cụ thể. Đáng báo động hơn, công nghệ deepfake voice và video có khả năng giả mạo giọng nói và hình ảnh của các lãnh đạo doanh nghiệp để yêu cầu chuyển tiền hoặc tiết lộ thông tin nhạy cảm, dễ dàng vượt qua các biện pháp xác minh truyền thống. Ngay cả mã độc cũng có thể được AI hỗ trợ để liên tục tự biến đổi, né tránh sự phát hiện của các phần mềm diệt virus.

      Bên cạnh đó, AI còn được tận dụng để tạo ra polymorphic malware – loại mã độc có khả năng tự biến đổi, liên tục thay đổi mã nguồn để lẩn tránh các hệ thống phòng thủ dựa trên nhận diện chữ ký truyền thống. Điều này đặt ra một thách thức khổng lồ cho các doanh nghiệp và tổ chức.

      Trước bối cảnh này, các chuyên gia nhận định câu hỏi quan trọng đối với các doanh nghiệp không còn là “Liệu chúng ta có bị tấn công không?”, mà phải là “Chúng ta sẽ ứng dụng AI như thế nào để bảo vệ chính mình?”. Cuộc chiến giờ đây đã chuyển sang một sân chơi mới, nơi mà việc sở hữu công nghệ AI phòng thủ không còn là một lợi thế, mà là một yêu cầu bắt buộc.

      Đây chính là lúc vai trò của các nhà cung cấp dịch vụ an ninh mạng chuyên nghiệp như Viettel Cyber Security (VCS) đang tập trung nghiên cứu và tích hợp sâu AI vào các nền tảng phòng thủ thế hệ mới. Với vị thế dẫn đầu trong nghiên cứu và ứng dụng AI vào an toàn thông tin, các công ty này đang đứng trước thách thức và sứ mệnh giúp doanh nghiệp tích hợp các công nghệ phòng thủ thế hệ mới, biến AI từ một mối đe dọa thành một lợi thế cạnh tranh, đảm bảo sự kiên cường và an toàn trong kỷ nguyên số.',
      3, -- AI Application
      1, -- admin
      'published'
    );`
    );

    // Bài viết ID 5: VCS chia sẻ nghiên cứu
    // AI Research (1)
    await db.query(
      `INSERT INTO articles (title, description, image_url, content, main_category_id, author_id, status, created_at)
    VALUES 
      ('Viettel Cyber Security chia sẻ nghiên cứu về APT và AI tại sự kiện Security Bootcamp 2025', 
      'Các chuyên gia VCS trình bày nghiên cứu mới nhất về chiến dịch tấn công của nhóm Lotus Blossom, APT Earth Baxia, sự cố rò rỉ dữ liệu, và ứng dụng AI Agent để nâng cao năng lực phòng thủ.', 
      'https://devops.vn/uploads/images/2025/09/1ce29165-03b9-40c3-a747-340bbf898140.webp', 
      'Một đội ngũ chuyên gia hàng đầu từ Viettel Cyber Security sẽ trình bày những nghiên cứu mới nhất về các chiến dịch tấn công có chủ đích (APT), các vụ rò rỉ dữ liệu quy mô lớn và ứng dụng của AI trong an ninh mạng tại sự kiện Security Bootcamp 2025, diễn ra tại TP. Huế từ ngày 12 đến 14 tháng 9.

      Công ty An ninh mạng Viettel (Viettel Cyber Security) thông báo sẽ tham gia sự kiện an ninh mạng thường niên Security Bootcamp 2025 với vai trò là diễn giả chính, đóng góp nhiều phiên tham luận chuyên sâu. Sự kiện năm nay, với chủ đề “Cyber Resilience” (Tái sinh), là diễn đàn uy tín quy tụ các chuyên gia hàng đầu trong cộng đồng an toàn thông tin Việt Nam.

      Với kinh nghiệm thực chiến và năng lực phân tích mối đe dọa, các chuyên gia của VCS dự kiến sẽ mang đến những nội dung hấp dẫn, bám sát vào các diễn biến nóng nhất của bối cảnh an ninh mạng trong nước và khu vực. Các phiên trình bày năm nay hứa hẹn sẽ bao quát những lĩnh vực được quan tâm nhất. Trong đó, mảng phân tích các mối đe dọa tinh vi (APT) chiếm một vị trí quan trọng, với phần trình bày của chuyên gia Vũ Đức Hoàng về chiến dịch tấn công mới của nhóm Lotus Blossom, làm rõ các kỹ thuật ẩn náu như “Domain Fronting”. Tiếp nối mạch phân tích này, chuyên gia Nguyễn Đức Kiên sẽ trình bày chiến dịch gián điệp mạng của nhóm APT Earth Baxia, một mối đe dọa đang nhắm vào các hạ tầng trọng yếu tại khu vực.

      Bên cạnh việc đối phó với các nhóm tin tặc có chủ đích, các chuyên gia cũng sẽ chia sẻ những góc nhìn thực tiễn về các sự cố dữ liệu. Đáng chú ý là phần trình bày của chuyên gia Bùi Tiến Giang về bài học từ một vụ việc rò rỉ 38 triệu bản ghi dữ liệu trong ngành bán lẻ tại Việt Nam. Hướng tới tương lai, kỹ sư AI Nguyễn Thúy Hằng sẽ mang đến một cái nhìn mới mẻ qua chủ đề “From LLM to AI Agent”, khám phá cách nâng cao năng lực phòng thủ bằng các tác tử AI chủ động.

      Sự tham gia của Viettel Cyber Security với những chủ đề đa dạng và chuyên sâu được kỳ vọng sẽ đóng góp những kiến thức và kỹ năng giá trị cho cộng đồng ATTT, góp phần củng cố năng lực phòng thủ chung của Việt Nam trước các mối đe dọa ngày càng phức tạp.', 
      1, -- AI Research 
      2, -- reader1 
      'published', 
      '2025-09-11 09:40:00'
    );`
    );

    // Bài viết ID 6: Perplexity Pro
    // AI Application (3)
    await db.query(
      `INSERT INTO articles (title, description, image_url, content, main_category_id, author_id, status, created_at)
    VALUES 
      ('Cách nhận Perplexity Pro miễn phí trị giá $200', 
      'Perplexity AI công bố chương trình hợp tác với PayPal/Venmo, tặng miễn phí 12 tháng gói Perplexity AI Pro (trị giá 200 USD) chỉ bằng cách liên kết tài khoản thanh toán.', 
      'https://devops.vn/uploads/images/2025/09/bb65209c-5001-4a4b-aa2c-7863356d51f0.webp', 
      'Perplexity AI đã công bố chương trình hợp tác với dịch vụ thanh toán PayPal và Venmo, mang đến ưu đãi đặc biệt cho người dùng. Cụ thể, khách hàng sử dụng PayPal hoặc Venmo sẽ nhận miễn phí 12 tháng gói Perplexity AI Pro (trị giá 200 USD) chỉ bằng cách kết nối tài khoản. Đây là cơ hội rất tốt để bạn trải nghiệm toàn bộ tính năng cao cấp của Perplexity mà không mất bất kỳ chi phí nào.

      Perplexity Pro được đánh giá là một trong những công cụ AI tìm kiếm và tổng hợp thông tin tốt nhất hiện nay, với giá niêm yết là 20 USD/tháng hoặc 200 USD/năm, nổi bật với các tính năng:

      - Truy vấn nhanh hơn: Kết quả chính xác và cập nhật từ nhiều nguồn đáng tin cậy. 
      - Truy cập dữ liệu thời gian thực: Không còn bị giới hạn thông tin cũ. 
      - Dung lượng hỏi đáp không giới hạn: Tự do nghiên cứu và tìm kiếm thông tin. 
      - Tích hợp AI đa nền tảng: Hỗ trợ trình duyệt, ứng dụng di động và API cho lập trình viên. 

      **Điều Khoản và Điều Kiện Áp Dụng** Để nhận được ưu đãi, người dùng cần liên kết tài khoản PayPal hoặc Venmo của mình làm phương thức thanh toán trên nền tảng Perplexity. 
      Chương trình có các điều kiện quan trọng sau:

      - Thời hạn chương trình: Ưu đãi có giá trị đến hết ngày 31 tháng 12 năm 2025. 
      - Đối tượng áp dụng: Chỉ dành cho người dùng chưa từng đăng ký Perplexity Pro trước đây. 
      - Điều kiện tài khoản PayPal: Những tài khoản được tạo trước ngày 1/9/2025 sẽ được kích hoạt ưu đãi ngay lập tức; tài khoản mới sẽ có thời gian chờ 30 ngày. 
      - Giới hạn sử dụng: Mỗi tài khoản PayPal hoặc Venmo chỉ được tham gia chương trình một lần duy nhất. 
      - Điều kiện duy trì: Quyền truy cập Perplexity Pro sẽ bị thu hồi nếu người dùng gỡ bỏ phương thức thanh toán PayPal/Venmo khỏi tài khoản Perplexity trước khi thời hạn một năm kết thúc. 

      **Cách nhận 12 tháng Perplexity AI Pro miễn phí:** 1) Truy cập: https://www.perplexity.ai/join/p/paypal-subscription và chọn “Claim 12 months of Perplexity Pro”. 
      2) Đăng nhập vào tài khoản PayPal hoặc tạo mới. 
      3) Xác nhận ưu đãi Perplexity Pro miễn phí 12 tháng (không cần thanh toán trước). 
      4) Kiểm tra trạng thái gói — nếu thành công, bạn sẽ thấy “Perplexity Pro” đang hoạt động. 

      Đây là một động thái chiến lược của Perplexity nhằm mở rộng cơ sở người dùng và tăng cường sự hiện diện trên thị trường công cụ tìm kiếm AI đang cạnh tranh gay gắt. Nếu bạn đang tìm kiếm một công cụ AI thông minh và mạnh mẽ cho học tập, nghiên cứu hay công việc, thì đây chính là cơ hội không nên bỏ lỡ. Chỉ cần liên kết PayPal, bạn sẽ có ngay Perplexity AI Pro miễn phí 12 tháng trị giá 200 USD.', 
      3, -- AI Application 
      2, -- reader1 
      'published', 
      '2025-09-05 10:25:00'
    );`
    );

    // Bài viết ID 7: LinkedIn HDFS
    // Machine Learning (2)
    await db.query(
      `INSERT INTO articles (title, description, image_url, content, main_category_id, author_id, status, created_at)
    VALUES 
      ('LinkedIn đã vận hành 1 Exabyte dữ liệu trên HDFS như thế nào?', 
      'LinkedIn chia sẻ cách họ scale hệ thống HDFS (Hadoop Distributed File System) lên tới 1 Exabyte dữ liệu bằng cách replica NameNode và tinh chỉnh Java heap size để đạt hiệu suất cao.', 
      'https://devops.vn/uploads/images/2025/08/0198f0c2-01f0-73ef-89f3-ab61c9ca2e69.webp', 
      'Hôm nay tôi lượm được một bài khá hay của anh em LinkedIn, chia sẻ về cách họ scale hệ thống HDFS (Hadoop Distributed File System) lên tới 1 Exabyte dữ liệu. Một con số quá khủng khiếp.

      Trong bài này, chúng ta sẽ cùng mổ xẻ vài thứ hay ho mà họ đã làm:

      - Làm sao để scale HDFS lên 1 Exabyte dữ liệu? 
      - Cách họ replica các server NameNode để tăng tính high availability. 
      - Tinh chỉnh Java heap size để hệ thống garbage collection hiệu quả. 
      - Làm sao để đọc dữ liệu nhất quán cao từ các Standby NameNode để giảm tải cho Active NameNode. 

      **Hành trình của LinkedIn scale HDFS lên 1 Exabyte dữ liệu** LinkedIn – mạng xã hội nghề nghiệp lớn nhất hành tinh với hơn 800 triệu người dùng – phụ thuộc rất nhiều vào Hadoop, cụ thể là HDFS để lưu trữ. Trong 5 năm qua, hạ tầng của họ phình to theo cấp số nhân. Đến năm 2021, họ chạm mốc lưu trữ **1 exabyte dữ liệu** trên tất cả các cluster Hadoop. Riêng cluster lớn nhất đã chứa **500 petabytes dữ liệu**, chạy trên **10,000 node** – một trong những cluster Hadoop lớn nhất thế giới. 

      Điều đáng nể là dù quy mô cực lớn, độ trễ trung bình cho các RPC (remote procedure calls) tới cluster vẫn dưới **10 mili giây**.

      **1. Replica NameNode** Với HDFS, metadata của hệ thống file (tên file, cây thư mục, file nào nằm ở block nào…) được tách riêng khỏi dữ liệu thực tế. 
      - **DataNode**: Lưu dữ liệu thật, client đọc/ghi dữ liệu trực tiếp tại đây. 
      - **NameNode**: “Bộ não” quản lý metadata, mọi client đều phải hỏi nó trước khi đọc/ghi file. 

      Vấn đề là NameNode là **single point of failure**. Nếu nó “tạch”, cả cluster ngưng hoạt động. Với cluster hàng trăm petabyte, việc restart NameNode có thể mất hơn **1 tiếng**. 

      Từ Hadoop 2, tính năng **High Availability (HA)** đã ra đời: 
      - Một **Active NameNode** duy nhất xử lý request. 
      - Nhiều **Standby NameNode** chạy dự phòng. 
      Active NameNode ghi giao dịch vào **Journal Service**, và Standby NameNode đọc lại để cập nhật trạng thái. Nhờ vậy, khi Active gặp sự cố, Standby có thể tiếp quản gần như ngay lập tức. 

      **2. Java Tuning** Metadata của HDFS được NameNode lưu trong RAM, nên heap càng lớn khi hệ thống càng to. Con NameNode lớn nhất của LinkedIn được set tới **380 GB heap**, quản lý hơn **1,1 tỷ object**. 
      Heap được chia làm hai vùng: 
      - **Young generation**: Object mới tạo, bị GC sớm và nhanh. 
      - **Old generation**: Object “sống lâu”, giữ lâu dài. 
      LinkedIn giữ tỷ lệ dung lượng **Young:Old = 1:4** để tránh các đợt **Full GC**, vốn khiến NameNode dừng vài phút. 

      **3. Các tối ưu hóa khác** - **Satellite Clusters**: Dành riêng để chứa file nhỏ, giảm phình metadata. 
      - **Consistent Reads từ Standby NameNode**: Cho phép các request chỉ đọc metadata truy cập Standby, giúp Active giảm tải đáng kể. 

      Bằng các kỹ thuật này, LinkedIn đã vận hành thành công hệ thống HDFS quy mô **1 Exabyte** dữ liệu – một cột mốc ấn tượng trong thế giới Big Data và System Architecture.', 
      2, -- Machine Learning 
      1, -- admin 
      'published', 
      '2025-08-30 21:40:00'
    );`
    );

    // Bài viết ID 8: Security BootCamp 2025
    // Ethics & Policy (4)
    await db.query(
      `INSERT INTO articles (title, description, image_url, content, main_category_id, author_id, status, created_at)
    VALUES (
      'Security BootCamp 2025: Chủ đề Resilience - Tái sinh',
      'Security Bootcamp (SBC) 2025 tại Huế với chủ đề “Cyber Resilience” tập trung vào khả năng phục hồi của hệ thống trước các sự cố an ninh mạng trong bối cảnh thế giới TUNA.',
      'https://devops.vn/uploads/images/2025/08/ed65307c-47ad-41d1-bef5-025a380e5724.webp',
      'Security BootCamp 2025
      Security Bootcamp

      Thời gian diễn ra:
      12 September 2025 , 08:00 UTC+7 - 14 September 2025 , 19:30 UTC+7

      Địa điểm tổ chức:
      Khách sạn Saigon Morin Huế, Huế, Việt Nam

      ---

      **CHÍNH THỨC CÔNG BỐ BÀI TRÌNH BÀY**
      Security BootCamp 2025 | 12-14/09/2025

      **Chủ đề chính:** Resilience (Tái sinh)
      Link công bố bài trình bày: https://tinyurl.com/AgendaSBC25

      **Các lĩnh vực ưu tiên:**
      - AI & Cybersecurity
      - Data Privacy & Digital Rights
      - Ethical Hacking & Offensive Security
      - Zero Trust Architecture
      - Cyber Resilience & Incident Response

      Và các chủ đề mới nổi khác liên quan đến an toàn thông tin, bảo mật, an ninh mạng.

      ---

      **Về chủ đề chính:**
      Cyber Resilience – khả năng phục hồi của hệ thống trước các sự cố an ninh mạng – đang trở thành một chiến lược trọng yếu trong bảo vệ an toàn thông tin. Mục tiêu của nó nhằm đảm bảo khả năng khôi phục cho toàn bộ hệ thống thông tin của một tổ chức thông qua khả năng dự đoán, sức chống chịu, phục hồi nhanh chóng và thích ứng hiệu quả trước các sự cố an ninh như tấn công mạng, rò rỉ dữ liệu hay lỗi hệ thống trong khi vẫn duy trì hoạt động kinh doanh một cách liên tục.

      Trong bối cảnh thế giới đang chuyển mình từ Kỷ nguyên VUCA sang TUNA (T – Turbulence: hỗn loạn, U – Uncertainty: bất định, N – Novel: khó lường, A – Ambiguity: mơ hồ), các hình thức tấn công mạng ngày càng tinh vi và khó lường, do đó việc xây dựng năng lực Cyber Resilience không còn là một lựa chọn, mà là điều bắt buộc.

      Với vai trò là kiến trúc sư trưởng về an toàn thông tin – cho tổ chức hay cho quốc gia – nếu bạn chưa có một chiến lược Cyber Resilience rõ ràng, thì đã đến lúc phải bắt đầu hành động. Và không nơi nào tốt hơn để khởi đầu hoặc củng cố hành trình này bằng việc tham gia Security Bootcamp 2025, nơi quy tụ các chuyên gia bảo mật hàng đầu cùng những chia sẻ chuyên sâu, thiết thực.

      ---

      **Về Security Bootcamp:**
      Ra đời từ năm 2012 tại thành phố Vũng Tàu, Security Bootcamp (SBC) đã trải qua 10 kỳ tổ chức thành công, thu hút hàng ngàn chuyên gia và người làm trong lĩnh vực an toàn thông tin trên cả nước. Năm 2025, SBC trở lại với kỳ tổ chức lần thứ 11 tại Thành phố Huế, mang chủ đề “Tái sinh” (Cyber Resilience) – một lời mời gọi mạnh mẽ cùng nhau kiến tạo lại hệ thống an toàn thông tin vững chắc hơn trước mọi biến động.

      ---

      **Về Huế:**
      Chọn Huế – vùng đất văn hiến với bề dày lịch sử, văn hóa đặc sắc và truyền thống cách mạng kiên cường – làm nơi tổ chức không chỉ là sự tri ân với quá khứ mà còn là sự tiếp nối cho tương lai. Từ ngày 1/1/2025, Huế chính thức trở thành thành phố trực thuộc Trung ương – một minh chứng sống động cho sức sống bền bỉ và khả năng “tái sinh” mạnh mẽ, đúng như tinh thần của Security Bootcamp năm nay.

      ---

      **BTC Security Bootcamp 2025**
      Chủ đề: Tái sinh – Resilience
      Thời gian: 12-14/09/2025
      Địa điểm: Khách sạn SAIGON MORIN HUẾ – Thành phố Huế

      **Liên hệ BTC:**
      - Chị Lê | Email: Lentt@via.org.vn | ĐT: (+84) 919 886 918
      - Chị Chi | Email: Chidq@via.org.vn | ĐT: (+84) 977 760 394

      **Tags:** AI, Security',
      4, -- Ethics & Policy
      2, -- reader1
      'published',
      '2025-09-12'
    );`
    );

    // Bài viết ID 9: Olympic AI Việt Nam
    // AI Research (1)
    await db.query(
      `INSERT INTO articles (title, description, image_url, content, main_category_id, author_id, status, created_at)
    VALUES (
      'Đội tuyển Việt Nam giành 3 Huy chương Vàng tại Olympic AI Quốc tế 2025, lọt vào Top 4',
      'Với 3 HCV, 1 HCB, 3 HCĐ, đội tuyển Việt Nam lọt Top 4 tại Olympic Trí tuệ nhân tạo Quốc tế (IOAI 2025), khẳng định vị thế tài năng trẻ AI Việt Nam.',
      'https://devops.vn/uploads/images/2025/08/8fa69d96-07e5-4011-a48a-eae513050bc9.webp',
      'Đội tuyển Việt Nam giành 3 Huy chương Vàng tại Olympic AI Quốc tế 2025, lọt vào Top 4 toàn đoàn

      Với thành tích xuất sắc giành được 3 Huy chương Vàng, 1 Huy chương Bạc và 3 Huy chương Đồng, đội tuyển Việt Nam đã ghi danh vào nhóm 04 quốc gia và vùng lãnh thổ có thành tích cao nhất tại Olympic Trí tuệ nhân tạo Quốc tế (IOAI 2025) vừa diễn ra tại Bắc Kinh, Trung Quốc.

      Nguồn: FPT Smart Cloud

      BẮC KINH, Trung Quốc – Đội tuyển quốc gia Việt Nam đã có màn ra mắt đầy ấn tượng và thành công rực rỡ tại Olympic Trí tuệ nhân tạo Quốc tế 2025 (IOAI), một trong những đấu trường trí tuệ danh giá nhất thế giới dành cho tài năng trẻ trong lĩnh vực AI, học máy và khoa học dữ liệu, được tổ chức dưới sự bảo trợ của UNESCO.

      Vượt qua các đối thủ mạnh từ khắp nơi trên thế giới, đội tuyển Việt Nam gồm 8 học sinh xuất sắc đã mang về tổng cộng 7 huy chương, bao gồm 3 Huy chương Vàng, 1 Huy chương Bạc, 3 Huy chương Đồng và 1 giải Khuyến khích. Thành tích ấn tượng này đã giúp Việt Nam được vinh danh trong nhóm 04 đoàn có kết quả cao nhất chung cuộc, khẳng định vị thế của tài năng AI trẻ Việt Nam trên bản đồ công nghệ toàn cầu.

      Đây là những học sinh đã được tuyển chọn kỹ lưỡng từ hơn 100 thí sinh của kỳ thi Olympic Trí tuệ nhân tạo toàn quốc lần thứ nhất (VOAI 2025), dưới sự dẫn dắt và huấn luyện chuyên sâu của đội ngũ chuyên gia gồm TS. Trần Quốc Long, TS. Trần Tiến Công và TS. Châu Thành Đức.

      Một trong những yếu tố quan trọng góp phần vào thành công của đội tuyển là sự chuẩn bị kỹ lưỡng về mặt công nghệ. Trong suốt quá trình ôn luyện, các thành viên đã được tiếp cận và thực hành trên một hạ tầng AI hiện đại do FPT Smart Cloud cung cấp. Nền tảng **FPT AI Factory**, được trang bị các bộ xử lý **GPU NVIDIA H100** hàng đầu thế giới, đã tạo ra một môi trường giả lập tiệm cận với điều kiện thi đấu quốc tế.

      Việc được thực hành trên hạ tầng hiệu năng cao này đã cho phép các học sinh và huấn luyện viên có điều kiện tốt nhất để phát triển, thử nghiệm và tối ưu hóa các mô hình AI phức tạp – một yêu cầu mang tính sống còn trong các cuộc thi AI đỉnh cao.

      Thành công của đội tuyển tại IOAI 2025 không chỉ là niềm tự hào của ngành giáo dục mà còn là một minh chứng cho hiệu quả của mô hình hợp tác giữa đào tạo, nghiên cứu và doanh nghiệp công nghệ. Sự đầu tư vào việc ươm mầm và trang bị công cụ cho tài năng trẻ chính là bước đi chiến lược để nâng tầm vị thế của Việt Nam trong cuộc cách mạng công nghiệp lần thứ tư.

      **Tags:** AI, FPT Smart Cloud, IOAI, News, NVIDIA',
      1, -- AI Research
      1, -- admin
      'published',
      '2025-08-25'
    );`
    );

    // Bài viết ID 10: Meta đầu tư Gigawatt
    // Society & Future of Work (5)
    await db.query(
      `INSERT INTO articles (title, description, image_url, content, main_category_id, author_id, status, created_at)
    VALUES (
      'Meta tuyên bố đầu tư hàng trăm tỷ USD vào AI, xây dựng siêu data center quy mô Gigawatt',
      'CEO Mark Zuckerberg công bố kế hoạch đầu tư khổng lồ của Meta vào AI, xây dựng các AI cluster quy mô gigawatt để theo đuổi mục tiêu Trí tuệ tổng quát (AGI).',
      'https://devops.vn/uploads/images/2025/08/1ce29165-03b9-40c3-a747-340bbf898140.webp',
      'Meta tuyên bố đầu tư hàng trăm tỷ USD vào AI, lên kế hoạch xây dựng siêu data center quy mô Gigawatt

      devops.vn | 17/08/2025 | 11:49

      Trong một động thái đầy tham vọng, CEO Mark Zuckerberg đã công bố kế hoạch đầu tư khổng lồ của Meta vào lĩnh vực trí tuệ nhân tạo, bao gồm việc xây dựng các trung tâm dữ liệu (data center) với quy mô tiêu thụ năng lượng chưa từng có và tái cấu trúc toàn bộ bộ phận AI nhằm theo đuổi mục tiêu Trí tuệ tổng quát (AGI).

      MENLO PARK, California — Mark Zuckerberg vừa đưa ra một tuyên bố chấn động ngành công nghệ, khẳng định Meta sẽ chi hàng trăm tỷ USD trong những năm tới để phát triển AI, một cam kết đầu tư có thể định hình lại cuộc đua thống trị công nghệ tương lai. Trọng tâm của kế hoạch này là việc xây dựng AI cluster với quy mô năng lượng ở cấp độ gigawatt, một ngưỡng sức mạnh tính toán chưa từng có tiền lệ.

      Dự án đầu tiên mang tên mã **Prometheus**, được mô tả là AI cluster quy mô gigawatt đầu tiên trên thế giới. Theo sau đó là một dự án còn tham vọng hơn, **Hyperion**, với mục tiêu mở rộng quy mô lên đến 5 gigawatt. Để dễ hình dung, một gigawatt điện đủ để cung cấp năng lượng cho một thành phố lớn, cho thấy quy mô hạ tầng khổng lồ mà Meta đang hướng tới để phục vụ cho việc huấn luyện các mô hình AI thế hệ tiếp theo.

      Nguồn lực tài chính cho cam kết táo bạo này đến từ cỗ máy quảng cáo khổng lồ của Meta, vốn tạo ra doanh thu 165 tỷ USD. Theo dự báo, chi tiêu vốn (capex) của công ty trong năm 2025 sẽ rơi vào khoảng 64–72 tỷ USD, một con số vượt xa mức đầu tư của nhiều tập đoàn công nghệ hàng đầu khác.

      Song song với việc xây dựng hạ tầng, Meta cũng đang tái cấu trúc mạnh mẽ các nỗ lực phát triển AI của mình. Sau những thách thức gặp phải với mô hình ngôn ngữ **Llama 4**, công ty đã quyết định hợp nhất các nhóm nghiên cứu và phát triển dưới một mái nhà chung mang tên **Superintelligence Labs**. Phòng thí nghiệm mới này sẽ được dẫn dắt bởi hai tên tuổi lớn trong ngành là **Alexandr Wang** (CEO của Scale AI) và **Nat Friedman** (cựu CEO của GitHub), với nhiệm vụ duy nhất: đưa Meta đi đầu trong cuộc đua phát triển Trí tuệ tổng quát (Artificial General Intelligence – AGI).

      Mục tiêu cuối cùng của Meta rất rõ ràng: không chỉ dẫn đầu về nghiên cứu AGI mà còn nhanh chóng thương mại hóa các công cụ AI tiên tiến. Các công nghệ được phát triển tại Superintelligence Labs dự kiến sẽ được tích hợp sâu rộng vào toàn bộ hệ sinh thái sản phẩm của Meta, từ các ứng dụng mạng xã hội như **Facebook, Instagram, WhatsApp** cho đến nền tảng quảng cáo cốt lõi, hứa hẹn tạo ra những trải nghiệm người dùng mới và các công cụ marketing hiệu quả hơn.

      Động thái này của Meta là một lời tuyên chiến rõ ràng trong cuộc cạnh tranh AI ngày càng khốc liệt, đặt họ vào thế đối đầu trực diện với các đối thủ như **Google, Microsoft/OpenAI** và **Amazon**. Với cam kết tài chính và hạ tầng ở quy mô chưa từng thấy, Meta đang đặt cược tương lai của mình vào một kỷ nguyên do AI thống trị.

      **Tags:** AGI, AI, Data Center, Investment, Meta, News',
      5, -- Society & Future of Work
      2, -- reader1
      'published',
      '2025-08-17'
    );`
    );

    console.log("10 bài viết thực tế đã được tạo.");

    // 4. Link sub-topics (Liên kết cho ID 1 đến 10)
    await db.query(
      `INSERT INTO article_categories (article_id, category_id) VALUES
    -- Bài viết FPT (ID 1): Main ID 5, Sub ID 3
    (1, 3), -- Liên kết với 'AI Application' (3)
    
    -- Bài viết PTIT (ID 2): Main ID 2, Sub ID 1
    (2, 1), -- Liên kết với 'AI Research' (1)
    
    -- Bài viết VNPT (ID 3): Main ID 3, Sub ID 2
    (3, 2), -- Liên kết với 'Machine Learning' (2)
    
    -- Bài viết AI Cyber Security (ID 4): Main ID 3, Sub ID 4
    (4, 4), -- Liên kết với 'Ethics & Policy' (4)
    
    -- Bài viết VCS APT/AI (ID 5): Main ID 1, Sub ID 3
    (5, 3), -- Liên kết với 'AI Application' (3)

    -- Bài viết Perplexity (ID 6): Main ID 3, Sub ID 5
    (6, 5), -- Liên kết với 'Society & Future of Work' (5)

    -- Bài viết LinkedIn (ID 7): Main ID 2, Sub ID 1
    (7, 1), -- Liên kết với 'AI Research' (1)

    -- Bài viết SBC 2025 (ID 8): Main ID 4, Sub ID 3
    (8, 3), -- Liên kết với 'AI Application' (3)

    -- Bài viết IOAI 2025 (ID 9): Main ID 1, Sub ID 2
    (9, 2), -- Liên kết với 'Machine Learning' (2)

    -- Bài viết Meta (ID 10): Main ID 5, Sub ID 1
    (10, 1); -- Liên kết với 'AI Research' (1)`
    );
    console.log("Sub-topics linked for 10 real articles.");

    // 5. Insert comments
    await db.query(
      `INSERT INTO comments (article_id, user_id, content, status) VALUES
    (6, 2, 'Bài viết về AI Chủ quyền của FPT rất đáng quan tâm!', 'approved'), -- Bài 1
    (7, 1, 'Cơ hội chứng chỉ NVIDIA cho sinh viên PTIT thật tuyệt vời.', 'approved'), -- Bài 2
    (8, 2, 'Ứng dụng AI trong Reverse Engineering là xu hướng tất yếu của bảo mật.', 'pending'), -- Bài 3
    (9, 1, 'Báo cáo của Viettel Threat Intelligence rất kịp thời, thách thức AI là có thật.', 'approved'), -- Bài 4
    (9, 2, 'Rất mong chờ phần trình bày về LLM to AI Agent của VCS.', 'approved'), -- Bài 5
    
    -- Comments mới cho Bài 6 - 10
    (6, 1, 'Vừa claim Perplexity Pro thành công, cảm ơn bài viết đã chia sẻ!', 'approved'), -- Bài 6
    (7, 2, 'Scale lên 1 Exabyte mà latency vẫn dưới 10ms, kỹ thuật NameNode của LinkedIn thật đáng nể.', 'approved'), -- Bài 7
    (8, 1, 'Chủ đề Cyber Resilience rất cần thiết trong bối cảnh TUNA hiện nay.', 'approved'), -- Bài 8
    (9, 2, '3 HCV là một thành tích lịch sử của đội tuyển AI Việt Nam, rất tự hào!', 'approved'), -- Bài 9
    (10, 1, 'Quy mô Gigawatt cho data center AI là một bước đi điên rồ nhưng cần thiết của Meta.', 'approved');`
    );
    console.log("10 comments created and linked.");

    console.log(
      "Hoàn thành tạo dữ liệu thực tế AI (5 bài viết) với cấu trúc category mới."
    );
  } catch (err) {
    console.error("Lỗi khi tạo dữ liệu mẫu:", err);
  }
};

seedDatabase();
