/**
 * RenameFolderModal - Modale pour renommer un dossier
 * Projet Spé 4 - Composant de renommage de dossier
 */

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FolderEdit } from 'lucide-react';

interface RenameFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (oldName: string, newName: string) => void;
  currentName: string;
}

export const RenameFolderModal: React.FC<RenameFolderModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  currentName,
}) => {
  const [folderName, setFolderName] = useState(currentName);

  useEffect(() => {
    if (isOpen) {
      setFolderName(currentName);
    }
  }, [isOpen, currentName]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (folderName.trim() && folderName.trim() !== currentName) {
      onConfirm(currentName, folderName.trim());
      onClose();
    }
  };

  const handleCancel = () => {
    setFolderName(currentName);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderEdit className="h-5 w-5" />
            Renommer le dossier
          </DialogTitle>
          <DialogDescription>
            Modifiez le nom de votre dossier. Les fichiers ne seront pas affectés.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="rename-folder">Nouveau nom</Label>
              <Input
                id="rename-folder"
                placeholder="Nom du dossier"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                autoFocus
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCancel}>
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={!folderName.trim() || folderName.trim() === currentName}
            >
              Renommer
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RenameFolderModal;

