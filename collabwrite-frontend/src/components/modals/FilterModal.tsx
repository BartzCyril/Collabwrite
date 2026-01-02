/**
 * FilterModal - Modale pour filtrer les fichiers
 * Projet Spé 4 - Composant de filtrage
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
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Filter, X } from 'lucide-react';

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: FilterOptions) => void;
  currentFilters: FilterOptions;
}

export interface FilterOptions {
  fileTypes: string[];
  tags: string[];
  authors: string[];
}

const FILE_TYPES = [
  { value: 'txt', label: 'Texte' },
  { value: 'png', label: 'Image' },
  { value: 'pdf', label: 'PDF' },
];

const COMMON_TAGS = [
  'projet',
  'notes',
  'réunion',
  'documentation',
  'important',
  'brouillon',
];

export const FilterModal: React.FC<FilterModalProps> = ({
  isOpen,
  onClose,
  onApply,
  currentFilters,
}) => {
  const [filters, setFilters] = useState<FilterOptions>(currentFilters);

  const handleToggleFileType = (type: string) => {
    setFilters((prev) => ({
      ...prev,
      fileTypes: prev.fileTypes.includes(type)
        ? prev.fileTypes.filter((t) => t !== type)
        : [...prev.fileTypes, type],
    }));
  };

  const handleToggleTag = (tag: string) => {
    setFilters((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag],
    }));
  };

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  const handleReset = () => {
    setFilters({ fileTypes: [], tags: [], authors: [] });
  };

  const handleClose = () => {
    setFilters(currentFilters);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtrer les fichiers
          </DialogTitle>
          <DialogDescription>
            Appliquez des filtres pour trouver rapidement vos fichiers.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Types de fichiers */}
          <div className="space-y-3">
            <Label>Types de fichiers</Label>
            <div className="flex flex-wrap gap-2">
              {FILE_TYPES.map((type) => (
                <Badge
                  key={type.value}
                  variant={
                    filters.fileTypes.includes(type.value) ? 'default' : 'outline'
                  }
                  className="cursor-pointer"
                  onClick={() => handleToggleFileType(type.value)}
                >
                  {type.label}
                  {filters.fileTypes.includes(type.value) && (
                    <X className="ml-1 h-3 w-3" />
                  )}
                </Badge>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-3">
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-2">
              {COMMON_TAGS.map((tag) => (
                <Badge
                  key={tag}
                  variant={filters.tags.includes(tag) ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => handleToggleTag(tag)}
                >
                  {tag}
                  {filters.tags.includes(tag) && (
                    <X className="ml-1 h-3 w-3" />
                  )}
                </Badge>
              ))}
            </div>
          </div>

          {/* Résumé des filtres */}
          {(filters.fileTypes.length > 0 || filters.tags.length > 0) && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium mb-2">Filtres actifs :</p>
              <div className="flex flex-wrap gap-2">
                {filters.fileTypes.map((type) => (
                  <Badge key={type} variant="secondary" className="text-xs">
                    {FILE_TYPES.find((t) => t.value === type)?.label}
                  </Badge>
                ))}
                {filters.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleReset}>
            Réinitialiser
          </Button>
          <Button type="button" variant="outline" onClick={handleClose}>
            Annuler
          </Button>
          <Button type="button" onClick={handleApply}>
            Appliquer les filtres
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FilterModal;

