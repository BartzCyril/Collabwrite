import { pool } from '../config/db.config.js';
import { verifyRefreshToken, generateAccessToken, generateRefreshToken } from '../utils/jwt.util.js';

export const authService = {
  async createSession(userId: string, refreshToken: string, ipAddress?: string, userAgent?: string) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 jours
    
    const result = await pool.query(
      `INSERT INTO sessions (user_id, refresh_token, ip_address, user_agent, expires_at, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())
       RETURNING *`,
      [userId, refreshToken, ipAddress || null, userAgent || null, expiresAt]
    );
    
    return result.rows[0];
  },

  async findSessionByToken(refreshToken: string) {
    const result = await pool.query(
      'SELECT * FROM sessions WHERE refresh_token = $1 AND expires_at > NOW()',
      [refreshToken]
    );
    
    return result.rows[0] || null;
  },

  async deleteSession(refreshToken: string) {
    await pool.query('DELETE FROM sessions WHERE refresh_token = $1', [refreshToken]);
  },

  async deleteUserSessions(userId: string) {
    await pool.query('DELETE FROM sessions WHERE user_id = $1', [userId]);
  },

  async getUserSecret(userId: string) {
    const result = await pool.query(
      'SELECT totp_secret, totp_enabled FROM users WHERE id = $1',
      [userId]
    );
    
    const user = result.rows[0];
    
    return {
      secret: user?.totp_secret || null,
      enabled: user?.totp_enabled || false,
    };
  },

  async refreshAccessToken(refreshToken: string) {
    const session = await this.findSessionByToken(refreshToken);
    
    if (!session) {
      throw new Error('Session introuvable ou expirée');
    }

    const decoded = verifyRefreshToken(refreshToken);
    const newAccessToken = generateAccessToken({
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    });

    return newAccessToken;
  },
}; 