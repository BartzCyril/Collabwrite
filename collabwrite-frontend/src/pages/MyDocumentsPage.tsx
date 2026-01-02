/**
 * MyDocumentsPage - Page listant tous les documents de l'utilisateur
 * Projet Spé 4 - Gestion complète des documents avec déplacement
 */

import { MoveFileModal } from "@/components/modals/MoveFileModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/EmptyState";
import { DocumentSkeleton } from "@/components/ui/LoadingSkeleton";
import { useDocumentStore } from "@/hooks/useDocumentStore";
import type { File, FileType } from "@/types/document";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Calendar,
  Edit,
  FileText,
  FileType as FileTypeIcon,
  Folder as FolderIcon,
  Image as ImageIcon,
  Move,
  Trash2,
  User,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DeleteConfirmModal } from "@/components/modals/DeleteConfirmModal";

export const MyDocumentsPage: React.FC = () => {
  const navigate = useNavigate();
  const { files, folders, isLoading, setCurrentFile, deleteFile, loadFiles, loadFolders } =
    useDocumentStore();

  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    file?: File;
  }>({ isOpen: false });
  const [moveFileModal, setMoveFileModal] = useState<{
    isOpen: boolean;
    file?: File;
  }>({ isOpen: false });

  // Charger les données au montage
  useEffect(() => {
    loadFiles();
    loadFolders();
  }, [loadFiles, loadFolders]);

  const handleEditFile = (file: File) => {
    if (file.fileType === "txt") {
      setCurrentFile(file);
      navigate(`/editor/${file.id}`);
    } else {
      setCurrentFile(file);
      navigate(`/viewer/${file.id}`);
    }
  };

  const handleDeleteFile = (file: File) => {
    setDeleteModal({ isOpen: true, file });
  };

  const handleConfirmDelete = async () => {
    if (deleteModal.file) {
      await deleteFile(deleteModal.file.id);
    }
    setDeleteModal({ isOpen: false });
  };

  const handleMoveFile = (file: File) => {
    setMoveFileModal({ isOpen: true, file });
  };

  const formatDate = (date: Date) => {
    return formatDistanceToNow(date, { addSuffix: true, locale: fr });
  };

  const getFileIcon = (fileType: FileType) => {
    switch (fileType) {
      case "png":
        return <ImageIcon className="h-4 w-4 text-green-600 flex-shrink-0" />;
      case "pdf":
        return <FileTypeIcon className="h-4 w-4 text-red-600 flex-shrink-0" />;
      default:
        return <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />;
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        <DocumentSkeleton count={5} />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* En-tête */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
          Mes documents
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">
          Gérez tous vos documents et organisez-les dans des dossiers
        </p>
      </div>

      {/* Liste des documents */}
      {files.length === 0 ? (
        <EmptyState
          title="Aucun document"
          description="Vous n'avez pas encore de documents. Créez votre premier document depuis le tableau de bord."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
          {files.map((file) => {
            const folder = file.folderId
              ? folders.find((f) => f.id === file.folderId)
              : null;

            return (
              <Card
                key={file.id}
                className="p-3 sm:p-4 hover:shadow-md transition-shadow"
              >
                <div className="space-y-2 sm:space-y-3">
                  {/* En-tête */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      {getFileIcon(file.fileType)}
                      <h3 className="font-medium text-xs sm:text-sm text-foreground truncate">
                        {file.name}
                      </h3>
                      {file.isDirty && (
                        <div className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0" />
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  {file.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {file.description}
                    </p>
                  )}

                  {/* Badge du dossier si présent */}
                  {folder && (
                    <div className="flex items-center gap-1">
                      <Badge variant="outline" className="text-xs flex items-center gap-1">
                        <FolderIcon
                          className="h-3 w-3"
                          style={{ color: folder.color || "#3b82f6" }}
                        />
                        <span className="truncate">{folder.name}</span>
                      </Badge>
                    </div>
                  )}

                  {/* Métadonnées */}
                  <div className="space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">{file.author}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">{formatDate(file.updatedAt)}</span>
                      </div>
                    </div>

                    {/* Tags */}
                    {file.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {file.tags.slice(0, 2).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {file.tags.length > 2 && (
                          <Badge variant="secondary" className="text-xs">
                            +{file.tags.length - 2}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2 border-t justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditFile(file)}
                      className="px-2 sm:px-3"
                      title="Ouvrir"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMoveFile(file)}
                      className="px-2 text-xs"
                      title="Déplacer vers un dossier"
                    >
                      <Move className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteFile(file)}
                      className="text-destructive hover:text-destructive px-2 sm:px-3"
                      aria-label="Supprimer"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modales */}
      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false })}
        onConfirm={handleConfirmDelete}
        itemName={deleteModal.file?.name}
        warningMessage="Le contenu de ce fichier sera définitivement perdu."
      />

      <MoveFileModal
        isOpen={moveFileModal.isOpen}
        onClose={() => setMoveFileModal({ isOpen: false })}
        file={moveFileModal.file || null}
      />
    </div>
  );
};

export default MyDocumentsPage;

