import { pool } from '../config/db.config.js';

export interface DocumentRow {
  id: string;
  owner_id: string;
  folder_id: string | null;
  name: string;
  file_type: 'txt' | 'png' | 'pdf';
  description: string | null;
  content: string;
  file_path: string | null;
  size: number | null;
  created_at: string;
  updated_at: string;
}

export const documentService = {
  async listDocuments(userId: string) {
    // Récupérer les documents dont l'utilisateur est propriétaire OU collaborateur
    const result = await pool.query<DocumentRow>(
      `SELECT DISTINCT d.*
       FROM documents d
       LEFT JOIN permissions p ON d.id = p.document_id
       WHERE (d.owner_id = $1 OR p.user_id = $1)
         AND d.is_deleted = FALSE
       ORDER BY d.updated_at DESC`,
      [userId]
    );
    return result.rows;
  },

  async getDocumentById(id: string, userId: string) {
    // Récupérer le document si l'utilisateur est propriétaire OU collaborateur
    const result = await pool.query<DocumentRow>(
      `SELECT DISTINCT d.*
       FROM documents d
       LEFT JOIN permissions p ON d.id = p.document_id
       WHERE d.id = $1
         AND (d.owner_id = $2 OR p.user_id = $2)
         AND d.is_deleted = FALSE`,
      [id, userId]
    );
    return result.rows[0] || null;
  },

  async getDocumentByNameAndFolder(ownerId: string, name: string, fileType: 'txt' | 'png' | 'pdf', folderId: string | null) {
    const result = await pool.query<DocumentRow>(
      `SELECT * FROM documents
       WHERE owner_id = $1 AND name = $2 AND file_type = $3 AND folder_id IS NOT DISTINCT FROM $4 AND is_deleted = FALSE`,
      [ownerId, name, fileType, folderId]
    );
    return result.rows[0] || null;
  },

  async createDocument(ownerId: string, data: {
    name: string;
    fileType: 'txt' | 'png' | 'pdf';
    folderId?: string | null;
    description?: string | null;
    content: string;
    filePath?: string | null;
    size?: number | null;
  }) {
    const { name, fileType, folderId = null, description = null, content, filePath = null, size = null } = data;

    // Vérifier si un document avec le même nom, type et dossier existe déjà
    const existing = await this.getDocumentByNameAndFolder(ownerId, name, fileType, folderId);

    if (existing) {
      // Si un document existe, le mettre à jour au lieu d'en créer un nouveau
      const updated = await this.updateDocument(existing.id, ownerId, {
        content,
        description,
        filePath,
        size,
      });
      return updated || existing;
    }

    // Sinon, créer un nouveau document
    const newIdResult = await pool.query('SELECT gen_random_uuid() as id');
    const id = newIdResult.rows[0].id as string;

    const result = await pool.query<DocumentRow>(
      `INSERT INTO documents (id, owner_id, folder_id, name, file_type, description, content, file_path, size, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
       RETURNING *`,
      [id, ownerId, folderId, name, fileType, description, content, filePath, size]
    );

    return result.rows[0];
  },

  async updateDocument(id: string, userId: string, updates: {
    name?: string;
    folderId?: string | null;
    description?: string | null;
    content?: string | null;
    filePath?: string | null;
    size?: number | null;
  }) {
    const fields: string[] = [];
    const values: any[] = [];

    if (updates.name !== undefined) {
      fields.push('name');
      values.push(updates.name);
    }
    if (updates.folderId !== undefined) {
      fields.push('folder_id');
      values.push(updates.folderId);
    }
    if (updates.description !== undefined) {
      fields.push('description');
      values.push(updates.description);
    }
    if (updates.content !== undefined) {
      fields.push('content');
      values.push(updates.content);
    }
    if (updates.filePath !== undefined) {
      fields.push('file_path');
      values.push(updates.filePath);
    }
    if (updates.size !== undefined) {
      fields.push('size');
      values.push(updates.size);
    }

    if (fields.length === 0) {
      const existing = await this.getDocumentById(id, userId);
      return existing;
    }

    // Vérifier si l'utilisateur a le droit de modifier (propriétaire OU collaborateur avec WRITE/ADMIN)
    const accessCheck = await pool.query(
      `SELECT d.id
       FROM documents d
       LEFT JOIN permissions p ON d.id = p.document_id
       WHERE d.id = $1
         AND (d.owner_id = $2 OR (p.user_id = $2 AND p.access_level IN ('WRITE', 'ADMIN')))
         AND d.is_deleted = FALSE`,
      [id, userId]
    );

    if (accessCheck.rows.length === 0) {
      return null; // Pas de permission de modifier
    }

    const setClause = fields.map((f, idx) => `${f} = $${idx + 2}`).join(', ');
    const result = await pool.query<DocumentRow>(
      `UPDATE documents SET ${setClause}, updated_at = NOW() WHERE id = $1 AND is_deleted = FALSE RETURNING *`,
      [id, ...values]
    );
    return result.rows[0] || null;
  },

  async deleteDocument(id: string, userId: string) {
    // Vérifier si l'utilisateur a le droit de supprimer (propriétaire OU collaborateur avec ADMIN)
    const accessCheck = await pool.query(
      `SELECT d.id
       FROM documents d
       LEFT JOIN permissions p ON d.id = p.document_id
       WHERE d.id = $1
         AND (d.owner_id = $2 OR (p.user_id = $2 AND p.access_level = 'ADMIN'))`,
      [id, userId]
    );

    if (accessCheck.rows.length === 0) {
      throw new Error("Vous n'avez pas la permission de supprimer ce document");
    }

    await pool.query(
      `UPDATE documents SET is_deleted = TRUE, updated_at = NOW() WHERE id = $1`,
      [id]
    );
  },

  /**
   * Ajouter un collaborateur à un document
   * @param documentId ID du document
   * @param userId ID de l'utilisateur à ajouter comme collaborateur
   * @param accessLevel Niveau d'accès (par défaut: WRITE)
   */
  async addCollaborator(documentId: string, userId: string, accessLevel: 'READ' | 'WRITE' | 'ADMIN' = 'WRITE') {
    // Vérifier si une permission existe déjà
    const existing = await pool.query(
      `SELECT * FROM permissions WHERE document_id = $1 AND user_id = $2`,
      [documentId, userId]
    );

    if (existing.rows.length > 0) {
      // Si la permission existe déjà, la mettre à jour
      await pool.query(
        `UPDATE permissions SET access_level = $1 WHERE document_id = $2 AND user_id = $3`,
        [accessLevel, documentId, userId]
      );
      return existing.rows[0];
    }

    // Sinon, créer une nouvelle permission
    const newIdResult = await pool.query('SELECT gen_random_uuid() as id');
    const id = newIdResult.rows[0].id as string;

    const result = await pool.query(
      `INSERT INTO permissions (id, document_id, user_id, access_level, created_at)
       VALUES ($1, $2, $3, $4, NOW())
       RETURNING *`,
      [id, documentId, userId, accessLevel]
    );

    return result.rows[0];
  },

  /**
   * Récupérer les collaborateurs d'un document
   * @param documentId ID du document
   */
  async getCollaborators(documentId: string) {
    const result = await pool.query(
      `SELECT u.id, u.email, u.full_name, p.access_level, p.created_at
       FROM permissions p
       JOIN users u ON p.user_id = u.id
       WHERE p.document_id = $1`,
      [documentId]
    );

    return result.rows;
  },

  /**
   * Vérifier si un utilisateur a accès à un document
   * @param documentId ID du document
   * @param userId ID de l'utilisateur
   */
  async hasAccess(documentId: string, userId: string): Promise<boolean> {
    // Vérifier si l'utilisateur est le propriétaire
    const ownerResult = await pool.query(
      `SELECT id FROM documents WHERE id = $1 AND owner_id = $2`,
      [documentId, userId]
    );

    if (ownerResult.rows.length > 0) {
      return true;
    }

    // Vérifier si l'utilisateur a une permission
    const permissionResult = await pool.query(
      `SELECT id FROM permissions WHERE document_id = $1 AND user_id = $2`,
      [documentId, userId]
    );

    return permissionResult.rows.length > 0;
  },
};


