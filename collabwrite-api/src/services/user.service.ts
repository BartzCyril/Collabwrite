import { pool } from '../config/db.config.js';
import { hashPassword, comparePassword } from '../utils/bcrypt.util.js';

export const userService = {
  async createUser(email: string, password: string, fullName: string) {
    const passwordHash = await hashPassword(password);
    // Utiliser pgcrypto pour générer un UUID
    const resultId = await pool.query('SELECT gen_random_uuid() as id');
    const id = resultId.rows[0].id;
    
    const result = await pool.query(
      `INSERT INTO users (id, email, password_hash, full_name, created_at, updated_at)
       VALUES ($1, $2, $3, $4, NOW(), NOW())
       RETURNING *`,
      [id, email, passwordHash, fullName]
    );
    
    return result.rows[0];
  },

  async findUserByEmail(email: string) {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0] || null;
  },

  async findUserById(id: string) {
    const result = await pool.query(
      `SELECT id, email, full_name, totp_enabled, role, created_at
       FROM users WHERE id = $1`,
      [id]
    );
    
    const user = result.rows[0];
    if (!user) return null;
    
    return {
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      totpEnabled: user.totp_enabled,
      role: user.role,
      createdAt: user.created_at,
    };
  },

  async updateUser2FA(userId: string, totpSecret: string | null, totpEnabled: boolean) {
    if (totpSecret) {
      await pool.query(
        `UPDATE users SET totp_secret = $1, totp_enabled = $2, updated_at = NOW()
         WHERE id = $3`,
        [totpSecret, totpEnabled, userId]
      );
    } else if (!totpEnabled) {
      // Désactiver la 2FA et supprimer le secret
      await pool.query(
        `UPDATE users SET totp_secret = NULL, totp_enabled = $1, updated_at = NOW()
         WHERE id = $2`,
        [totpEnabled, userId]
      );
    } else {
      // Mettre à jour juste totp_enabled sans changer le secret
      await pool.query(
        `UPDATE users SET totp_enabled = $1, updated_at = NOW()
         WHERE id = $2`,
        [totpEnabled, userId]
      );
    }
    
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
    return result.rows[0];
  },

  async verifyUserCredentials(email: string, password: string) {
    const user = await this.findUserByEmail(email);
    
    if (!user) {
      return null;
    }

    const isValid = await comparePassword(password, user.password_hash);
    
    if (!isValid) {
      return null;
    }

    // Vérifier si l'utilisateur est bloqué
    if (user.is_blocked) {
      throw new Error('Compte bloqué');
    }

    return user;
  },

  async updateProfile(userId: string, fullName: string, email: string) {
    const result = await pool.query(
      `UPDATE users SET full_name = $1, email = $2, updated_at = NOW()
       WHERE id = $3
       RETURNING *`,
      [fullName, email, userId]
    );

    // Vérifier si une ligne a été mise à jour
    if (!result.rows || result.rows.length === 0) {
      throw new Error('Utilisateur introuvable');
    }

    return {
      id: result.rows[0].id,
      email: result.rows[0].email,
      fullName: result.rows[0].full_name,
      totpEnabled: result.rows[0].totp_enabled,
      role: result.rows[0].role,
      createdAt: result.rows[0].created_at,
    };
  },

  async updatePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
    
    if (!user.rows[0]) {
      throw new Error('Utilisateur introuvable');
    }

    const isValid = await comparePassword(currentPassword, user.rows[0].password_hash);
    if (!isValid) {
      throw new Error('Mot de passe actuel incorrect');
    }

    const newPasswordHash = await hashPassword(newPassword);
    await pool.query(
      `UPDATE users SET password_hash = $1, updated_at = NOW()
       WHERE id = $2`,
      [newPasswordHash, userId]
    );

    return true;
  },

  // Méthodes pour l'administration
  async getAllUsers() {
    const result = await pool.query(
      `SELECT id, email, full_name, role, totp_enabled, is_blocked, created_at
       FROM users
       ORDER BY created_at DESC`
    );
    
    return result.rows.map(user => ({
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      role: user.role,
      totpEnabled: user.totp_enabled,
      isBlocked: user.is_blocked,
      createdAt: user.created_at
    }));
  },

  async updateUserBlockStatus(userId: string, isBlocked: boolean) {
    const result = await pool.query(
      `UPDATE users SET is_blocked = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING id, email, full_name, role, totp_enabled, is_blocked, created_at`,
      [isBlocked, userId]
    );

    if (!result.rows[0]) {
      throw new Error('Utilisateur introuvable');
    }

    const user = result.rows[0];
    return {
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      role: user.role,
      totpEnabled: user.totp_enabled,
      isBlocked: user.is_blocked,
      createdAt: user.created_at
    };
  },

  async updateUserByAdmin(userId: string, updates: { fullName?: string; email?: string; role?: string }) {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    if (updates.fullName !== undefined) {
      fields.push(`full_name = $${paramIndex}`);
      values.push(updates.fullName);
      paramIndex++;
    }

    if (updates.email !== undefined) {
      fields.push(`email = $${paramIndex}`);
      values.push(updates.email);
      paramIndex++;
    }

    if (updates.role !== undefined) {
      fields.push(`role = $${paramIndex}`);
      values.push(updates.role);
      paramIndex++;
    }

    if (fields.length === 0) {
      throw new Error('Aucune mise à jour à effectuer');
    }

    fields.push(`updated_at = NOW()`);
    values.push(userId);

    const query = `
      UPDATE users 
      SET ${fields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING id, email, full_name, role, totp_enabled, is_blocked, created_at
    `;

    const result = await pool.query(query, values);

    if (!result.rows[0]) {
      throw new Error('Utilisateur introuvable');
    }

    const user = result.rows[0];
    return {
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      role: user.role,
      totpEnabled: user.totp_enabled,
      isBlocked: user.is_blocked,
      createdAt: user.created_at
    };
  },
}; 