import React from 'react';
import { FileText, FileType as FileTypeIcon, Folder, Image as ImageIcon, Move } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import type { File } from '@/types/document';
import { useDocumentStore } from '@/hooks/useDocumentStore';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { MoveFileModal } from '@/components/modals/MoveFileModal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface DocumentItemProps {
  file: File;
}

export const DocumentItem: React.FC<DocumentItemProps> = ({ file }) => {
  const { currentFile, setCurrentFile, updateFile, folders } = useDocumentStore();
  const navigate = useNavigate();
  const isActive = currentFile?.id === file.id;
  const [showMoveModal, setShowMoveModal] = React.useState(false);

  // Trouver le dossier du fichier
  const folder = file.folderId ? folders.find(f => f.id === file.folderId) : null;

  const handleClick = () => {
    // Si c'est un fichier texte, changer le fichier actuel et naviguer vers l'éditeur
    if (file.fileType === 'txt') {
      setCurrentFile(file);
      navigate(`/editor/${file.id}`);
    } else {
      // Pour png/pdf, naviguer vers le viewer dédié
      setCurrentFile(file);
      navigate(`/viewer/${file.id}`);
    }
  };

  const formatDate = (date: Date) => {
    return formatDistanceToNow(date, { addSuffix: true, locale: fr });
  };

  const getFileIcon = () => {
    switch (file.fileType) {
      case 'png':
        return <ImageIcon className="h-4 w-4 text-green-600 flex-shrink-0" />;
      case 'pdf':
        return <FileTypeIcon className="h-4 w-4 text-red-600 flex-shrink-0" />;
      default:
        return <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />;
    }
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('fileId', file.id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const draggedFileId = e.dataTransfer.getData('fileId');

    // Si on drop un fichier sur lui-même, ne rien faire
    if (draggedFileId === file.id) {
      return;
    }

    // Déplacer le fichier draggé au même niveau que ce fichier (folderId)
    updateFile(draggedFileId, { folderId: file.folderId });
  };

  const handleMoveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMoveModal(true);
  };

  return (
    <>
      <Card
        draggable
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`p-3 cursor-pointer transition-all hover:shadow-md group ${
          isActive ? 'ring-2 ring-primary bg-primary/5' : 'hover:bg-muted/50'
        }`}
        onClick={handleClick}
      >
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              {getFileIcon()}
              <h3 className="font-medium text-sm text-foreground truncate">{file.name}</h3>
              {file.isDirty && <div className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0" />}
            </div>
            {/* Bouton Déplacer visible sur mobile et au hover */}
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 md:hidden opacity-70 hover:opacity-100"
              onClick={handleMoveClick}
              title="Déplacer vers un dossier"
            >
              <Move className="h-3 w-3" />
            </Button>
          </div>
          {file.description && (
            <p className="text-xs text-muted-foreground line-clamp-2">{file.description}</p>
          )}
          {/* Badge du dossier si présent */}
          {folder && (
            <div className="flex items-center gap-1">
              <Badge variant="outline" className="text-xs flex items-center gap-1">
                <Folder className="h-3 w-3" style={{ color: folder.color || '#3b82f6' }} />
                <span className="truncate">{folder.name}</span>
              </Badge>
            </div>
          )}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{file.author}</span>
            <span>{formatDate(file.updatedAt)}</span>
          </div>
          {file.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {file.tags.slice(0, 3).map((tag) => (
                <span key={tag} className="px-2 py-1 text-xs bg-muted text-muted-foreground rounded-full">
                  {tag}
                </span>
              ))}
              {file.tags.length > 3 && (
                <span className="px-2 py-1 text-xs bg-muted text-muted-foreground rounded-full">
                  +{file.tags.length - 3}
                </span>
              )}
            </div>
          )}
        </div>
      </Card>
      <MoveFileModal
        isOpen={showMoveModal}
        onClose={() => setShowMoveModal(false)}
        file={file}
      />
    </>
  );
};

export default DocumentItem;
