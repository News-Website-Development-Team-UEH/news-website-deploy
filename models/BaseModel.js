const db = require('../utils/db');

class BaseModel {
    constructor(id = null) {
        this.id = id;
    }

    // Phương thức lưu bản ghi (thêm mới hoặc cập nhật)
    async save() {
        throw new Error("Phải override phương thức save trong class con");
    }

    // Phương thức xóa bản ghi
    async delete() {
        if (!this.id) throw new Error("ID không tồn tại.");
        const tableName = this.constructor.tableName;
        const sql = `DELETE FROM ${tableName} WHERE id=?`;
        const [result] = await db.query(sql, [this.id]);
        return result.affectedRows > 0;
    }

    // Phương thức tìm bản ghi theo ID
    static async findById(id) {
        const tableName = this.tableName;
        const [rows] = await db.query(`SELECT * FROM ${tableName} WHERE id=?`, [id]);
        if (rows.length === 0) return null;
        return new this(rows[0]);
    }

    // Phương thức tìm tất cả bản ghi
    static async findAll() {
        const tableName = this.tableName;
        const [rows] = await db.query(`SELECT * FROM ${tableName} ORDER BY id ASC`);
        return rows.map(row => new this(row));
    }
}

module.exports = BaseModel;
