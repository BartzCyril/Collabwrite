import { EditorWithChat } from "@/components/editor/EditorWithChat";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDocumentStore } from "@/hooks/useDocumentStore";
import { ArrowLeft, FileText, Save, Trash2 } from "lucide-react";
import React, { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useWebRTC } from "@/hooks/useWebRTC";
import { AudioCallButton } from "@/components/audio/AudioCallButton";
import { AudioControls } from "@/components/audio/AudioControls";
import { AudioStreams } from "@/components/audio/AudioStreams";
import { useAuth } from "@/contexts/AuthContext";
import { useDocumentCollaboration } from "@/hooks/useDocumentCollaboration";
import { ActiveUsers } from "@/components/collaboration/ActiveUsers";

export const DocumentEditorPage: React.FC = () => {
  const { documentId } = useParams<{ documentId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    files,
    currentFile,
    setCurrentFile,
    updateFile,
    saveFile,
    deleteFile,
    isSaving,
  } = useDocumentStore();

  const [documentTitle, setDocumentTitle] = useState("");
  const [documentContent, setDocumentContent] = useState("");
  const [remoteVersion, setRemoteVersion] = useState(0);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Charger le document au montage
  useEffect(() => {
    if (documentId) {
      const file = files.find((f) => f.id === documentId);
      if (file) {
        setCurrentFile(file);
        setDocumentTitle(file.name);
        setDocumentContent(file.content);
      }
    }
  }, [documentId, files, setCurrentFile]);

  // Gérer les mises à jour de contenu distantes
  const handleRemoteContentUpdate = useCallback((content: string, fromUserId: string) => {
    // Appliquer immédiatement pour éviter la perte de données
    setDocumentContent(content);
    setRemoteVersion((v) => v + 1);

    // Mise à jour du store en différé (non critique)
    if (currentFile) {
      setTimeout(() => {
        updateFile(currentFile.id, { content }, false);
      }, 0);
    }
  }, [currentFile?.id, updateFile]);

  // Hook de collaboration
  const { connectedUsers, isConnected, sendContentUpdate } = useDocumentCollaboration({
    documentId: documentId || '',
    userId: user?.id || '',
    onContentUpdate: handleRemoteContentUpdate,
  });

  // WebRTC pour les appels audio
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
    roomId: `document-${documentId}`,
    userId: user?.id || 'anonymous',
    userName: user?.fullName || 'Utilisateur anonyme',
  });

  // Gérer les changements locaux de contenu
  const handleContentChange = useCallback((content: string) => {
    setDocumentContent(content);

    // Envoyer immédiatement via WebSocket (pas de debounce pour éviter la perte de données)
    sendContentUpdate(content);

    // Debouncer seulement la mise à jour du store local (non critique)
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      if (currentFile) {
        updateFile(currentFile.id, { content }, false);
      }
    }, 500);
  }, [sendContentUpdate, currentFile?.id, updateFile]);

  // Gérer les changements de titre
  const handleTitleChange = (title: string) => {
    setDocumentTitle(title);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      if (currentFile) {
        updateFile(currentFile.id, { name: title });
      }
    }, 500);
  };

  // Sauvegarder manuellement
  const handleSave = async () => {
    if (currentFile) {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      const updatedFile = {
        ...currentFile,
        name: documentTitle,
        content: documentContent,
      };
      await saveFile(updatedFile);
    }
  };

  // Nettoyage
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (isCallActive) {
        endCall();
      }
    };
  }, [isCallActive, endCall]);

  const handleBack = () => {
    navigate("/dashboard");
  };

  const handleDelete = async () => {
    if (
      currentFile &&
      confirm(
        `Êtes-vous sûr de vouloir supprimer le document "${currentFile.name}" ?`
      )
    ) {
      await deleteFile(currentFile.id);
      navigate("/dashboard");
    }
  };

  if (!currentFile) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <EmptyState
          title="Document non trouvé"
          description="Le document que vous recherchez n'existe pas ou a été supprimé."
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
    <div className="flex-1 flex flex-col h-full p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4 md:space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
          <Button variant="outline" size="sm" onClick={handleBack} className="flex-shrink-0">
            <ArrowLeft className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Retour</span>
          </Button>
          <div className="flex items-center gap-2 min-w-0">
            <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0" />
            <h1 className="text-base sm:text-lg md:text-xl font-semibold truncate">Éditeur de document</h1>
          </div>
          <ActiveUsers users={connectedUsers} currentUserId={user?.id} />
        </div>

        <div className="flex items-center gap-2 sm:gap-3 md:gap-4 flex-wrap">
          {currentFile.isDirty && (
            <span className="text-xs sm:text-sm text-orange-500 flex-shrink-0 whitespace-nowrap">• Non sauvegardé</span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
            className="text-destructive hover:text-destructive flex-shrink-0"
          >
            <Trash2 className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Supprimer</span>
          </Button>
          <Button onClick={handleSave} disabled={isSaving} className="gap-2 flex-shrink-0">
            <Save className="h-4 w-4" />
            <span className="hidden sm:inline">{isSaving ? "Sauvegarde..." : "Sauvegarder"}</span>
            <span className="sm:hidden">{isSaving ? "..." : "Sauver"}</span>
          </Button>

          <div className="flex items-center gap-2 border-l pl-2 sm:pl-4 flex-shrink-0">
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

      {/* Métadonnées du document */}
      <Card className="p-3 sm:p-4">
        <div className="space-y-2">
          <Label htmlFor="document-title" className="text-sm sm:text-base">Titre du document</Label>
          <Input
            id="document-title"
            value={documentTitle}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Entrez le titre du document..."
            className="text-sm sm:text-base md:text-lg font-medium"
          />
        </div>
      </Card>

      {/* Éditeur de contenu */}
      <div className="flex-1 min-h-0">
        <EditorWithChat
          key={currentFile.id}
          documentId={currentFile.id}
          documentName={documentTitle}
          content={documentContent}
          onContentChange={handleContentChange}
          onRemoteContentChange={(content) => setDocumentContent(content)}
          onSave={handleSave}
          placeholder="Commencez à écrire votre contenu..."
          remoteVersion={remoteVersion}
        />
      </div>

      <AudioStreams localStream={localStream} peers={peers} />
    </div>
  );
};

export default DocumentEditorPage;

