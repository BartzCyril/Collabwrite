/**
 * RenameFileModal - Modale pour renommer un fichier
 * Projet Spé 4 - Composant de renommage de fichier
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
import { FileEdit } from 'lucide-react';

interface RenameFileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (newName: string) => void;
  currentName: string;
}

export const RenameFileModal: React.FC<RenameFileModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  currentName,
}) => {
  const [fileName, setFileName] = useState(currentName);

  useEffect(() => {
    if (isOpen) {
      setFileName(currentName);
    }
  }, [isOpen, currentName]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (fileName.trim() && fileName.trim() !== currentName) {
      onConfirm(fileName.trim());
      onClose();
    }
  };

  const handleCancel = () => {
    setFileName(currentName);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileEdit className="h-5 w-5" />
            Renommer le fichier
          </DialogTitle>
          <DialogDescription>
            Modifiez le nom de votre fichier. Le contenu ne sera pas affecté.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="rename-file">Nouveau nom</Label>
              <Input
                id="rename-file"
                placeholder="Nom du fichier"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
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
              disabled={!fileName.trim() || fileName.trim() === currentName}
            >
              Renommer
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RenameFileModal;

