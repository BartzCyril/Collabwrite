/**
 * FileViewerPage - Page de visualisation pour les images et PDFs
 * Projet Spé 4 - Visualisation optimisée pour fichiers binaires
 */

import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useDocumentStore } from "@/hooks/useDocumentStore";
import {
  ArrowLeft,
  Download,
  FileType as FileTypeIcon,
  Image as ImageIcon,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export const FileViewerPage: React.FC = () => {
  const { fileId } = useParams<{ fileId: string }>();
  const navigate = useNavigate();
  const files = useDocumentStore((state) => state.files);
  const setCurrentFile = useDocumentStore((state) => state.setCurrentFile);
  const [zoom, setZoom] = useState(100);

  const file = files.find((f) => f.id === fileId);
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);

  // Créer un blob URL pour les PDFs à partir de la data URL
  useEffect(() => {
    if (file && file.fileType === "pdf" && file.content) {
      try {
        // Convertir la data URL en blob
        let byteString: string;
        let mimeString: string;

        if (file.content.startsWith("data:")) {
          // C'est une data URL standard
          const parts = file.content.split(",");
          mimeString = parts[0].split(":")[1].split(";")[0];
          byteString = parts[1] ? atob(parts[1]) : "";
        } else {
          // Si ce n'est pas une data URL, traiter comme blob URL ou URL directe
          setPdfBlobUrl(file.content);
          return;
        }

        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
        }
        const blob = new Blob([ab], { type: mimeString || "application/pdf" });
        const blobUrl = URL.createObjectURL(blob);
        setPdfBlobUrl(blobUrl);

        // Nettoyer le blob URL au démontage
        return () => {
          URL.revokeObjectURL(blobUrl);
        };
      } catch (error) {
        console.error("Erreur lors de la conversion du PDF:", error);
        // En cas d'erreur, utiliser directement la data URL
        setPdfBlobUrl(file.content);
      }
    } else {
      setPdfBlobUrl(null);
    }
  }, [file]);

  useEffect(() => {
    if (file) {
      setCurrentFile(file);
    }
  }, [file, setCurrentFile]);

  const handleBack = () => {
    navigate("/dashboard");
  };

  const handleDownload = () => {
    if (!file) return;

    // Créer un lien temporaire pour télécharger le fichier
    const link = document.createElement("a");
    link.href = file.content;
    link.download = file.name + (file.fileType === "png" ? ".png" : ".pdf");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 25, 200));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 25, 50));
  };

  const handleResetZoom = () => {
    setZoom(100);
  };

  if (!file) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <EmptyState
          title="Fichier non trouvé"
          description="Le fichier que vous recherchez n'existe pas ou a été supprimé."
          icon={<FileTypeIcon className="h-12 w-12 text-muted-foreground" />}
          action={{
            label: "Retour au dashboard",
            onClick: handleBack,
          }}
        />
      </div>
    );
  }

  if (file.fileType === "txt") {
    // Rediriger vers l'éditeur pour les fichiers texte
    navigate(`/editor/${file.id}`);
    return null;
  }

  return (
    <div className="flex-1 flex flex-col h-full p-6 space-y-4">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <div className="flex items-center gap-2">
            {file.fileType === "png" ? (
              <ImageIcon className="h-5 w-5 text-green-600" />
            ) : (
              <FileTypeIcon className="h-5 w-5 text-red-600" />
            )}
            <h1 className="text-xl font-semibold">{file.name}</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {file.fileType === "png" && (
            <>
              <Button variant="outline" size="sm" onClick={handleZoomOut}>
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground min-w-[60px] text-center">
                {zoom}%
              </span>
              <Button variant="outline" size="sm" onClick={handleZoomIn}>
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleResetZoom}>
                Réinitialiser
              </Button>
            </>
          )}
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Télécharger
          </Button>
        </div>
      </div>

      {/* Zone de visualisation */}
      <Card className="flex-1 min-h-0 overflow-hidden p-4">
        <div className="h-full w-full overflow-auto flex items-center justify-center bg-muted/30">
          {file.fileType === "png" ? (
            <img
              src={file.content}
              alt={file.name}
              className="max-w-full max-h-full object-contain transition-transform duration-200"
              style={{ transform: `scale(${zoom / 100})` }}
            />
          ) : file.fileType === "pdf" ? (
            pdfBlobUrl ? (
              <>
                <embed
                  src={pdfBlobUrl}
                  type="application/pdf"
                  className="w-full h-full min-h-[600px]"
                  title={file.name}
                />
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">Chargement du PDF...</p>
              </div>
            )
          ) : null}
        </div>
      </Card>

      {/* Informations du fichier */}
      <Card className="p-4">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            <span>Taille: {file.size ? `${(file.size / 1024).toFixed(2)} KB` : "N/A"}</span>
            <span>Type: {file.fileType.toUpperCase()}</span>
            <span>Modifié: {file.updatedAt.toLocaleDateString("fr-FR")}</span>
          </div>
          {file.description && (
            <p className="text-sm text-muted-foreground">{file.description}</p>
          )}
        </div>
      </Card>
    </div>
  );
};

export default FileViewerPage;

