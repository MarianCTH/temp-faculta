const bcrypt = require('bcryptjs');
const db = require('../config/database');

class UserModel {
  static async create(email, password) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await db.execute(
      'INSERT INTO users (email, password) VALUES (?, ?)',
      [email, hashedPassword]
    );
    
    return this.findById(result.insertId);
  }

  static async findByEmail(email) {
    const [rows] = await db.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    return rows[0];
  }

  static async findById(id) {
    const [rows] = await db.execute(
      'SELECT * FROM users WHERE id = ?',
      [id]
    );
    return rows[0];
  }

  static async comparePassword(password, hashedPassword) {
    return bcrypt.compare(password, hashedPassword);
  }

  static async updateTwoFactorSecret(userId, secret) {
    await db.execute(
      'UPDATE users SET two_factor_secret = ? WHERE id = ?',
      [secret, userId]
    );
  }

  static async enableTwoFactor(userId) {
    await db.execute(
      'UPDATE users SET two_factor_enabled = true WHERE id = ?',
      [userId]
    );
  }
}

module.exports = UserModel; 