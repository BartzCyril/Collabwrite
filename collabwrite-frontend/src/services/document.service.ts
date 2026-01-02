import api from './api';
import type { FileType } from '@/types/document';

export interface CreateDocumentData {
  name: string;
  fileType: FileType;
  folderId?: string | null;
  description?: string;
  content: string;
  filePath?: string | null;
  size?: number | null;
}

export interface UpdateDocumentData {
  name?: string;
  folderId?: string | null;
  description?: string | null;
  content?: string | null;
}

export const documentService = {
  async getDocuments() {
    const res = await api.get('/document');
    return res.data;
  },

  async createDocument(data: CreateDocumentData) {
    const res = await api.post('/document', data);
    return res.data;
  },

  async updateDocument(id: string, data: UpdateDocumentData) {
    const res = await api.patch(`/document/${id}`, data);
    return res.data;
  },

  async deleteDocument(id: string) {
    await api.delete(`/document/${id}`);
  },
};


