import { pool } from "../config/db.config.js";
import type {
  Message,
  MessageWithUser,
  CreateMessageDTO,
} from "../types/message.types.js";

export const messageService = {
  /**
   * Récupérer tous les messages d'un document
   */
  async getMessagesByDocument(documentId: string): Promise<MessageWithUser[]> {
    const result = await pool.query(
      `SELECT
        m.id,
        m.document_id,
        m.user_id,
        m.content,
        m.created_at,
        m.updated_at,
        u.full_name as user_full_name,
        u.email as user_email
       FROM messages m
       JOIN users u ON m.user_id = u.id
       WHERE m.document_id = $1
       ORDER BY m.created_at ASC`,
      [documentId]
    );

    return result.rows;
  },

  /**
   * Créer un nouveau message
   */
  async createMessage(
    userId: string,
    data: CreateMessageDTO
  ): Promise<MessageWithUser> {
    const { document_id, content } = data;

    // Créer le message
    const result = await pool.query(
      `INSERT INTO messages (user_id, document_id, content, created_at, updated_at)
       VALUES ($1, $2, $3, NOW(), NOW())
       RETURNING *`,
      [userId, document_id, content]
    );

    const message = result.rows[0];

    // Récupérer les infos utilisateur
    const userResult = await pool.query(
      `SELECT full_name, email FROM users WHERE id = $1`,
      [userId]
    );

    const user = userResult.rows[0];

    return {
      ...message,
      user_full_name: user.full_name,
      user_email: user.email,
    };
  },

  /**
   * Supprimer un message (si l'utilisateur est le créateur)
   */
  async deleteMessage(messageId: string, userId: string): Promise<boolean> {
    const result = await pool.query(
      `DELETE FROM messages WHERE id = $1 AND user_id = $2`,
      [messageId, userId]
    );

    return (result.rowCount ?? 0) > 0;
  },

  /**
   * Vérifier si un utilisateur a accès à un document
   */
  async hasAccessToDocument(
    userId: string,
    documentId: string
  ): Promise<boolean> {
    const result = await pool.query(
      `SELECT id FROM documents WHERE id = $1 AND (owner_id = $2 OR is_deleted = FALSE)`,
      [documentId, userId]
    );

    return result.rows.length > 0;
  },
};

