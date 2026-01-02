import React, { useState } from 'react';
import { Users, ChevronDown } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface User {
  userId: string;
  userFullName: string;
  userEmail: string;
}

interface ActiveUsersProps {
  users: User[];
  currentUserId?: string;
}

const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const getColorFromName = (name: string): string => {
  const colors = [
    'bg-blue-500',
    'bg-green-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-yellow-500',
    'bg-red-500',
    'bg-indigo-500',
    'bg-teal-500',
  ];

  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
};

export const ActiveUsers: React.FC<ActiveUsersProps> = React.memo(({ users, currentUserId }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Total des utilisateurs connectés (incluant l'utilisateur courant)
  const totalUsers = users.length;

  // Filtrer l'utilisateur courant pour la liste
  const otherUsers = users.filter((u) => u.userId !== currentUserId);

  if (totalUsers === 0) {
    return null;
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-full hover:bg-green-100 transition-colors">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <Users className="h-4 w-4 text-green-700" />
            <span className="text-sm font-medium text-green-700">
              {totalUsers}
            </span>
          </div>
          <ChevronDown className="h-3 w-3 text-green-700" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3" align="start">
        <div className="space-y-2">
          <h4 className="font-medium text-sm text-gray-900">
            Utilisateurs connectés ({totalUsers})
          </h4>
          <div className="space-y-2">
            {users.map((user) => (
              <div
                key={user.userId}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50"
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback className={`text-xs text-white ${getColorFromName(user.userFullName)}`}>
                    {getInitials(user.userFullName)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user.userFullName}
                    {user.userId === currentUserId && (
                      <span className="ml-1 text-xs text-gray-500">(vous)</span>
                    )}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{user.userEmail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
});

export default ActiveUsers;

