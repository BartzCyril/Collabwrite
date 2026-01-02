import React from 'react';
import { Card } from '@/components/ui/card';

export const LoadingSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`animate-pulse ${className}`}>
      <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
      <div className="h-4 bg-muted rounded w-5/6"></div>
    </div>
  );
};

export const DocumentSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => {
  return (
    <div className="space-y-3 sm:space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index} className="p-3 sm:p-4">
          <div className="space-y-2 sm:space-y-3">
            <div className="flex items-center justify-between">
              <div className="h-4 sm:h-5 bg-muted rounded w-1/3 animate-pulse"></div>
              <div className="h-3 sm:h-4 bg-muted rounded w-12 sm:w-16 animate-pulse"></div>
            </div>
            <div className="space-y-2">
              <div className="h-3 sm:h-4 bg-muted rounded w-full animate-pulse"></div>
              <div className="h-3 sm:h-4 bg-muted rounded w-4/5 animate-pulse"></div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default LoadingSkeleton;
