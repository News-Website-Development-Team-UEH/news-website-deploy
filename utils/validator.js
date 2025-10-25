const validateUsername = (username) => {
    // Quy tắc: 3-20 ký tự, chỉ chứa chữ cái (hoa/thường), số, và dấu gạch dưới (_).
    const regex = /^[a-zA-Z0-9_]{3,20}$/;
    return regex.test(username);
};

const validateEmail = (email) => {
    // Quy tắc: Định dạng email cơ bản (ví dụ: user@domain.com)
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
};

const validatePassword = (password) => {
    // Quy tắc: Độ dài tối thiểu 6 ký tự.
    // quy tắc phức tạp hơn (chữ hoa, số, ký tự đặc biệt) nếu muốn tăng cường bảo mật.
    return password && password.length >= 6;
};

module.exports = {
    validateUsername,
    validateEmail,
    validatePassword,
};
