/**
 * MoveFileModal - Modale pour déplacer un fichier vers un dossier
 * Projet Spé 4 - Composant de déplacement de fichier (alternative mobile au drag & drop)
 */

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Folder, FolderOpen } from 'lucide-react';
import type { File, Folder as FolderType } from '@/types/document';
import { useDocumentStore } from '@/hooks/useDocumentStore';
import { Card } from '@/components/ui/card';

interface MoveFileModalProps {
  isOpen: boolean;
  onClose: () => void;
  file: File | null;
}

export const MoveFileModal: React.FC<MoveFileModalProps> = ({
  isOpen,
  onClose,
  file,
}) => {
  const folders = useDocumentStore((state) => state.folders);
  const updateFile = useDocumentStore((state) => state.updateFile);
  const files = useDocumentStore((state) => state.files);

  const handleMoveToFolder = (folderId: string | null) => {
    if (!file) return;
    
    updateFile(file.id, { folderId });
    onClose();
  };

  if (!file) return null;

  const flattenFolders = (folders: FolderType[]) => {
    let result: FolderType[] = [];
    for(const folder of folders){
      let updatedDate = folder.updatedAt;
      if(!updatedDate){
        if(typeof folder.updated_at === "string"){
          updatedDate = new Date(folder.updated_at);
        }
      }
      const normalizedFolder = {
        ...folder,
        updatedAt: typeof folder.updatedAt === "string"
          ? new Date(updatedDate)
          : updatedDate
      }
      result.push(normalizedFolder);
      if(folder.subFolders && folder.subFolders.length > 0){
        result = result.concat(flattenFolders(folder.subFolders));
      }
    }
  
    return result;
  }

  const allFolders = flattenFolders(folders);

  // Compter les fichiers par dossier pour afficher le nombre
  const getFolderFileCount = (folderId: string | null) => {
    return files.filter(f => f.folderId === folderId).length;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] !mx-0 sm:!mx-4">
        <DialogHeader>
          <DialogTitle>Déplacer "{file.name}"</DialogTitle>
          <DialogDescription>
            Choisissez le dossier de destination ou la racine.
          </DialogDescription>
        </DialogHeader>

        <div className="p-4 space-y-2 max-h-[400px] overflow-y-auto">
          {/* Option Racine */}
          <Card
            className={`p-3 cursor-pointer transition-all hover:shadow-md ${
              file.folderId === null ? 'ring-2 ring-primary bg-primary/5' : ''
            }`}
            onClick={() => handleMoveToFolder(null)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <FolderOpen className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">Racine</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {getFolderFileCount(null)} fichier{getFolderFileCount(null) !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              {file.folderId === null && (
                <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
              )}
            </div>
          </Card>

          {/* Liste des dossiers */}
          {allFolders.map((folder) => (
            <Card
              key={folder.id}
              className={`p-3 cursor-pointer transition-all hover:shadow-md ${
                file.folderId === folder.id ? 'ring-2 ring-primary bg-primary/5' : ''
              }`}
              onClick={() => handleMoveToFolder(folder.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <Folder
                    className="h-5 w-5 flex-shrink-0"
                    style={{ color: folder.color || '#3b82f6' }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{folder.name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {getFolderFileCount(folder.id)} fichier{getFolderFileCount(folder.id) !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                {file.folderId === folder.id && (
                  <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                )}
              </div>
            </Card>
          ))}

          {folders.length === 0 && (
            <div className="text-center py-8 text-sm text-muted-foreground">
              Aucun dossier disponible
            </div>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Annuler
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MoveFileModal;

