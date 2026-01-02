/**
 * DeleteFileModal - Modale pour supprimer un fichier
 * Projet Spé 4 - Composant de confirmation de suppression de fichier
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
import { AlertTriangle, FileText, Image, FileType as FileTypeIcon } from 'lucide-react';
import type { File } from '@/types/document';

interface DeleteFileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  file: File | null;
}

export const DeleteFileModal: React.FC<DeleteFileModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  file,
}) => {
  if (!file) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const getFileIcon = () => {
    switch (file.fileType) {
      case 'png':
        return <Image className="h-4 w-4 text-primary" />;
      case 'pdf':
        return <FileTypeIcon className="h-4 w-4 text-primary" />;
      default:
        return <FileText className="h-4 w-4 text-primary" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Supprimer le fichier
          </DialogTitle>
          <DialogDescription>
            Cette action est irréversible. Êtes-vous sûr de vouloir supprimer ce fichier ?
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="rounded-lg bg-muted p-4 space-y-2">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center">
                {getFileIcon()}
              </div>
              <div className="flex-1">
                <p className="font-medium">{file.name}</p>
                <p className="text-sm text-muted-foreground">
                  {file.fileType.toUpperCase()} • Par {file.author}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-sm text-destructive font-medium">
              ⚠️ Le contenu de ce fichier sera définitivement perdu.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirm}
          >
            Supprimer définitivement
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteFileModal;

