/**
 * Store Zustand pour la gestion d'état global des documents
 * Projet Spé 4 - Gestion centralisée de l'état unifié
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { DocumentStore, UserPreferences, Folder, File, UploadedFile, FileType } from '@/types/document';
import { documentService } from '@/services/document.service';
import { folderService } from '@/services/folder.service';

// Données simulées pour les dossiers
const mockFolders: Folder[] = [
  {
    id: 'folder-1',
    name: 'Projets',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-16'),
    color: '#3b82f6',
  },
  {
    id: 'folder-2',
    name: 'Notes',
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20'),
    color: '#10b981',
  }
];

// Les fichiers sont désormais chargés depuis l'API
const initialFiles: File[] = [];

const mockUploadedFiles: UploadedFile[] = [
  {
    id: 'uploaded-1',
    name: 'diagramme.png',
    type: 'image',
    size: 1024000,
    url: '/uploads/diagramme.png',
    uploadedAt: new Date('2024-01-15'),
    fileId: 'file-1',
  },
  {
    id: 'uploaded-2',
    name: 'rapport.pdf',
    type: 'pdf',
    size: 2048000,
    url: '/uploads/rapport.pdf',
    uploadedAt: new Date('2024-01-16'),
    fileId: 'file-2',
  }
];

const defaultPreferences: UserPreferences = {
  theme: 'system',
  autoSave: true,
  autoSaveInterval: 30000, // 30 secondes
  fontSize: 'medium',
  editorMode: 'wysiwyg',
};

export const useDocumentStore = create<DocumentStore>()(
  persist(
    (set, get) => ({
      // État initial
      files: initialFiles,
      folders: mockFolders,
      uploadedFiles: mockUploadedFiles,
      currentFile: null,
      currentFolder: null,
      isLoading: false,
      isSaving: false,
      lastSaved: null,
      searchQuery: '',
      selectedTags: [],
      sortBy: 'updatedAt',
      sortOrder: 'desc',
      theme: 'light',
      userPreferences: defaultPreferences,

      // Actions pour les fichiers
      createFile: async (
        name: string,
        fileType: FileType,
        folderId: string | null = null,
        content = '',
        uploadedFile?: globalThis.File
      ) => {
        const toDataUrl = (file: globalThis.File) =>
          new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result));
            reader.onerror = (e) => reject(e);
            reader.readAsDataURL(file);
          });

        let finalContent = content;
        let size: number | undefined = undefined;
        if (uploadedFile) {
          finalContent = await toDataUrl(uploadedFile);
          size = uploadedFile.size;
        }

        const created = await documentService.createDocument({
          name,
          fileType,
          folderId,
          content: finalContent || (fileType === 'txt' ? '<p>Nouveau document</p>' : ''),
          size,
        });

        const mapped: File = {
          id: created.id,
          name: created.name,
          fileType: created.file_type,
          content: created.content,
          folderId: created.folder_id,
          description: created.description ?? undefined,
          createdAt: new Date(created.created_at),
          updatedAt: new Date(created.updated_at),
          author: 'Moi',
          tags: [],
          size: created.size ?? undefined,
          isDirty: false,
        };

        set((state) => {
          // Vérifier si le fichier existe déjà dans le store (même id)
          const existingIndex = state.files.findIndex(f => f.id === mapped.id);
          
          // Vérifier aussi s'il existe un fichier avec le même nom, type et dossier (pour éviter les doublons)
          const duplicateIndex = state.files.findIndex(f => 
            f.id !== mapped.id && 
            f.name === mapped.name && 
            f.fileType === mapped.fileType && 
            f.folderId === mapped.folderId
          );
          
          let updatedFiles = [...state.files];
          
          if (existingIndex >= 0) {
            // Si le fichier existe avec le même ID, le remplacer
            updatedFiles[existingIndex] = mapped;
          } else if (duplicateIndex >= 0) {
            // Si un fichier avec le même nom/type/dossier existe mais avec un ID différent, le remplacer
            updatedFiles[duplicateIndex] = mapped;
          } else {
            // Sinon, ajouter le nouveau fichier au début de la liste
            updatedFiles = [mapped, ...updatedFiles];
          }
          
          // Supprimer les autres doublons potentiels (même nom/type/dossier mais ID différent)
          updatedFiles = updatedFiles.filter((f) => {
            if (f.id === mapped.id) return true; // Garder le fichier actuel
            const isDuplicate = f.name === mapped.name && 
                               f.fileType === mapped.fileType && 
                               f.folderId === mapped.folderId;
            return !isDuplicate; // Supprimer les doublons
          });
          
          return {
            files: updatedFiles,
            currentFile: mapped,
          };
        });
        
        return mapped;
      },

      updateFile: async (id: string, updates: Partial<File>) => {
        const payload: any = {};
        if (updates.name !== undefined) payload.name = updates.name;
        if (updates.folderId !== undefined) payload.folderId = updates.folderId;
        if (updates.description !== undefined) payload.description = updates.description;
        if (updates.content !== undefined) payload.content = updates.content;

        const updated = await documentService.updateDocument(id, payload);

        set((state) => ({
          files: state.files.map((file) =>
            file.id === id
              ? {
                  ...file,
                  // Utiliser les valeurs des updates si disponibles, sinon celles de l'API, sinon les anciennes
                  name: updates.name !== undefined ? updates.name : (updated.name ?? file.name),
                  folderId: updates.folderId !== undefined ? updates.folderId : (updated.folder_id !== undefined ? updated.folder_id : file.folderId),
                  description: updates.description !== undefined ? updates.description : (updated.description ?? file.description),
                  content: updates.content !== undefined ? updates.content : (updated.content ?? file.content),
                  updatedAt: new Date(updated.updated_at),
                  isDirty: false,
                }
              : file
          ),
          currentFile:
            state.currentFile?.id === id
              ? {
                  ...state.currentFile,
                  name: updates.name !== undefined ? updates.name : (updated.name ?? state.currentFile.name),
                  folderId: updates.folderId !== undefined ? updates.folderId : (updated.folder_id !== undefined ? updated.folder_id : state.currentFile.folderId),
                  description: updates.description !== undefined ? updates.description : (updated.description ?? state.currentFile.description),
                  content: updates.content !== undefined ? updates.content : (updated.content ?? state.currentFile.content),
                  updatedAt: new Date(updated.updated_at),
                  isDirty: false,
                }
              : state.currentFile,
        }));
      },

      deleteFile: async (id: string) => {
        await documentService.deleteDocument(id);
        set((state) => ({
          files: state.files.filter((file) => file.id !== id),
          currentFile: state.currentFile?.id === id ? null : state.currentFile,
        }));
      },

      setCurrentFile: (file: File | null) => {
        set({ currentFile: file });
      },

      saveFile: async (file: File) => {
        set({ isSaving: true });
        await documentService.updateDocument(file.id, {
          name: file.name,
          folderId: file.folderId,
          description: file.description,
          content: file.content,
        });

        set((state) => ({
          files: state.files.map((f) => (f.id === file.id ? { ...file, isDirty: false } : f)),
          currentFile: file.id === state.currentFile?.id ? { ...file, isDirty: false } : state.currentFile,
          isSaving: false,
          lastSaved: new Date(),
        }));
      },

      // Actions pour les dossiers
      createFolder: async (name: string, color?: string, folderId?: string) => {
        const newFolder: Folder = {
          id: `folder-${Date.now()}`,
          name,
          createdAt: new Date(),
          updatedAt: new Date(),
          color: color || '#3b82f6',
          folderId: folderId || null
        };

        set((state) => ({
          folders: [newFolder, ...state.folders],
          currentFolder: newFolder,
        }));

        return newFolder;
      },

      updateFolder: async (id: string, updates: Partial<Folder>) => {
        set((state) => ({
          folders: state.folders.map((folder) =>
            folder.id === id
              ? { ...folder, ...updates, updatedAt: new Date() }
              : folder
          ),
          currentFolder:
            state.currentFolder?.id === id
              ? { ...state.currentFolder, ...updates, updatedAt: new Date() }
              : state.currentFolder,
        }));
      },

      deleteFolder: async (id: string) => {
        // Supprimer aussi tous les fichiers du dossier
        set((state) => ({
          files: state.files.filter((file) => file.folderId !== id),
          folders: state.folders.filter((folder) => folder.id !== id),
          currentFolder:
            state.currentFolder?.id === id ? null : state.currentFolder,
        }));
      },

      setCurrentFolder: (folder: Folder | null) => {
        set({ currentFolder: folder });
      },

      // Actions de recherche et tri
      searchFiles: (query: string) => {
        set({ searchQuery: query });
      },

      filterByTags: (tags: string[]) => {
        set({ selectedTags: tags });
      },

      sortFiles: (by: 'name' | 'createdAt' | 'updatedAt', order: 'asc' | 'desc') => {
        set({ sortBy: by, sortOrder: order });
      },

      // Actions générales
      toggleTheme: () => {
        set((state) => ({
          theme: state.theme === 'light' ? 'dark' : 'light',
        }));
      },

      updatePreferences: (preferences: Partial<UserPreferences>) => {
        set((state) => ({
          userPreferences: { ...state.userPreferences, ...preferences },
        }));
      },

      loadFiles: async () => {
        set({ isLoading: true });
        try {
          const docs = await documentService.getDocuments();
          const mapped: File[] = docs.map((d: any) => ({
            id: d.id,
            name: d.name,
            fileType: d.file_type,
            content: d.content,
            folderId: d.folder_id,
            description: d.description ?? undefined,
            createdAt: new Date(d.created_at),
            updatedAt: new Date(d.updated_at),
            author: 'Moi',
            tags: [],
            size: d.size ?? undefined,
            isDirty: false,
          }));
          set({ files: mapped });
        } finally {
          set({ isLoading: false });
        }
      },

      loadFolders: async () => {
        try {
          let foldersData = await folderService.getFolders();
          foldersData = getSubfolders(foldersData);
          const mapped: Folder[] = foldersData.map((f: any) => ({
            id: f.id,
            name: f.name,
            createdAt: new Date(f.created_at),
            updatedAt: new Date(f.updated_at),
            color: f.color || '#3b82f6',
            subFolders: f.subFolders
          }));
          // Forcer une nouvelle référence pour garantir le re-render
          set({ folders: [...mapped] });
        } catch (error) {
          console.error('Erreur lors du chargement des dossiers:', error);
        }
      },

      // Actions pour l'upload de fichiers (uploadedFiles pour métadonnées)
      uploadFileData: async (file: globalThis.File, fileId?: string): Promise<UploadedFile> => {
        const newFile: UploadedFile = {
          id: `uploaded-${Date.now()}`,
          name: file.name,
          type: file.type.startsWith('image/') ? 'image' : 'pdf',
          size: file.size,
          url: URL.createObjectURL(file), // URL simulée
          uploadedAt: new Date(),
          fileId,
        };

        set((state) => ({
          uploadedFiles: [newFile, ...state.uploadedFiles],
        }));

        return newFile;
      },

      deleteUploadedFile: async (id: string) => {
        set((state) => ({
          uploadedFiles: state.uploadedFiles.filter((file) => file.id !== id),
        }));
      },

      getFilesByFileId: (fileId: string) => {
        return get().uploadedFiles.filter((file) => file.fileId === fileId);
      },
    }),
    {
      name: 'document-store',
      partialize: (state) => ({
        theme: state.theme,
        userPreferences: state.userPreferences,
        sortBy: state.sortBy,
        sortOrder: state.sortOrder,
      }),
    }
  )
);

// Sélecteurs utiles
export const useFilteredFiles = () => {
  const { files, searchQuery, selectedTags, sortBy, sortOrder } = useDocumentStore();

  let filtered = files;

  // Filtrage par recherche
  if (searchQuery) {
    filtered = filtered.filter(
      (file) =>
        file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        file.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        file.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (file.description && file.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }

  // Filtrage par tags
  if (selectedTags.length > 0) {
    filtered = filtered.filter((file) =>
      selectedTags.every((tag) => file.tags.includes(tag))
    );
  }

  // Tri
  filtered.sort((a, b) => {
    let aValue: any, bValue: any;

    switch (sortBy) {
      case 'name':
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      case 'createdAt':
        aValue = a.createdAt.getTime();
        bValue = b.createdAt.getTime();
        break;
      case 'updatedAt':
        aValue = a.updatedAt.getTime();
        bValue = b.updatedAt.getTime();
        break;
      default:
        return 0;
    }

    if (sortOrder === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });

  return filtered;
};

const getSubfolders = (folders: Folder[]) => {
  const toRemove: string[] = [];
  for(const folder of folders){
    folder.subFolders = [];
    if(folder.parent_id){
      const parentFolder = folders.find((f) => f.id == folder.parent_id);
      if(parentFolder){
        parentFolder.subFolders.push(folder);
        toRemove.push(folder.id);
      }
    }
  }

  return folders.filter((f) => !toRemove.includes(f.id));
}

// Récupérer les fichiers d'un dossier spécifique
export const useFilesByFolder = (folderId: string | null) => {
  const files = useDocumentStore((state) => state.files);
  return files.filter((file) => file.folderId === folderId);
};

// Récupérer les fichiers sans dossier (racine)
export const useRootFiles = () => {
  const files = useDocumentStore((state) => state.files);
  return files.filter((file) => file.folderId === null);
};

export const useFileStats = () => {
  const files = useDocumentStore((state) => state.files);

  return {
    total: files.length,
    dirty: files.filter((file) => file.isDirty).length,
    recent: files.filter(
      (file) => Date.now() - file.updatedAt.getTime() < 7 * 24 * 60 * 60 * 1000
    ).length,
  };
};

// Alias pour compatibilité temporaire
export const useFilteredDocuments = useFilteredFiles;
export const useDocumentStats = useFileStats;