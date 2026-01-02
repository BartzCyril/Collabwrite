import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Mic, MicOff, PhoneOff, Users, Volume2, VolumeX } from 'lucide-react';

interface Participant {
  id: string;
  hasStream: boolean;
  userName?: string;
}

interface AudioControlsProps {
  isMuted: boolean;
  participants: Participant[];
  onToggleMute: () => void;
  onEndCall: () => void;
}

export const AudioControls: React.FC<AudioControlsProps> = ({
  isMuted,
  participants,
  onToggleMute,
  onEndCall,
}) => {
  return (
    <div className="flex items-center gap-2">
      <Button
        onClick={onToggleMute}
        size="sm"
        variant={isMuted ? 'destructive' : 'outline'}
        className="gap-2"
      >
        {isMuted ? (
          <>
            <MicOff className="h-4 w-4" />
            Muté
          </>
        ) : (
          <>
            <Mic className="h-4 w-4" />
            Micro
          </>
        )}
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="sm" variant="outline" className="gap-2">
            <Users className="h-4 w-4" />
            {participants.length + 1}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Participants</DropdownMenuLabel>
          <DropdownMenuSeparator />

          <DropdownMenuItem disabled>
            <div className="flex items-center gap-2 w-full">
              {isMuted ? (
                <VolumeX className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Volume2 className="h-4 w-4 text-green-500" />
              )}
              <span>Vous (local)</span>
            </div>
          </DropdownMenuItem>

          {participants.map((participant) => (
            <DropdownMenuItem key={participant.id} disabled>
              <div className="flex items-center gap-2 w-full">
                {participant.hasStream ? (
                  <Volume2 className="h-4 w-4 text-green-500" />
                ) : (
                  <VolumeX className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="text-sm truncate">
                  {participant.userName || `Utilisateur ${participant.id.substring(0, 8)}...`}
                </span>
              </div>
            </DropdownMenuItem>
          ))}

          {participants.length === 0 && (
            <DropdownMenuItem disabled>
              <span className="text-sm text-muted-foreground">
                Aucun autre participant
              </span>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <Button
        onClick={onEndCall}
        size="sm"
        variant="destructive"
        className="gap-2"
      >
        <PhoneOff className="h-4 w-4" />
        Quitter
      </Button>
    </div>
  );
};
