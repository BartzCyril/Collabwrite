import { type Request } from 'express';

export interface CreateDocumentBody {
  name: string;
  fileType: 'txt' | 'png' | 'pdf';
  folderId?: string | null;
  description?: string;
  content: string; // pour txt: HTML/markdown; pour png/pdf: URL ou chemin après upload
  filePath?: string | null;
  size?: number | null;
}

export interface UpdateDocumentBody {
  name?: string;
  folderId?: string | null;
  description?: string | null;
  content?: string | null;
}

export interface DocumentParams {
  id: string;
}

export type CreateDocumentDTO = Request<unknown, unknown, CreateDocumentBody> & { userId?: string };
export type UpdateDocumentDTO = Request<DocumentParams, unknown, UpdateDocumentBody> & { userId?: string };

