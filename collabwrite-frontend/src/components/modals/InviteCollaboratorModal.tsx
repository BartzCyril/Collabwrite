/**
 * InviteCollaboratorModal - Modale pour inviter un collaborateur sur un document
 * Permet d'envoyer une invitation par email
 */

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Loader2 } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";
import api from "@/services/api";

interface InviteCollaboratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentId?: string;
  documentName?: string;
}

export const InviteCollaboratorModal: React.FC<InviteCollaboratorModalProps> = ({
  isOpen,
  onClose,
  documentId,
  documentName,
}) => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("Veuillez entrer une adresse email");
      return;
    }

    // Validation basique de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Veuillez entrer une adresse email valide");
      return;
    }

    // Vérifier que le documentId est fourni
    if (!documentId) {
      toast.error("Erreur : ID du document manquant. Veuillez ouvrir le document avant d'inviter un collaborateur.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.post("/invite/send", {
        email: email.trim(),
        documentId: documentId,
        documentName: documentName || "Document",
      });

      toast.success(`Invitation envoyée à ${email}`);
      handleClose();
    } catch (error: any) {
      console.error("Erreur lors de l'envoi de l'invitation:", error);
      const errorMessage = error.response?.data?.error ||
                          error.message ||
                          "Erreur lors de l'envoi de l'invitation";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setEmail("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            Inviter un collaborateur
          </DialogTitle>
          <DialogDescription>
            Envoyez une invitation par email pour collaborer sur ce document.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">Adresse email</Label>
              <Input
                id="email"
                type="email"
                placeholder="exemple@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoFocus
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">
                La personne recevra un email avec un lien pour accéder au document.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Envoi en cours...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Envoyer l'invitation
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default InviteCollaboratorModal;

