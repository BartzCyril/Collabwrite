/**
 * Types TypeScript pour le système de gestion de documents avec dossiers
 * Projet Spé 4 - Structure hiérarchique unifiée
 */

export type FileType = "txt" | "png" | "pdf" | "folder";

export interface Folder {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  color?: string; // Couleur optionnelle pour le dossier
  folderId?: string | null;
  parent_id?: string | null;
  subFolders: Folder[];
}

export interface File {
  id: string;
  name: string;
  fileType: FileType;
  content: string; // Pour txt: contenu HTML, pour png/pdf: data URL ou blob URL
  folderId: string | null; // null si le fichier n'est pas dans un dossier
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  author: string;
  tags: string[];
  size?: number; // Taille du fichier en octets
  isDirty: boolean; // Indique si le fichier a des modifications non sauvegardées
}

export interface UploadedFile {
  id: string;
  name: string;
  type: "image" | "pdf";
  size: number;
  url: string; // URL simulée
  uploadedAt: Date;
  fileId?: string; // Fichier associé si applicable
}

// Types pour les actions du store Zustand unifié
export interface DocumentStore {
  // État
  files: File[];
  folders: Folder[];
  currentFile: File | null;
  currentFolder: Folder | null;
  uploadedFiles: UploadedFile[];
  isLoading: boolean;
  isSaving: boolean;
  lastSaved: Date | null;
  searchQuery: string;
  selectedTags: string[];
  sortBy: "name" | "createdAt" | "updatedAt";
  sortOrder: "asc" | "desc";
  theme: "light" | "dark";
  userPreferences: UserPreferences;

  // Actions pour les fichiers
  createFile: (
    name: string,
    fileType: FileType,
    folderId?: string | null,
    content?: string,
    uploadedFile?: globalThis.File
  ) => Promise<File>;
  updateFile: (id: string, updates: Partial<File>) => Promise<void>;
  deleteFile: (id: string) => Promise<void>;
  setCurrentFile: (file: File | null) => void;
  saveFile: (file: File) => Promise<void>;

  // Actions pour les dossiers
  createFolder: (name: string, color?: string) => Promise<Folder>;
  updateFolder: (id: string, updates: Partial<Folder>) => Promise<void>;
  deleteFolder: (id: string) => Promise<void>;
  setCurrentFolder: (folder: Folder | null) => void;

  // Actions de recherche et tri
  searchFiles: (query: string) => void;
  filterByTags: (tags: string[]) => void;
  sortFiles: (
    by: "name" | "createdAt" | "updatedAt",
    order: "asc" | "desc"
  ) => void;

  // Actions générales
  toggleTheme: () => void;
  updatePreferences: (preferences: Partial<UserPreferences>) => void;
  loadFiles: () => Promise<void>;
  loadFolders: () => Promise<void>;

  // Actions pour l'upload de fichiers
  uploadFileData: (file: globalThis.File, fileId?: string) => Promise<UploadedFile>;
  deleteUploadedFile: (id: string) => Promise<void>;
  getFilesByFileId: (fileId: string) => UploadedFile[];
}

export interface UserPreferences {
  theme: "light" | "dark" | "system";
  autoSave: boolean;
  autoSaveInterval: number;
  fontSize: "small" | "medium" | "large";
  editorMode: "wysiwyg" | "markdown";
}

// Alias pour compatibilité temporaire
export type Document = File;