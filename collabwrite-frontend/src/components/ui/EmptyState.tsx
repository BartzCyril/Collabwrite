import React from 'react';
import { FileText, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  action?: { label: string; onClick: () => void };
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title, description, icon = <FileText className="h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground" />,
  action, className = '',
}) => {
  return (
    <Card className={`p-4 sm:p-8 text-center ${className}`}>
      <div className="flex flex-col items-center gap-3 sm:gap-4">
        <div className="rounded-full bg-muted p-3 sm:p-4">{icon}</div>
        <div className="space-y-1 sm:space-y-2">
          <h3 className="text-base sm:text-lg font-semibold text-foreground">{title}</h3>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-sm px-2 sm:px-0">{description}</p>
        </div>
        {action && (
          <Button onClick={action.onClick} className="mt-2 sm:mt-4 w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            {action.label}
          </Button>
        )}
      </div>
    </Card>
  );
};

export default EmptyState;
