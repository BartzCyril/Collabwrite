/**
 * CreateFileModal - Modale pour créer un nouveau fichier
 * Projet Spé 4 - Composant de création de fichier avec sélection de type
 */

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { folderService } from "@/services/folder.service";
import CreateFolderModal from "./CreateFolderModal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { FileType } from "@/types/document";
import { useDocumentStore } from "@/hooks/useDocumentStore";
import {
  FileText,
  FileType as FileTypeIcon,
  Folder as FolderTypeIcon,
  Image,
  Upload,
  X,
} from "lucide-react";
import React, { useCallback, useState } from "react";

interface CreateFileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (name: string, fileType: FileType, uploadedFile?: File) => void;
  folderId?: string | null;
}

export const CreateFileModal: React.FC<CreateFileModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  folderId,
}) => {
  const [step, setStep] = useState<"type" | "details">("type");
  const [selectedType, setSelectedType] = useState<FileType | null>(null);
  const [fileName, setFileName] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [error, setError] = useState("");

  const { loadFolders } = useDocumentStore();

  const handleTypeSelect = (type: FileType) => {
    setSelectedType(type);
    if(type == "folder"){
      setIsCreateFolderOpen(true);
    }
    setStep("details");
  };

  const handleCloseModal = () => {
    setIsCreateFolderOpen(false);
    handleClose();
  }

  const handleConfirmCreateFolder = async (name: string, color: string, folderId: string | null) => {
    try {
      await folderService.createFolder({ name, color, folderId });
      await loadFolders();
      handleClose();
    }
    catch (err: unknown){
      const error = err as { response?: { data?: { error?: string } } }
      setError(error.response?.data?.error || "Erreur lors de l'ajout du dossier");
    }
  }

  const handleBack = () => {
    setStep("type");
    setSelectedType(null);
    setFileName("");
    setUploadedFile(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (fileName.trim() && selectedType) {
      let finalFileName = fileName.trim();
      
      // S'assurer que les images et PDFs ont l'extension appropriée
      if (selectedType === "png" && !finalFileName.toLowerCase().endsWith(".png")) {
        finalFileName = finalFileName + ".png";
      } else if (selectedType === "pdf" && !finalFileName.toLowerCase().endsWith(".pdf")) {
        finalFileName = finalFileName + ".pdf";
      }
      
      // Pour les fichiers texte, pas besoin de fichier uploadé
      if (selectedType === "txt") {
        onConfirm(finalFileName, selectedType);
      } else if (uploadedFile) {
        // Pour png/pdf, on a besoin d'un fichier uploadé
        onConfirm(finalFileName, selectedType, uploadedFile);
      }
      handleClose();
    }
  };

  const handleClose = () => {
    setStep("type");
    setSelectedType(null);
    setFileName("");
    setUploadedFile(null);
    setIsDragging(false);
    onClose();
  };

  const handleFileUpload = useCallback(
    (file: File) => {
      // Vérifier le type de fichier
      const validTypes: Record<FileType, string[]> = {
        txt: [],
        png: [
          "image/png",
          "image/jpeg",
          "image/jpg",
          "image/gif",
          "image/webp",
        ],
        pdf: ["application/pdf"],
        folder: [],
      };

      if (selectedType && selectedType !== "txt") {
        const allowedTypes = validTypes[selectedType];
        if (allowedTypes.includes(file.type)) {
          setUploadedFile(file);
          // Extraire le nom du fichier et ajouter l'extension appropriée
          const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
          const extension = selectedType === "png" ? ".png" : selectedType === "pdf" ? ".pdf" : "";
          const finalName = nameWithoutExt + extension;
          if (!fileName || fileName === nameWithoutExt) {
            setFileName(finalName);
          }
        } else {
          alert(
            `Type de fichier invalide. Veuillez sélectionner un fichier ${selectedType.toUpperCase()}.`
          );
        }
      }
    },
    [selectedType, fileName]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file) {
        handleFileUpload(file);
      }
    },
    [handleFileUpload]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const isFormValid = () => {
    if (!fileName.trim() || !selectedType) return false;
    if (selectedType === "txt") return true;
    return uploadedFile !== null;
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-[95vw] sm:max-w-[600px] mx-2 sm:mx-4">
          {step === "type" ? (
            <>
              <DialogHeader>
                <DialogTitle className="text-base sm:text-lg">Créer un nouveau fichier ou un nouveau dossier</DialogTitle>
                <DialogDescription className="text-xs sm:text-sm">
                  Choisissez le type de fichier que vous souhaitez créer.
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 py-4 sm:py-6">
                <Card
                  className="p-3 sm:p-4 md:p-6 cursor-pointer hover:shadow-lg transition-all hover:scale-105 hover:border-primary"
                  onClick={() => handleTypeSelect("txt")}
                >
                  <div className="flex flex-col items-center gap-2 sm:gap-3 text-center">
                    <div className="h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <FileText className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-xs sm:text-sm md:text-base">Texte</h3>
                      <p className="text-xs text-muted-foreground mt-1 hidden sm:block">
                        Document éditable
                      </p>
                    </div>
                  </div>
                </Card>

                <Card
                  className="p-3 sm:p-4 md:p-6 cursor-pointer hover:shadow-lg transition-all hover:scale-105 hover:border-primary"
                  onClick={() => handleTypeSelect("png")}
                >
                  <div className="flex flex-col items-center gap-2 sm:gap-3 text-center">
                    <div className="h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                      <Image className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-xs sm:text-sm md:text-base">Image</h3>
                      <p className="text-xs text-muted-foreground mt-1 hidden sm:block">
                        PNG, JPG, GIF
                      </p>
                    </div>
                  </div>
                </Card>

                <Card
                  className="p-3 sm:p-4 md:p-6 cursor-pointer hover:shadow-lg transition-all hover:scale-105 hover:border-primary"
                  onClick={() => handleTypeSelect("pdf")}
                >
                  <div className="flex flex-col items-center gap-2 sm:gap-3 text-center">
                    <div className="h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                      <FileTypeIcon className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-xs sm:text-sm md:text-base">PDF</h3>
                      <p className="text-xs text-muted-foreground mt-1 hidden sm:block">
                        Document PDF
                      </p>
                    </div>
                  </div>
                </Card>

                <Card
                  className="p-3 sm:p-4 md:p-6 cursor-pointer hover:shadow-lg transition-all hover:scale-105 hover:border-primary"
                  onClick={() => handleTypeSelect("folder")}
                >
                  <div className="flex flex-col items-center gap-2 sm:gap-3 text-center">
                    <div className="h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 rounded-full bg-gray-300 dark:bg-gray-900/30 flex items-center justify-center">
                      <FolderTypeIcon className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-xs sm:text-sm md:text-base">Dossier</h3>
                      <p className="text-xs text-muted-foreground mt-1 hidden sm:block">
                        Nouveau dossier
                      </p>
                    </div>
                  </div>
                </Card>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleClose}>
                  Annuler
                </Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {selectedType === "txt" && (
                    <FileText className="h-5 w-5 text-blue-600" />
                  )}
                  {selectedType === "png" && (
                    <Image className="h-5 w-5 text-green-600" />
                  )}
                  {selectedType === "pdf" && (
                    <FileTypeIcon className="h-5 w-5 text-red-600" />
                  )}
                  Nouveau fichier {selectedType?.toUpperCase()}
                </DialogTitle>
                <DialogDescription>
                  {selectedType === "txt"
                    ? "Créez un nouveau fichier texte éditable."
                    : `Uploadez un fichier ${selectedType?.toUpperCase()} depuis votre ordinateur.`}
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit}>
                <div className="space-y-4 py-4">
                  {/* Nom du fichier */}
                  <div className="space-y-2">
                    <Label htmlFor="file-name">Nom du fichier</Label>
                    <Input
                      id="file-name"
                      placeholder="Ex: Mon document"
                      value={fileName}
                      onChange={(e) => setFileName(e.target.value)}
                      autoFocus
                    />
                  </div>

                  {/* Zone d'upload pour PNG/PDF */}
                  {selectedType !== "txt" && (
                    <div className="space-y-2">
                      <Label>Fichier à uploader</Label>
                      <div
                        className={`border-2 border-dashed rounded-lg p-4 sm:p-6 md:p-8 text-center transition-colors ${
                          isDragging
                            ? "border-primary bg-primary/5"
                            : uploadedFile
                            ? "border-green-500 bg-green-50 dark:bg-green-900/10"
                            : "border-muted-foreground/25 hover:border-muted-foreground/50"
                        }`}
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                      >
                        {uploadedFile ? (
                          <div className="space-y-3 sm:space-y-4">
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
                              {selectedType === "png" ? (
                                <Image className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 flex-shrink-0" />
                              ) : (
                                <FileTypeIcon className="h-6 w-6 sm:h-8 sm:w-8 text-red-600 flex-shrink-0" />
                              )}
                              <div className="text-center sm:text-left min-w-0">
                                <p className="font-medium text-xs sm:text-sm truncate">{uploadedFile.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {(uploadedFile.size / 1024).toFixed(2)} KB
                                </p>
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setUploadedFile(null)}
                              className="gap-2 w-full sm:w-auto"
                            >
                              <X className="h-3 w-3 sm:h-4 sm:w-4" />
                              Supprimer
                            </Button>
                          </div>
                        ) : (
                          <>
                            <Upload className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 mx-auto mb-2 sm:mb-4 text-muted-foreground" />
                            <p className="text-xs sm:text-sm text-muted-foreground mb-2">
                              Glissez-déposez votre fichier ici ou
                            </p>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                document.getElementById("file-input")?.click()
                              }
                              className="w-full sm:w-auto"
                            >
                              Parcourir les fichiers
                            </Button>
                            <input
                              id="file-input"
                              type="file"
                              className="hidden"
                              accept={
                                selectedType === "png"
                                  ? "image/*"
                                  : "application/pdf"
                              }
                              onChange={handleFileInputChange}
                            />
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={handleBack}>
                    Retour
                  </Button>
                  <Button type="submit" disabled={!isFormValid()}>
                    Créer le fichier
                  </Button>
                </DialogFooter>
              </form>
            </>
          )}
        </DialogContent>
      </Dialog>

      <CreateFolderModal 
        isOpen={isCreateFolderOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirmCreateFolder}
        folderId={folderId}
      />
    </>
  );
};

export default CreateFileModal;
