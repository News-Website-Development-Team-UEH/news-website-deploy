const BaseModel = require('./BaseModel');
const db = require('../utils/db');

class Category extends BaseModel {
    static tableName = 'categories';

    constructor(data = {}) {
        super(data.id);
        this.name = data.name;
        this.description = data.description || '';
    }

    validate() {
        if (!this.name || this.name.length < 2 || this.name.length > 100)
            throw new Error("Tên chuyên mục phải dài từ 2 đến 100 ký tự.");
        if (this.description && this.description.length > 500)
            throw new Error("Mô tả chuyên mục không được vượt quá 500 ký tự.");
    }

    async save() {
        this.validate();
        if (this.id) {
            const sql = `UPDATE categories SET name=?, description=? WHERE id=?`;
            await db.query(sql, [this.name, this.description, this.id]);
        } else {
            const sql = `INSERT INTO categories (name, description) VALUES (?, ?)`;
            const [result] = await db.query(sql, [this.name, this.description]);
            this.id = result.insertId;
        }
        return this;
    }
}

module.exports = Category;
