import api from './api';

export interface FolderData {
    name: string;
    color?: string;
    folderId?: string | null;
}

export interface FolderUpdateData {
    oldname: string;
    newname: string;
}

export const folderService = {
    async getFolders() {
        const response = await api.get('/folder/all');
        return response.data;
    },

    async createFolder(data: FolderData) {
        const response = await api.post('/folder/add', data);
        return response.data;
    },

    async updateFolder(data: FolderUpdateData){
        const response = await api.put('/folder/update', data);
        return response.data;
    },

    async deleteFolder(data: FolderData) {
        const response = await api.delete(`/folder/delete?name=${data.name}`);
        return response.data;
    }
}