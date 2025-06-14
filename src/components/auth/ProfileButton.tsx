import Image from 'next/image';
import { signOut } from '@/lib/auth';
import { useState } from 'react';

interface ProfileButtonProps {
  username: string;
  avatarUrl: string;
}

export const ProfileButton = ({ username, avatarUrl }: ProfileButtonProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="flex items-center gap-2 px-2 py-1 rounded-full hover:bg-gray-700/20 transition-colors"
      >
        <div className="w-8 h-8 rounded-full overflow-hidden">         
            <Image
            src={avatarUrl}
            alt={username}
            width={32}
            height={32}
            className="w-full h-full object-cover"
            priority
            unoptimized
            onError={(e) => {
              const img = e.target as HTMLImageElement;
              img.src = '/default-avatar.png';
            }}
            ></Image>
        </div>
        <span className="text-sm font-medium">{username}</span>
      </button>

      {isMenuOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5">
          <div className="py-1">
            <button
              onClick={() => signOut()}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
