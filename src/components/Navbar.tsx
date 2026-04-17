"use client";

import React from 'react';
import { Search, BookOpen, Cloud, CloudOff } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { AuthButton } from './AuthButton';
import { User } from 'firebase/auth';

interface NavbarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  user: User | null;
  onSignIn: () => void;
  onSignOut: () => void;
  syncStatus?: 'idle' | 'syncing' | 'synced' | 'error';
  isLoading?: boolean;
}

const Navbar = ({ searchQuery, setSearchQuery, user, onSignIn, onSignOut, syncStatus, isLoading }: NavbarProps) => {
  const location = useLocation();

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 md:px-8">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center space-x-2">
            <BookOpen className="h-6 w-6 text-primary" />
            <span className="hidden font-bold sm:inline-block text-xl tracking-tight">
              LexiC2
            </span>
          </Link>
          <div className="flex items-center space-x-4 text-sm font-medium">
            <Link
              to="/"
              className={cn(
                "transition-colors hover:text-primary",
                location.pathname === "/" ? "text-primary" : "text-muted-foreground"
              )}
            >
              Dashboard
            </Link>
            <Link
              to="/list"
              className={cn(
                "transition-colors hover:text-primary",
                location.pathname === "/list" ? "text-primary" : "text-muted-foreground"
              )}
            >
              Word List
            </Link>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-end space-x-4">
          {syncStatus && (
            <div className="flex items-center text-xs text-muted-foreground" title={syncStatus === 'synced' ? 'Sincronizado na nuvem' : syncStatus === 'syncing' ? 'Sincronizando...' : 'Salvo localmente'}>
              {user ? (
                syncStatus === 'synced' ? <Cloud className="h-4 w-4 text-green-500" /> : 
                syncStatus === 'syncing' ? <Cloud className="h-4 w-4 animate-pulse text-blue-500" /> :
                <CloudOff className="h-4 w-4 text-amber-500" />
              ) : (
                <CloudOff className="h-4 w-4 text-muted-foreground/50" />
              )}
            </div>
          )}
          
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search C2 words..."
              className="h-10 w-full rounded-full border border-input bg-background pl-10 pr-4 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <AuthButton 
            user={user} 
            onSignIn={onSignIn} 
            onSignOut={onSignOut}
            isLoading={isLoading}
          />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;