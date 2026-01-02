import { pool } from '../config/db.config.js';
import { hashPassword } from '../utils/bcrypt.util.js';

export const adminService = {
  async createDefaultAdmin() {
    try {
      const adminEmail = process.env.DEFAULT_ADMIN_EMAIL || 'admin@gmail.com';
      const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'azerty58';
      const adminName = process.env.DEFAULT_ADMIN_NAME || 'admin';
      
      // Vérifier si l'admin existe déjà
      const existingAdmin = await pool.query(
        'SELECT id FROM users WHERE email = $1',
        [adminEmail]
      );
      
      if (existingAdmin.rows.length > 0) {
        console.log('Utilisateur admin déjà existant');
        return;
      }
      
      // Créer l'admin
      const passwordHash = await hashPassword(adminPassword);
      const resultId = await pool.query('SELECT gen_random_uuid() as id');
      const id = resultId.rows[0].id;
      
      await pool.query(
        `INSERT INTO users (id, email, password_hash, full_name, role, created_at, updated_at)
         VALUES ($1, $2, $3, $4, 'admin', NOW(), NOW())`,
        [id, adminEmail, passwordHash, adminName]
      );
      
      console.log('Utilisateur admin créé avec succès');
    } catch (error) {
      console.error('Erreur lors de la création de l\'admin:', error);
    }
  }
};
