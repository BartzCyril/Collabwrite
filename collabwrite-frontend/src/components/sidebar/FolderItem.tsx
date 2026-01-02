import { CreateFileModal } from "@/components/modals/CreateFileModal";
import { DeleteFileModal } from "@/components/modals/DeleteFileModal";
import { DeleteFolderModal } from "@/components/modals/DeleteFolderModal";
import { RenameFileModal } from "@/components/modals/RenameFileModal";
import { RenameFolderModal } from "@/components/modals/RenameFolderModal";
import { MoveFileModal } from "@/components/modals/MoveFileModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDocumentStore } from "@/hooks/useDocumentStore";
import type { File, FileType, Folder as FolderType } from "@/types/document";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import {
  ChevronDown,
  ChevronRight,
  FileText,
  FileType as FileTypeIcon,
  Folder,
  Image,
  MoreHorizontal,
  Move,
  Plus,
} from "lucide-react";
import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { folderService } from "@/services/folder.service";

interface FolderItemProps {
  folder: FolderType;
  fileTypeFilter?: "all" | "txt" | "image" | "pdf";
}

export const FolderItem: React.FC<FolderItemProps> = ({
  folder,
  fileTypeFilter = "all",
}) => {
  const currentFile = useDocumentStore((state) => state.currentFile);
  const setCurrentFile = useDocumentStore((state) => state.setCurrentFile);
  const createFile = useDocumentStore((state) => state.createFile);
  const updateFile = useDocumentStore((state) => state.updateFile);
  const updateFolder = useDocumentStore((state) => state.updateFolder);
  const deleteFile = useDocumentStore((state) => state.deleteFile);
  const deleteFolder = useDocumentStore((state) => state.deleteFolder);
  const loadFolders = useDocumentStore((state) => state.loadFolders);
  const files = useDocumentStore((state) => state.files);
  const folders = useDocumentStore((state) => state.folders);
  const searchQuery = useDocumentStore((state) => state.searchQuery);
  const sortBy = useDocumentStore((state) => state.sortBy);
  const sortOrder = useDocumentStore((state) => state.sortOrder);
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showRenameFileModal, setShowRenameFileModal] = useState(false);
  const [showDeleteFileModal, setShowDeleteFileModal] = useState(false);  
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFileForMove, setSelectedFileForMove] = useState<File | null>(null);
  const [showMoveFileModal, setShowMoveFileModal] = useState(false);
  const [folderForCreateFile, setFolderForCreateFile] = useState<FolderType | null>(null);
  const [renameFolder, setRenameFolder] = useState<FolderType | null>(null);
  const [deleteFolder2, setDeleteFolder2] = useState<FolderType | null>(null);

  const organiseFilesInFolder = (folders: FolderType[], files: File[]) => {
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
  let organiseFiles = organiseFilesInFolder(folders, files);

  // Récupérer les fichiers de ce dossier depuis le store
  let folderFiles = organiseFiles.find((file) => file.folderId === folder.id)?.listFiles;

  // Appliquer le filtre de type
  if (fileTypeFilter !== "all") {
    /* folderFiles =
      fileTypeFilter === "image"
        ? folderFiles?.filter((file) => file.fileType === "png")
        : folderFiles?.filter((file) => file.fileType === fileTypeFilter); */
    
    const result =
      fileTypeFilter === "image"
        ? folderFiles?.filter((file) => file.fileType === "png")
        : folderFiles?.filter((file) => file.fileType === fileTypeFilter)

    organiseFiles = organiseFilesInFolder(folders, result);
  }

  // Filtrer selon la recherche
  if (searchQuery) {
    const result = files?.filter(
      (file) =>
        file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        file.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        file.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (file.description &&
          file.description.toLowerCase().includes(searchQuery.toLowerCase()))
    )

    organiseFiles = organiseFilesInFolder(folders, result);
  }

  // Appliquer le tri
  folderFiles?.sort((a, b) => {
    let aValue: any, bValue: any;

    switch (sortBy) {
      case "name":
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      case "createdAt":
        aValue = a.createdAt.getTime();
        bValue = b.createdAt.getTime();
        break;
      case "updatedAt":
        aValue = a.updatedAt.getTime();
        bValue = b.updatedAt.getTime();
        break;
      default:
        return 0;
    }

    if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
    if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  // Auto-expand le dossier s'il y a une recherche/filtre et qu'il contient des fichiers correspondants
  React.useEffect(() => {
    const hasSearchOrFilter = searchQuery || fileTypeFilter !== "all";
    const hasMatchingFiles = folderFiles.length > 0;

    if (hasSearchOrFilter && hasMatchingFiles) {
      setIsExpanded(true);
    } else if (!searchQuery && fileTypeFilter === "all") {
      setIsExpanded(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, fileTypeFilter]);

  const handleToggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const handleCreateFile = (folder: FolderType) => {
    setFolderForCreateFile(folder);
  };

  const handleConfirmCreateFile = async (
    name: string,
    fileType: FileType,
    uploadedFile?: globalThis.File
  ) => {
    const newFile = await createFile(
      name,
      fileType,
      folderForCreateFile?.id,
      fileType === "txt" ? "<p>Commencez à écrire...</p>" : "",
      uploadedFile
    );

    // Si c'est un fichier texte, naviguer vers l'éditeur
    if (fileType === "txt") {
      setCurrentFile(newFile);
      navigate(`/editor/${newFile.id}`);
    } else {
      // Pour les fichiers png/pdf, on pourrait naviguer vers une vue de fichier
      // Pour l'instant, on ne fait rien de spécial
      setCurrentFile(newFile);
    }
  };

  const handleFileClick = (file: File) => {
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

  const handleOpenRenameModal = (folder: FolderType) => {
    setRenameFolder(folder);
  };

  const handleConfirmRename = async (oldname: string, newname: string) => {
    try{
      // Mise à jour optimiste dans le store
      const folderToUpdate = folders.find(f => f.name === oldname);
      if (folderToUpdate) {
        updateFolder(folderToUpdate.id, { name: newname });
      }
      // Puis mettre à jour depuis l'API
      await folderService.updateFolder({ oldname, newname });
      await loadFolders();
      setRenameFolder(null);
    }
    catch (err: unknown){
      // En cas d'erreur, recharger pour restaurer l'état correct
      await loadFolders();
      console.error("Erreur lors de la mise à jour d'un dossier:", err);
    }
  };

  const handleOpenDeleteModal = (folder: FolderType) => {
    setDeleteFolder2(folder);
  };

  const handleConfirmDelete =  async (name: string) => {
    try{
      // Mise à jour optimiste dans le store
      const folderToDelete = folders.find(f => f.name === name);
      if (folderToDelete) {
        deleteFolder(folderToDelete.id);
      }
      // Puis supprimer depuis l'API
      await folderService.deleteFolder({ name });
      // Recharger depuis l'API pour s'assurer que tout est synchronisé
      await loadFolders();
      setDeleteFolder2(null);
    }
    catch (err: unknown){
      // En cas d'erreur, recharger pour restaurer l'état correct
      await loadFolders();
      console.error("Erreur lors de la suppression d'un dossier:", err);
    }
  };

  const handleOpenRenameFileModal = (file: File, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFile(file);
    setShowRenameFileModal(true);
  };

  const handleConfirmRenameFile = (newName: string) => {
    if (selectedFile) {
      updateFile(selectedFile.id, { name: newName });
    }
  };

  const handleOpenDeleteFileModal = (file: File, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFile(file);
    setShowDeleteFileModal(true);
  };

  const handleConfirmDeleteFile = () => {
    if (selectedFile) {
      deleteFile(selectedFile.id);
      if (currentFile?.id === selectedFile.id) {
        setCurrentFile(null);
        navigate("/dashboard");
      }
    }
  };

  const formatDate = (date: Date) => {
    return formatDistanceToNow(date, { addSuffix: true, locale: fr });
  };

  const getFileIcon = (fileType: FileType) => {
    switch (fileType) {
      case "png":
        return <Image className="h-4 w-4 text-green-600" />;
      case "pdf":
        return <FileTypeIcon className="h-4 w-4 text-red-600" />;
      default:
        return <FileText className="h-4 w-4 text-blue-600" />;
    }
  };

  // Drag and drop handlers pour les fichiers
  const handleFileDragStart = (e: React.DragEvent, file: File) => {
    e.stopPropagation();
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("fileId", file.id);
  };

  const folderCard = (folder: FolderType) => {
      // Drag and drop handlers
    const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      e.dataTransfer.dropEffect = "move";
      setIsDragOver(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);

      const fileId = e.dataTransfer.getData("fileId");
      if (fileId) {
        // Déplacer le fichier dans ce dossier
        updateFile(fileId, { folderId: folder.id });
      }
    };

    const folderFilesSubFolder = organiseFiles.find((f) => f.folderId == folder.id)?.listFiles;

    return (
      <div key={folder.id}>
          <Card
            className={`p-3 hover:shadow-md transition-shadow ${
              isDragOver ? "ring-2 ring-primary bg-primary/10" : ""
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleToggleExpanded}
                  className="h-6 w-6 p-0"
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>

                <div
                  className="flex items-center gap-2 min-w-0 flex-1 cursor-pointer"
                  onClick={handleToggleExpanded}
                >
                  <Folder
                    className="h-4 w-4 flex-shrink-0"
                    style={{ color: folder.color || "#3b82f6" }}
                  />
                  <span className="font-medium text-sm text-foreground truncate">
                    {folder.name}
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    {folderFilesSubFolder?.length}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCreateFile(folder)}
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
          </Card>

          {/* Modales pour le dossier */}
          <RenameFolderModal
            isOpen={!!renameFolder}
            onClose={() => setRenameFolder(null)}
            onConfirm={handleConfirmRename}
            currentName={renameFolder?.name || ""}
          />

          <DeleteFolderModal
            isOpen={!!deleteFolder2}
            onClose={() => setDeleteFolder2(null)}
            onConfirm={handleConfirmDelete}
            folder={deleteFolder2}
          />

          {/* Modale de création de fichier */}
          <CreateFileModal
            isOpen={!!folderForCreateFile}
            onClose={() => setFolderForCreateFile(null)}
            onConfirm={handleConfirmCreateFile}
            folderId={folderForCreateFile?.id || ""}
          />

      {/* Fichiers du dossier */}
      {isExpanded && (
        <div className="ml-6 space-y-1">
          {folderFilesSubFolder?.map((file) => (
            <Card
              key={file.id}
              draggable
              onDragStart={(e) => handleFileDragStart(e, file)}
              className={`group p-2 cursor-pointer transition-all hover:shadow-md ${
                currentFile?.id === file.id
                  ? "ring-2 ring-primary bg-primary/5"
                  : "hover:bg-muted/50"
              }`}
              onClick={() => handleFileClick(file)}
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {getFileIcon(file.fileType)}
                    <h4 className="font-medium text-xs text-foreground truncate flex-1">
                      {file.name}
                    </h4>
                  </div>
                  <div className="flex items-center gap-1">
                    {file.isDirty && (
                      <div className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0" />
                    )}
                    {/* Bouton Déplacer visible sur mobile */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-5 w-5 p-0 md:hidden opacity-70 hover:opacity-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFileForMove(file);
                        setShowMoveFileModal(true);
                      }}
                      title="Déplacer vers un dossier"
                    >
                      <Move className="h-3 w-3" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        asChild
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 hover:opacity-100"
                        >
                          <MoreHorizontal className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <DropdownMenuItem
                          onClick={(e) => handleOpenRenameFileModal(file, e)}
                        >
                          Renommer
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => handleOpenDeleteFileModal(file, e)}
                          className="text-destructive"
                        >
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{file.author}</span>
                  <span>{formatDate(file.updatedAt)}</span>
                </div>

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
            </Card>
          ))}
        </div>
      )}
      </div>
    )
  }

  return (
    <div className="space-y-1">
      {/* En-tête du dossier */}
      {folderCard(folder)}
      {/* Fichiers du dossier */}
      {isExpanded && (
        <div className="ml-6 space-y-1">
          {
            folder.subFolders.map((subfolder) => {
              return(
                <>
                  {folderCard(subfolder)}
                </>
              )
            })
          }
          {(folderFiles?.length === 0 && folder.subFolders.length === 0) && (
            <div className="p-2 text-xs text-muted-foreground text-center">
              Aucun fichier ou dossier dans ce dossier
            </div>
          )}
        </div>
      )}

      {/* Modales pour les fichiers */}
      {selectedFile && (
        <>
          <RenameFileModal
            isOpen={showRenameFileModal}
            onClose={() => {
              setShowRenameFileModal(false);
              setSelectedFile(null);
            }}
            onConfirm={handleConfirmRenameFile}
            currentName={selectedFile.name}
          />

          <DeleteFileModal
            isOpen={showDeleteFileModal}
            onClose={() => {
              setShowDeleteFileModal(false);
              setSelectedFile(null);
            }}
            onConfirm={handleConfirmDeleteFile}
            file={selectedFile}
          />
        </>
      )}
      
      {/* Modal de déplacement de fichier */}
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

export default FolderItem;
