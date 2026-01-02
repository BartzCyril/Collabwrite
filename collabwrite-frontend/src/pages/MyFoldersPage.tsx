/**
 * MyFoldersPage - Page listant tous les dossiers de l'utilisateur
 * Projet Spé 4 - Gestion complète des dossiers avec possibilité de déplacer des documents
 */

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/EmptyState";
import { DocumentSkeleton } from "@/components/ui/LoadingSkeleton";
import { useDocumentStore } from "@/hooks/useDocumentStore";
import type { File, Folder } from "@/types/document";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Calendar,
  ChevronRight,
  Folder as FolderIcon,
  FolderOpen,
  MoreHorizontal,
  Plus,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RenameFolderModal } from "@/components/modals/RenameFolderModal";
import { DeleteFolderModal } from "@/components/modals/DeleteFolderModal";
import { MoveFileModal } from "@/components/modals/MoveFileModal";
import { folderService } from "@/services/folder.service";
import { CreateFileModal } from "@/components/modals/CreateFileModal";
import type { FileType } from "@/types/document";

export const MyFoldersPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    folders,
    files,
    isLoading,
    loadFolders,
    loadFiles,
    updateFolder,
    deleteFolder,
    createFile,
    setCurrentFile,
  } = useDocumentStore();

  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null);
  const [showMoveFileModal, setShowMoveFileModal] = useState(false);
  const [selectedFileForMove, setSelectedFileForMove] = useState<File | null>(null);
  const [showCreateFileModal, setShowCreateFileModal] = useState(false);
  const [folderForCreateFile, setFolderForCreateFile] = useState<string | null>(null);

  // Charger les données au montage
  useEffect(() => {
    loadFolders();
    loadFiles();
  }, [loadFolders, loadFiles]);

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

  const handleOpenRenameModal = (folder: Folder) => {
    setSelectedFolder(folder);
    setShowRenameModal(true);
  };

  const handleConfirmRename = async (oldname: string, newname: string) => {
    try {
      const folderToUpdate = folders.find((f) => f.name === oldname);
      if (folderToUpdate) {
        updateFolder(folderToUpdate.id, { name: newname });
      }
      await folderService.updateFolder({ oldname, newname });
      await loadFolders();
      setShowRenameModal(false);
      setSelectedFolder(null);
    } catch (err: unknown) {
      await loadFolders();
      console.error("Erreur lors de la mise à jour d'un dossier:", err);
    }
  };

  const handleOpenDeleteModal = (folder: Folder) => {
    setSelectedFolder(folder);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async (name: string) => {
    try {
      const folderToDelete = folders.find((f) => f.name === name);
      if (folderToDelete) {
        deleteFolder(folderToDelete.id);
      }
      await folderService.deleteFolder({ name });
      await loadFolders();
      setShowDeleteModal(false);
      setSelectedFolder(null);
    } catch (err: unknown) {
      await loadFolders();
      console.error("Erreur lors de la suppression d'un dossier:", err);
    }
  };

  const handleCreateFile = (folderId: string) => {
    setFolderForCreateFile(folderId);
    setShowCreateFileModal(true);
  };

  const handleConfirmCreateFile = async (
    name: string,
    fileType: FileType,
    uploadedFile?: globalThis.File
  ) => {
    const folderId = folderForCreateFile;
    const newFile = await createFile(
      name,
      fileType,
      folderId,
      fileType === "txt" ? "<p>Commencez à écrire...</p>" : "",
      uploadedFile
    );

    if (fileType === "txt") {
      setCurrentFile(newFile);
      navigate(`/editor/${newFile.id}`);
    } else {
      setCurrentFile(newFile);
      navigate(`/viewer/${newFile.id}`);
    }
    setShowCreateFileModal(false);
    setFolderForCreateFile(null);
  };

  const handleMoveFile = (file: File) => {
    setSelectedFileForMove(file);
    setShowMoveFileModal(true);
  };

  const handleFileClick = (file: File) => {
    if (file.fileType === "txt") {
      setCurrentFile(file);
      navigate(`/editor/${file.id}`);
    } else {
      setCurrentFile(file);
      navigate(`/viewer/${file.id}`);
    }
  };

  const formatDate = (date: Date) => {
    return formatDistanceToNow(date, { addSuffix: true, locale: fr });
  };

  const organiseFilesInFolder = (folders: Folder[], files: File[]) => {
    const organiseFiles = [];
    for(const folder of folders){
      let listFiles = files.filter((f) => f.folderId == folder.id)
      organiseFiles.push({
        folderId: folder.id,
        listFiles: listFiles
      });

      if(!folder.subFolders) continue;

      for(const subFolder of folder.subFolders){
        listFiles = files.filter((f) => f.folderId == subFolder.id)
        organiseFiles.push({
          folderId: subFolder.id,
          listFiles: listFiles
        });
      }
    }

    return organiseFiles;
  }

  const organiseFiles = organiseFilesInFolder(folders, files);

  const fileCard = (file: File) => {
    return(
      <Card
        key={file.id}
        className="p-2 hover:shadow-md transition-shadow cursor-pointer"
        onClick={() => handleFileClick(file)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1 min-w-0">
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
              <FolderOpen className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </Card>
    )
  }

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
          Mes dossiers
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">
          Organisez vos documents dans des dossiers
        </p>
      </div>

      {/* Liste des dossiers */}
      {folders.length === 0 ? (
        <EmptyState
          title="Aucun dossier"
          description="Créez votre premier dossier depuis le tableau de bord pour organiser vos documents."
        />
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {folders.map((folder) => {
            const folderFiles = organiseFiles.find((f) => f.folderId === folder.id)?.listFiles;
            const subFolders = folder.subFolders;
            const isExpanded = expandedFolders.has(folder.id);

            return (
              <Card key={folder.id} className="p-3 sm:p-4 hover:shadow-md transition-shadow">
                <div className="space-y-3">
                  {/* En-tête du dossier */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleFolder(folder.id)}
                        className="h-6 w-6 p-0"
                      >
                        {isExpanded ? (
                          <ChevronRight className="h-4 w-4 rotate-90" />
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
                        <span className="font-medium text-sm sm:text-base text-foreground truncate">
                          {folder.name}
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          {folderFiles?.length}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCreateFile(folder.id)}
                        className="h-6 w-6 p-0"
                        title="Nouveau fichier"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            <MoreHorizontal className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleOpenRenameModal(folder)}>
                            Renommer
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleOpenDeleteModal(folder)}
                            className="text-destructive"
                          >
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  {/* Date de modification */}
                  <div className="flex items-center gap-1 text-xs text-muted-foreground px-8">
                    <Calendar className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">{formatDate(folder.updatedAt)}</span>
                  </div>

                  {/* Fichiers du dossier */}
                  {isExpanded && (
                    <div className="pl-8 space-y-2 border-t pt-3">
                      {folderFiles?.length === 0 && subFolders.length === 0 ? (
                        <div className="text-center py-4 text-sm text-muted-foreground">
                          Aucun fichier ou sous-dossier dans ce dossier
                        </div>
                      ) : (
                        <>
                          {subFolders.map((subFolder) => {
                            const folderFilesSubFolder = organiseFiles.find((f) => f.folderId === subFolder.id)?.listFiles;
                            return (
                              <>
                                <Card key={subFolder.id} className="p-3 sm:p-4 hover:shadow-md transition-shadow">
                                  <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2 min-w-0 flex-1">
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => toggleFolder(subFolder.id)}
                                          className="h-6 w-6 p-0"
                                        >
                                          {isExpanded ? (
                                            <ChevronRight className="h-4 w-4 rotate-90" />
                                          ) : (
                                            <ChevronRight className="h-4 w-4" />
                                          )}
                                        </Button>

                                        <div
                                          className="flex items-center gap-2 min-w-0 flex-1 cursor-pointer"
                                          onClick={() => toggleFolder(subFolder.id)}
                                        >
                                          <FolderIcon
                                            className="h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0"
                                            style={{ color: subFolder.color || "#3b82f6" }}
                                          />
                                          <span className="font-medium text-sm sm:text-base text-foreground truncate">
                                            {subFolder.name}
                                          </span>
                                          <Badge variant="secondary" className="text-xs">
                                            {folderFilesSubFolder?.length}
                                          </Badge>
                                        </div>
                                      </div>  
                                    </div>  
                                  </div>  
                                </Card>
                                {folderFilesSubFolder?.map((file) => (
                                  <div className="pl-8">
                                    {fileCard(file)}
                                  </div>
                                ))}
                              </>
                            )
                          })}

                          {folderFiles?.map((file) => (
                            fileCard(file)
                          ))}
                        </>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modales */}
      {selectedFolder && (
        <>
          <RenameFolderModal
            isOpen={showRenameModal}
            onClose={() => {
              setShowRenameModal(false);
              setSelectedFolder(null);
            }}
            onConfirm={handleConfirmRename}
            currentName={selectedFolder.name}
          />

          <DeleteFolderModal
            isOpen={showDeleteModal}
            onClose={() => {
              setShowDeleteModal(false);
              setSelectedFolder(null);
            }}
            onConfirm={handleConfirmDelete}
            folder={selectedFolder}
          />
        </>
      )}

      <CreateFileModal
        isOpen={showCreateFileModal}
        onClose={() => {
          setShowCreateFileModal(false);
          setFolderForCreateFile(null);
        }}
        onConfirm={handleConfirmCreateFile}
        folderId={folderForCreateFile}
      />

      <MoveFileModal
        isOpen={showMoveFileModal}
        onClose={() => {
          setShowMoveFileModal(false);
          setSelectedFileForMove(null);
        }}
        file={selectedFileForMove}
      />
    </div>
  );
};

export default MyFoldersPage;

