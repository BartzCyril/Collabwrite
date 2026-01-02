import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";
import { DocumentChat } from "../chat/DocumentChat";
import { TiptapEditor } from "./TiptapEditor";

interface EditorWithChatProps {
  documentId: string;
  documentName?: string;
  content: string;
  onContentChange: (content: string) => void;
  onRemoteContentChange: (content: string) => void;
  onSave?: () => void;
  placeholder?: string;
  remoteVersion?: number;
}

export const EditorWithChat: React.FC<EditorWithChatProps> = React.memo(({
  documentId,
  documentName,
  content,
  onContentChange,
  onRemoteContentChange,
  onSave,
  placeholder,
  remoteVersion = 0,
}) => {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <div className="flex flex-wrap h-full w-full gap-4">
      {/* Éditeur principal */}
      <div
        className={`flex-1 min-w-[300px] transition-all duration-300 ${
          isChatOpen ? "mr-0" : ""
        }`}
      >
        <TiptapEditor
          content={content}
          onContentChange={onContentChange}
          onRemoteContentChange={onRemoteContentChange}
          onSave={onSave}
          placeholder={placeholder}
          documentId={documentId}
          documentName={documentName}
          remoteVersion={remoteVersion}
        />

        {/* Bouton pour ouvrir le chat (visible seulement quand le chat est fermé) */}
        {!isChatOpen && (
          <Button
            onClick={() => setIsChatOpen(true)}
            className="fixed bottom-8 right-8 rounded-full shadow-lg w-14 h-14 z-50"
            size="lg"
          >
            <MessageSquare className="h-6 w-6" />
          </Button>
        )}
      </div>

      {/* Panneau de chat */}
      {isChatOpen && (
        <div className="w-full lg:w-96 flex-shrink-0 animate-in slide-in-from-right">
          <div className="h-[calc(100vh-200px)] max-h-[800px] rounded-lg border bg-card shadow-lg">
            <DocumentChat
              documentId={documentId}
              onClose={() => setIsChatOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
});

EditorWithChat.displayName = 'EditorWithChat';

export default EditorWithChat;
