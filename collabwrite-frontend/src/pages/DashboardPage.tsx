import { CreateFileModal } from "@/components/modals/CreateFileModal";
import { DeleteConfirmModal } from "@/components/modals/DeleteConfirmModal";
import { MoveFileModal } from "@/components/modals/MoveFileModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/EmptyState";
import { DocumentSkeleton } from "@/components/ui/LoadingSkeleton";
import { useDocumentStore } from "@/hooks/useDocumentStore";
import type { File, FileType, Folder } from "@/types/document";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar, Edit, FileText, FileType as FileTypeIcon, Folder as FolderIcon, Image as ImageIcon, Move, Plus, Trash2, User, ChevronRight, ChevronDown } from "lucide-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { files, folders, isLoading, setCurrentFile, deleteFile, createFile } =
    useDocumentStore();

  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    file?: File;
  }>({ isOpen: false });
  const [showCreateFileModal, setShowCreateFileModal] = useState(false);
  const [moveFileModal, setMoveFileModal] = useState<{
    isOpen: boolean;
    file?: File;
  }>({ isOpen: false });
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

  // Charger les dossiers au montage du composant
  React.useEffect(() => {
    const loadFolders = useDocumentStore.getState().loadFolders;
    loadFolders();
  }, []);

  const handleCreateFile = () => {
    setShowCreateFileModal(true);
  };

  const handleConfirmCreateFile = async (
    name: string,
    fileType: FileType,
    uploadedFile?: globalThis.File
  ) => {
    const newFile = await createFile(
      name,
      fileType,
      null,
      fileType === "txt" ? "<p>Commencez à écrire...</p>" : "",
      uploadedFile
    );

    if (fileType === "txt") {
      navigate(`/editor/${newFile.id}`);
    } else {
      // Pour les images et PDFs, naviguer vers le viewer
      navigate(`/viewer/${newFile.id}`);
    }
  };

  const handleEditFile = (file: File) => {
    // Si c'est un fichier texte, changer le fichier actuel et naviguer vers l'éditeur
    if (file.fileType === "txt") {
      setCurrentFile(file);
      navigate(`/editor/${file.id}`);
    } else {
      // Pour png/pdf, naviguer vers le viewer dédié
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

  const formatDate = (date: Date) => {
    return formatDistanceToNow(date, { addSuffix: true, locale: fr });
  };

  const getFileIcon = (fileType: FileType) => {
    switch (fileType) {
      case 'png':
        return <ImageIcon className="h-4 w-4 text-green-600 flex-shrink-0" />;
      case 'pdf':
        return <FileTypeIcon className="h-4 w-4 text-red-600 flex-shrink-0" />;
      default:
        return <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />;
    }
  };

  const handleMoveFile = (file: File) => {
    setMoveFileModal({ isOpen: true, file });
  };

  const toggleFolder = (folderId: string) => {
    setExpandedFolders((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(folderId)) {
        newSet.delete(folderId);
      } else {
        newSet.add(folderId);
      }
      return newSet;
    });
  };

  const handleFolderFileClick = (file: File) => {
    if (file.fileType === "txt") {
      setCurrentFile(file);
      navigate(`/editor/${file.id}`);
    } else {
      setCurrentFile(file);
      navigate(`/viewer/${file.id}`);
    }
  };

  const recentFiles = files
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
    .slice(0, 5);

  const flattenFolders = (folders: Folder[]) => {
    let result: Folder[] = [];
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

  const recentFolders = allFolders
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
    .slice(0, 5);

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index} className="p-3 sm:p-4 animate-pulse">
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-8 bg-muted rounded w-1/2"></div>
              </div>
            </Card>
          ))}
        </div>
        <DocumentSkeleton count={5} />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Tableau de bord
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Gérez vos documents et suivez votre activité
          </p>
        </div>
        <Button 
          onClick={handleCreateFile} 
          size="lg"
          className="w-full sm:w-auto"
        >
          <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
          <span className="text-sm sm:text-base">Nouveau fichier</span>
        </Button>
      </div>

      {/* Dossiers récents */}
      {recentFolders.length > 0 && (
        <div className="space-y-3 sm:space-y-4">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-foreground">
              Dossiers récents
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
            {recentFolders.map((folder) => {
              const folderFiles = files.filter((f) => f.folderId === folder.id);
              const isExpanded = expandedFolders.has(folder.id);

              return (
                <Card
                  key={folder.id}
                  className="p-3 sm:p-4 hover:shadow-md transition-shadow"
                  style={{height: 'fit-content !important'}}
                >
                  <div className="space-y-2 sm:space-y-3">
                    {/* En-tête du dossier */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleFolder(folder.id)}
                          className="h-5 w-5 p-0 flex-shrink-0"
                        >
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </Button>
                        <div
                          className="flex items-center gap-2 min-w-0 flex-1 cursor-pointer"
                          onClick={() => toggleFolder(folder.id)}
                        >
                          <FolderIcon
                            className="h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0"
                            style={{ color: folder.color || "#3b82f6" }}
                          />
                          <h3 className="font-medium text-xs sm:text-sm text-foreground truncate">
                            {folder.name}
                          </h3>
                          <Badge variant="secondary" className="text-xs flex-shrink-0">
                            {folderFiles.length}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Date de modification */}
                    <div className="flex items-center gap-1 text-xs text-muted-foreground pl-7">
                      <Calendar className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">{formatDate(folder.updatedAt)}</span>
                    </div>

                    {/* Fichiers du dossier */}
                    {isExpanded && (
                      <div className="pl-7 space-y-2 border-t pt-2">
                        {folderFiles.length === 0 ? (
                          <div className="text-center py-2 text-xs text-muted-foreground">
                            Aucun fichier dans ce dossier
                          </div>
                        ) : (
                          folderFiles.map((file) => (
                            <Card
                              key={file.id}
                              className="p-2 hover:shadow-md transition-shadow cursor-pointer"
                              onClick={() => handleFolderFileClick(file)}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                  {getFileIcon(file.fileType)}
                                  <span className="font-medium text-xs text-foreground truncate">
                                    {file.name}
                                  </span>
                                  {file.isDirty && (
                                    <div className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0" />
                                  )}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleMoveFile(file);
                                    }}
                                    className="h-5 w-5 p-0"
                                    title="Déplacer"
                                  >
                                    <Move className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            </Card>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Documents récents */}
      <div className="space-y-3 sm:space-y-4">
        <div>
          <h2 className="text-lg sm:text-xl font-semibold text-foreground">
            Fichiers récents
          </h2>
        </div>

        {files.length === 0 ? (
          <EmptyState
            title="Aucun document"
            description="Commencez par créer votre premier document pour organiser vos idées et votre travail."
            action={{
              label: "Créer un document",
              onClick: handleCreateFile,
            }}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
            {recentFiles.map((file) => (
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
                  {file.folderId && (() => {
                    const folder = allFolders.find(f => f.id === file.folderId);
                    return folder ? (
                      <div className="flex items-center gap-1">
                        <Badge variant="outline" className="text-xs flex items-center gap-1">
                          <FolderIcon className="h-3 w-3" style={{ color: folder.color || '#3b82f6' }} />
                          <span className="truncate">{folder.name}</span>
                        </Badge>
                      </div>
                    ) : null;
                  })()}

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
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="text-xs"
                          >
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
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMoveFile(file);
                      }}
                      className="px-2 sm:px-3"
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
                      title="Supprimer"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Modales */}
      <CreateFileModal
        isOpen={showCreateFileModal}
        onClose={() => setShowCreateFileModal(false)}
        onConfirm={handleConfirmCreateFile}
      />

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

export default DashboardPage;
