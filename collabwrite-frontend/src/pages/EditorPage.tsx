import { EditorWithChat } from "@/components/editor/EditorWithChat";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDocumentStore } from "@/hooks/useDocumentStore";
import {
  ArrowLeft,
  FileText,
  FileType as FileTypeIcon,
  Image as ImageIcon,
  Save,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useWebRTC } from "@/hooks/useWebRTC";
import { AudioCallButton } from "@/components/audio/AudioCallButton";
import { AudioControls } from "@/components/audio/AudioControls";
import { AudioStreams } from "@/components/audio/AudioStreams";
import { useAuth } from "@/contexts/AuthContext";

export const EditorPage: React.FC = () => {
  const { pageId } = useParams<{ pageId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { files, currentFile, setCurrentFile, updateFile, saveFile, isSaving } =
    useDocumentStore();

  const [fileName, setFileName] = useState("");
  const [fileContent, setFileContent] = useState("");
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const autosaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  const {
    localStream,
    peers,
    isCallActive,
    isMuted,
    connectionStatus,
    error: audioError,
    startCall,
    endCall,
    toggleMute,
  } = useWebRTC({
    roomId: `editor-${pageId}`,
    userId: user?.id || 'anonymous',
    userName: user?.fullName || 'Utilisateur anonyme',
  });

  // Trouver le fichier actuel
  useEffect(() => {
    if (pageId) {
      const file = files.find((f) => f.id === pageId);

      if (file) {
        // Si c'est un fichier image ou PDF, rediriger vers le viewer
        if (file.fileType === 'png' || file.fileType === 'pdf') {
          navigate(`/viewer/${file.id}`);
          return;
        }
        setCurrentFile(file);
        setFileName(file.name);
        setFileContent(file.content);
      }
    }
  }, [pageId, files, setCurrentFile, navigate]);

  const handleContentChange = (content: string) => {
    setFileContent(content);

    // Débouncer la mise à jour du store (500ms)
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      if (currentFile) {
        updateFile(currentFile.id, { content });
      }
    }, 500);

    // Autosave débouncé (2000ms) pour les fichiers texte
    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current);
    }
    if (currentFile?.fileType === "txt") {
      autosaveTimerRef.current = setTimeout(async () => {
        if (!currentFile) return;
        const updatedFile = {
          ...currentFile,
          name: fileName,
          content: content,
        };
        await saveFile(updatedFile);
      }, 2000);
    }
  };

  const handleNameChange = (name: string) => {
    setFileName(name);

    // Débouncer la mise à jour du nom
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      if (currentFile) {
        updateFile(currentFile.id, { name });
      }
    }, 500);
  };

  const handleSave = async () => {
    if (currentFile) {
      // Annuler tout debounce en cours
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      const updatedFile = {
        ...currentFile,
        name: fileName,
        content: fileContent,
      };
      await saveFile(updatedFile);
    }
  };

  // Nettoyer le timer au démontage
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (autosaveTimerRef.current) {
        clearTimeout(autosaveTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    return () => {
      if (isCallActive) {
        endCall();
      }
    };
  }, [isCallActive, endCall]);

  const handleBack = () => {
    navigate("/dashboard");
  };

  const getFileIcon = () => {
    if (!currentFile)
      return <FileText className="h-5 w-5 text-muted-foreground" />;

    switch (currentFile.fileType) {
      case "png":
        return <ImageIcon className="h-5 w-5 text-green-600" />;
      case "pdf":
        return <FileTypeIcon className="h-5 w-5 text-red-600" />;
      default:
        return <FileText className="h-5 w-5 text-blue-600" />;
    }
  };

  if (!currentFile) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <EmptyState
          title="Fichier non trouvé"
          description="Le fichier que vous recherchez n'existe pas ou a été supprimé."
          icon={<FileText className="h-12 w-12 text-muted-foreground" />}
          action={{
            label: "Retour au dashboard",
            onClick: handleBack,
          }}
        />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <div className="flex items-center gap-2">
            {getFileIcon()}
            <h1 className="text-xl font-semibold">
              {currentFile.fileType === "txt"
                ? "Éditeur de fichier"
                : "Visualisation de fichier"}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {currentFile.isDirty && (
            <span className="text-sm text-orange-500">• Non sauvegardé</span>
          )}
          {currentFile.fileType === "txt" && (
            <Button onClick={handleSave} disabled={isSaving} className="gap-2">
              <Save className="h-4 w-4" />
              {isSaving ? "Sauvegarde..." : "Sauvegarder"}
            </Button>
          )}

          <div className="flex items-center gap-2 border-l pl-4">
            {!isCallActive ? (
              <AudioCallButton
                onStartCall={startCall}
                connectionStatus={connectionStatus}
              />
            ) : (
              <AudioControls
                isMuted={isMuted}
                participants={Array.from(peers.entries()).map(([id, peer]) => ({
                  id,
                  hasStream: !!peer.stream,
                  userName: peer.userName,
                }))}
                onToggleMute={toggleMute}
                onEndCall={endCall}
              />
            )}
          </div>
        </div>
      </div>

      {audioError && (
        <Card className="p-4 border-red-200 bg-red-50">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center text-sm">
              !
            </div>
            <div>
              <p className="font-medium text-red-900">Erreur audio</p>
              <p className="text-sm text-red-700">{audioError}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Métadonnées du fichier */}
      <Card className="p-4">
        <div className="space-y-2">
          <Label htmlFor="file-name">Nom du fichier</Label>
          <Input
            id="file-name"
            value={fileName}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="Entrez le nom du fichier..."
            className="text-lg font-medium"
            disabled={currentFile.fileType !== "txt"}
          />
        </div>
      </Card>

      {/* Contenu du fichier */}
      <div className="flex-1 min-h-0">
        {currentFile.fileType === "txt" ? (
          <EditorWithChat
            key={currentFile.id}
            documentId={currentFile.id}
            content={fileContent}
            onContentChange={handleContentChange}
            onSave={handleSave}
            placeholder="Commencez à écrire votre contenu..."
          />
        ) : currentFile.fileType === "png" ? (
          <Card className="p-4 h-full flex items-center justify-center overflow-auto">
            <img
              src={fileContent}
              alt={fileName}
              className="max-w-full max-h-full object-contain"
            />
          </Card>
        ) : currentFile.fileType === "pdf" ? (
          <Card className="p-4 h-full flex flex-col">
            <div className="flex-1 overflow-hidden">
              <iframe
                src={fileContent}
                className="w-full h-full border-0"
                title={fileName}
              />
            </div>
          </Card>
        ) : null}
      </div>

      <AudioStreams localStream={localStream} peers={peers} />
    </div>
  );
};

export default EditorPage;
