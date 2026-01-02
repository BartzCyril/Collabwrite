/**
 * CreateFolderModal - Modale pour créer un nouveau dossier
 * Projet Spé 4 - Composant de création de dossier
 */

import React, { useState } from 'react';
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
import { FolderPlus, Folder } from 'lucide-react';

interface CreateFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (name: string, color: string, folderId: string | null) => void;
  folderId?: string | null;
}

const FOLDER_COLORS = [
  { name: 'Bleu', value: '#3b82f6' },
  { name: 'Vert', value: '#10b981' },
  { name: 'Rouge', value: '#ef4444' },
  { name: 'Jaune', value: '#f59e0b' },
  { name: 'Violet', value: '#8b5cf6' },
  { name: 'Rose', value: '#ec4899' },
  { name: 'Cyan', value: '#06b6d4' },
  { name: 'Gris', value: '#6b7280' },
];

export const CreateFolderModal: React.FC<CreateFolderModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  folderId
}) => {
  const [folderName, setFolderName] = useState('');
  const [selectedColor, setSelectedColor] = useState(FOLDER_COLORS[0].value);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (folderName.trim()) {
      onConfirm(folderName.trim(), selectedColor, folderId ?? null);
      setFolderName('');
      setSelectedColor(FOLDER_COLORS[0].value);
      onClose();
    }
  };

  const handleCancel = () => {
    setFolderName('');
    setSelectedColor(FOLDER_COLORS[0].value);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderPlus className="h-5 w-5" />
            Créer un nouveau dossier
          </DialogTitle>
          <DialogDescription>
            Organisez vos fichiers en créant un nouveau dossier personnalisé.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6 py-4">
            {/* Nom du dossier */}
            <div className="space-y-2">
              <Label htmlFor="folder-name">Nom du dossier</Label>
              <Input
                id="folder-name"
                placeholder="Ex: Mes projets"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                autoFocus
              />
            </div>

            {/* Sélection de couleur */}
            <div className="space-y-2">
              <Label>Couleur du dossier</Label>
              <div className="grid grid-cols-4 gap-3">
                {FOLDER_COLORS.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setSelectedColor(color.value)}
                    className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all hover:scale-105 ${
                      selectedColor === color.value
                        ? 'border-primary bg-primary/5'
                        : 'border-transparent bg-muted/50 hover:border-muted-foreground/20'
                    }`}
                  >
                    <Folder
                      className="h-8 w-8"
                      style={{ color: color.value }}
                    />
                    <span className="text-xs text-muted-foreground">
                      {color.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Aperçu */}
            <div className="space-y-2">
              <Label>Aperçu</Label>
              <div className="p-4 rounded-lg bg-muted/50 border">
                <div className="flex items-center gap-2">
                  <Folder
                    className="h-6 w-6"
                    style={{ color: selectedColor }}
                  />
                  <span className="font-medium">
                    {folderName || 'Nom du dossier'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCancel}>
              Annuler
            </Button>
            <Button type="submit" disabled={!folderName.trim()}>
              Créer le dossier
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateFolderModal;

