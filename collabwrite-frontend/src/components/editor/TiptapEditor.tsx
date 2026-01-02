import React, { useEffect, useRef, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Undo,
  Redo,
  Save,
  UserPlus,
  Link as LinkIcon
} from 'lucide-react';
import { InviteCollaboratorModal } from '../modals/InviteCollaboratorModal';
import './TiptapEditor.css';

interface TiptapEditorProps {
  content: string;
  onContentChange: (content: string) => void;
  onRemoteContentChange: (content: string) => void;
  onSave?: () => void;
  placeholder?: string;
  className?: string;
  documentId?: string;
  documentName?: string;
  remoteVersion?: number; // increments on remote updates to disambiguate sources
}

export const TiptapEditor: React.FC<TiptapEditorProps> = React.memo(({
  content,
  onContentChange,
  onRemoteContentChange,
  onSave,
  className = "",
  documentId,
  documentName,
  remoteVersion = 0,
}) => {
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const isRemoteUpdateRef = useRef(false);
  const onContentChangeRef = useRef(onContentChange);

  // Garder la référence à jour sans provoquer de re-render
  useEffect(() => {
    onContentChangeRef.current = onContentChange;
  }, [onContentChange]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        history: {
          depth: 50, // Réduit pour de meilleures performances
        },
        // Désactiver les extensions déjà incluses qu'on va personnaliser
        link: false,
        underline: false,
      }),
      Underline,
      Link.configure({
        openOnClick: false,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      TextStyle,
      Color,
    ],
    content: content,
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[500px] p-4',
      },
    },
    onUpdate: ({ editor }) => {
      if (!isRemoteUpdateRef.current) {
        const html = editor.getHTML();
        // Utiliser requestAnimationFrame pour optimiser les updates
        requestAnimationFrame(() => {
          onContentChangeRef.current(html);
        });
      }
    },
    immediatelyRender: false, // Améliore les performances initiales
    shouldRerenderOnTransaction: false, // Évite les re-renders inutiles
  });

  // Gérer les mises à jour distantes (depuis d'autres utilisateurs)
  useEffect(() => {
    if (!editor) return;

    const currentContent = editor.getHTML();
    const normalize = (html: string) => html.replace(/\s+/g, ' ').trim();

    if (normalize(content) !== normalize(currentContent)) {
      isRemoteUpdateRef.current = true;

      // Appliquer immédiatement pour éviter les pertes
      editor.commands.setContent(content, false);

      // Débloquer après un court délai
      setTimeout(() => {
        isRemoteUpdateRef.current = false;
      }, 50);
    }
  }, [remoteVersion, editor, content]);

  if (!editor) {
    return null;
  }

  const addLink = () => {
    const url = window.prompt('URL du lien:');
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  return (
    <Card className={`p-4 ${className}`}>
      <div className="space-y-4">
        {/* Barre d'outils personnalisée */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1 border rounded-lg p-2 bg-muted/50">
            {/* Historique */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
              title="Annuler"
            >
              <Undo className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
              title="Rétablir"
            >
              <Redo className="h-4 w-4" />
            </Button>

            <div className="h-6 w-px bg-border mx-1" />

            {/* Titres */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              className={editor.isActive('heading', { level: 1 }) ? 'bg-muted' : ''}
              title="Titre 1"
            >
              <Heading1 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              className={editor.isActive('heading', { level: 2 }) ? 'bg-muted' : ''}
              title="Titre 2"
            >
              <Heading2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              className={editor.isActive('heading', { level: 3 }) ? 'bg-muted' : ''}
              title="Titre 3"
            >
              <Heading3 className="h-4 w-4" />
            </Button>

            <div className="h-6 w-px bg-border mx-1" />

            {/* Formatage du texte */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={editor.isActive('bold') ? 'bg-muted' : ''}
              title="Gras"
            >
              <Bold className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={editor.isActive('italic') ? 'bg-muted' : ''}
              title="Italique"
            >
              <Italic className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              className={editor.isActive('underline') ? 'bg-muted' : ''}
              title="Souligné"
            >
              <UnderlineIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleStrike().run()}
              className={editor.isActive('strike') ? 'bg-muted' : ''}
              title="Barré"
            >
              <Strikethrough className="h-4 w-4" />
            </Button>

            <div className="h-6 w-px bg-border mx-1" />

            {/* Listes */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={editor.isActive('bulletList') ? 'bg-muted' : ''}
              title="Liste à puces"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              className={editor.isActive('orderedList') ? 'bg-muted' : ''}
              title="Liste numérotée"
            >
              <ListOrdered className="h-4 w-4" />
            </Button>

            <div className="h-6 w-px bg-border mx-1" />

            {/* Alignement */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().setTextAlign('left').run()}
              className={editor.isActive({ textAlign: 'left' }) ? 'bg-muted' : ''}
              title="Aligner à gauche"
            >
              <AlignLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().setTextAlign('center').run()}
              className={editor.isActive({ textAlign: 'center' }) ? 'bg-muted' : ''}
              title="Centrer"
            >
              <AlignCenter className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().setTextAlign('right').run()}
              className={editor.isActive({ textAlign: 'right' }) ? 'bg-muted' : ''}
              title="Aligner à droite"
            >
              <AlignRight className="h-4 w-4" />
            </Button>

            <div className="h-6 w-px bg-border mx-1" />

            {/* Lien */}
            <Button
              variant="ghost"
              size="sm"
              onClick={addLink}
              className={editor.isActive('link') ? 'bg-muted' : ''}
              title="Ajouter un lien"
            >
              <LinkIcon className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            {onSave && (
              <Button variant="outline" size="sm" onClick={onSave}>
                <Save className="h-4 w-4 mr-2" />
                Sauvegarder
              </Button>
            )}
            <Button
              variant="default"
              size="sm"
              onClick={() => setIsInviteModalOpen(true)}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Inviter
            </Button>
          </div>
        </div>

        {/* Modale d'invitation */}
        <InviteCollaboratorModal
          isOpen={isInviteModalOpen}
          onClose={() => setIsInviteModalOpen(false)}
          documentId={documentId}
          documentName={documentName}
        />

        {/* Zone d'édition principale */}
        <div className="border rounded-lg overflow-hidden bg-background">
          <EditorContent editor={editor} />
        </div>
      </div>
    </Card>
  );
});

TiptapEditor.displayName = 'TiptapEditor';

export default TiptapEditor;

