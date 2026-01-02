import { Button } from '@/components/ui/button';
import { Phone } from 'lucide-react';

interface AudioCallButtonProps {
  onStartCall: () => void;
  connectionStatus: 'disconnected' | 'connecting' | 'connected';
  disabled?: boolean;
}

export const AudioCallButton: React.FC<AudioCallButtonProps> = ({
  onStartCall,
  connectionStatus,
  disabled = false,
}) => {
  return (
    <Button
      onClick={onStartCall}
      disabled={disabled || connectionStatus === 'connecting'}
      className="gap-2"
      size="sm"
      variant="outline"
    >
      <Phone className="h-4 w-4" />
      {connectionStatus === 'connecting' ? 'Connexion...' : 'Rejoindre l\'appel'}
    </Button>
  );
};
