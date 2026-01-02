import { type Request, type Response } from 'express';
import type { AuthRequest } from '../middleware/auth.middleware.js';
import { folderService } from '../services/folder.service.js';
import type { FolderDTO, FolderUpdateDTO } from '../types/folder.types.js';

export const folderController = {
    async getFolders(req: AuthRequest, res: Response){
        try{
            const userId = req.userId;

            if(!userId){
                return res.status(401).json({ error: 'Non authentifié' });
            }

            const folders = await folderService.getFolders(userId);

            res.json(folders);
        }
        catch(error) {
            console.error('Erreur lors de la récupération des dossiers : ', error);
            res.status(500).json({ error: 'Erreur lors de la récupéraction des dossiers' });
        }
    },

    async createFolder(req: FolderDTO, res: Response){
        try{
            const userId = req.userId;

            const { name, color, folderId } = req.body;

            if(!userId){
                return res.status(401).json({ error: 'Non authentifié' });
            }

            const existingFolder = await folderService.getFolderByName(name);
            if(existingFolder.length != 0){
                return res.status(400).json({ error: 'Le dossier existe déjà' });
            }

            const folder = await folderService.createFolder(userId, name, color, folderId);

            res.status(201).json({
                id: folder.id,
                name: folder.name
            });
        }
        catch(error){
            console.error('Erreur lors de l\'ajout du dossier : ', error);
            res.status(500).json({ error: 'Erreur lors de l\'ajout du dossier' });
        }
    },

    async updateFolder(req: FolderUpdateDTO, res: Response){
        try{
            const { oldname, newname } = req.body;

            const existingFolder = await folderService.getFolderByName(newname);
            if(existingFolder.length != 0){
                return res.status(400).json({ error: 'Le dossier existe déjà' });
            }

            await folderService.updateFolder(oldname, newname);

            res.status(200);
        }
        catch(error){
            console.error('Erreur lors de la modification d\'un dossier : ', error);
            res.status(500).json({ error: 'Erreur lors de la modification d\'un dossier' });
        }
    },

    async deleteFolder(req: Request, res: Response){
        try{
            const { name } = req.query;

            if(!name || typeof name != "string") {
                return res.status(401).json({ error: 'name manquant' });
            }

            const existingFolder = await folderService.getFolderByName(name);
            if(!existingFolder){
                return res.status(404).json({ error: 'Ce dossier n\'existe pas' });
            }

            await folderService.deleteFolder(name);

            res.status(204);
        }
        catch(error){
            console.error('Erreur lors de la suppression d\'un dossier : ', error);
            res.status(500).json({ error: 'Erreur lors de la suppression d\'un dossier' });
        }
    }
}