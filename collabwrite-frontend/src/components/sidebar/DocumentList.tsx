import { useDocumentStore, useFilteredFiles } from "@/hooks/useDocumentStore";
import React from "react";
import { EmptyState } from "../ui/EmptyState";
import { DocumentSkeleton } from "../ui/LoadingSkeleton";
import { DocumentItem } from "./DocumentItem";

interface DocumentListProps {
  fileTypeFilter?: "all" | "txt" | "image" | "pdf";
}

export const DocumentList: React.FC<DocumentListProps> = ({
  fileTypeFilter = "all",
}) => {
  const files = useFilteredFiles();
  const { isLoading } = useDocumentStore();

  // Filtrer par type de fichier
  const filteredFiles =
    fileTypeFilter === "all"
      ? files
      : fileTypeFilter === "image"
      ? files.filter((file) => file.fileType === "png") // On filtre les images (png pour l'instant)
      : files.filter((file) => file.fileType === fileTypeFilter);

  if (isLoading) {
    return (
      <div className="p-4">
        <DocumentSkeleton count={5} />
      </div>
    );
  }

  if (filteredFiles.length === 0) {
    return (
      <div className="p-4">
        <EmptyState
          title="Aucun document trouvé"
          description="Créez votre premier document ou ajustez vos filtres de recherche."
          action={{
            label: "Créer un document",
            onClick: () => console.log("Créer un document"),
          }}
        />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-2">
      {filteredFiles.map((file) => (
        <DocumentItem key={file.id} file={file} />
      ))}
    </div>
  );
};

export default DocumentList;
