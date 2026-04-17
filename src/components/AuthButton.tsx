import React from 'react';
import { User } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { LogOut, LogIn } from 'lucide-react';

interface AuthButtonProps {
  user: User | null;
  onSignIn: () => void;
  onSignOut: () => void;
  isLoading?: boolean;
}

export const AuthButton = ({ user, onSignIn, onSignOut, isLoading }: AuthButtonProps) => {
  if (user) {
    return (
      <div className="flex items-center gap-3">
        <img
          src={user.photoURL || '/default-avatar.png'}
          alt={user.displayName || 'User'}
          className="h-8 w-8 rounded-full border border-primary/20"
        />
        <Button
          variant="ghost"
          size="sm"
          onClick={onSignOut}
          className="text-muted-foreground hover:text-destructive"
        >
          <LogOut className="h-4 w-4 mr-1" />
          Sair
        </Button>
      </div>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onSignIn}
      disabled={isLoading}
      className="gap-2"
    >
      <LogIn className="h-4 w-4" />
      {isLoading ? 'Entrando...' : 'Entrar com Google'}
    </Button>
  );
};