import { pool } from '../config/db.config.js';

export const folderService = {
    async getFolders(userId: string) {
        const result = await pool.query(`SELECT folders.id, folders.name, folders.color, folders.parent_id, folders.created_at, folders.updated_at, users.full_name FROM folders INNER JOIN users ON folders.owner_id = users.id WHERE folders.owner_id = $1`, [userId]);
        return result.rows;
    },

    async getFolderByName(name: string){
        const result = await pool.query(`SELECT * FROM folders WHERE name = $1`, [name]);
        return result.rows || null;
    },

    async createFolder(userId: string, name: string, color: string, folderId: string | null) {
        const resultId = await pool.query('SELECT gen_random_uuid() as id');
        const id = resultId.rows[0].id;

        const result = await pool.query( 
        `INSERT INTO folders (id, name, color, owner_id, parent_id, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
        RETURNING *`,
        [id, name, color, userId, folderId]
        );

        return result.rows[0];
    },

    async updateFolder(oldname: string, newname: string){
        const result = await pool.query('UPDATE folders SET name = $1 WHERE name = $2', [newname, oldname]);
        return result.rows;
    },

    async deleteFolder(name: string) {
        const result = await pool.query('DELETE FROM folders WHERE name = $1', [name]);
        return result.rows;
    }
}