import { CreateFileModal } from "@/components/modals/CreateFileModal";
import { CreateFolderModal } from "@/components/modals/CreateFolderModal";
import { FilterModal } from "@/components/modals/FilterModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDocumentStore } from "@/hooks/useDocumentStore";
import type { FileType } from "@/types/document";
import {
  Filter,
  FolderPlus,
  Plus,
  Search,
  SortAsc,
  SortDesc,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FolderList } from "./FolderList";
import { folderService } from "@/services/folder.service";

export const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const {
    searchQuery,
    searchFiles,
    sortBy,
    sortOrder,
    sortFiles,
    createFile,
    loadFolders,
  } = useDocumentStore();
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [showCreateFileModal, setShowCreateFileModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [folderListRefreshKey, setFolderListRefreshKey] = useState(0);
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  const [fileTypeFilter, setFileTypeFilter] = useState<
    "all" | "txt" | "image" | "pdf"
  >("all");
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Synchroniser localSearchQuery avec searchQuery du store
  useEffect(() => {
    setLocalSearchQuery(searchQuery);
  }, [searchQuery]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalSearchQuery(value);

    // Débouncer la mise à jour du store (300ms)
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      searchFiles(value);
    }, 500);
  };

  // Nettoyer le timer au démontage
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const handleOpenCreateFileModal = () => {
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
    }
  };

  const handleOpenCreateFolderModal = () => {
    setShowCreateFolderModal(true);
  };

  const handleConfirmCreateFolder = async (name: string, color: string, folderId: string | null) => {
    try{
      await folderService.createFolder({ name, color, folderId });
      // Recharger les dossiers depuis l'API pour mettre à jour le store
      await loadFolders();
      // Rafraîchir aussi la liste pour s'assurer que tout est à jour
      setFolderListRefreshKey((prev) => prev + 1);
    }
    catch (err: unknown){
      const error = err as { response?: { data?: { error?: string } } }
      console.error(error.response?.data?.error || "Erreur lors de l'ajout du dossier", err);
    }
  };

  const handleSort = () => {
    const newOrder = sortOrder === "asc" ? "desc" : "asc";
    sortFiles(sortBy, newOrder);
  };

  const handleFilterChange = (filter: "all" | "txt" | "image" | "pdf") => {
    setFileTypeFilter(filter);
  };

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="p-2 sm:p-3 md:p-4 border-b">
        <div className="space-y-2 sm:space-y-3 md:space-y-4">
          {/* Boutons de création */}
          <div className="flex sm:flex-col flex-row gap-2">
            <Button
              onClick={handleOpenCreateFolderModal}
              className="flex-1 text-xs sm:text-sm p-2"
              size="sm"
            >
              <FolderPlus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Nouveau dossier</span>
              <span className="sm:hidden">Dossier</span>
            </Button>
            <Button
              onClick={handleOpenCreateFileModal}
              className="flex-1 text-xs sm:text-sm p-2"
              size="sm"
            >
              <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Nouveau fichier</span>
              <span className="sm:hidden">Fichier</span>
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher..."
              value={localSearchQuery}
              onChange={handleSearchChange}
              className="pl-7 sm:pl-10 text-xs sm:text-sm"
            />
          </div>
          {/* Boutons de tri et filtre */}
          <div className="flex items-center gap-1 sm:gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSort}
              className="flex-1 text-xs sm:text-sm"
            >
              {sortOrder === "asc" ? (
                <SortAsc className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              ) : (
                <SortDesc className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              )}
              <span className="hidden sm:inline">Documents récents</span>
              <span className="sm:hidden">Tri</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilterModal(true)}
              className="px-2 sm:px-3"
            >
              <Filter className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-auto">
        {searchQuery && (
          <div className="p-2 sm:p-3 md:p-4 pb-2">
            <div className="text-xs sm:text-sm text-muted-foreground">
              Résultats pour "<span className="font-semibold text-foreground">{searchQuery}</span>"
            </div>
          </div>
        )}
        <FolderList fileTypeFilter={fileTypeFilter} refreshKey={folderListRefreshKey} />
      </div>

      {/* Modales */}
      <CreateFolderModal
        isOpen={showCreateFolderModal}
        onClose={() => setShowCreateFolderModal(false)}
        onConfirm={handleConfirmCreateFolder}
      />

      <CreateFileModal
        isOpen={showCreateFileModal}
        onClose={() => setShowCreateFileModal(false)}
        onConfirm={handleConfirmCreateFile}
      />

      <FilterModal
        isOpen={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        currentFilters={{
          fileTypes:
            fileTypeFilter === "all"
              ? []
              : [fileTypeFilter === "image" ? "png" : fileTypeFilter],
          tags: [],
          authors: [],
        }}
        onApply={(filters) => {
          if (filters.fileTypes.length === 0) {
            handleFilterChange("all");
          } else if (filters.fileTypes.includes("png")) {
            handleFilterChange("image");
          } else if (filters.fileTypes.includes("txt")) {
            handleFilterChange("txt");
          } else if (filters.fileTypes.includes("pdf")) {
            handleFilterChange("pdf");
          }
        }}
      />
    </div>
  );
};

export default Sidebar;
