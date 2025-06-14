import Image from 'next/image';
import { signInWithDiscord } from '@/lib/auth';

export const LoginButton = () => {
  return (
    <button
      onClick={() => signInWithDiscord()}
      className="flex items-center justify-center gap-2 px-4 py-2 bg-[#5865F2] hover:bg-[#4752C4] text-white rounded-lg transition-colors"
    >
      <Image
        src="/discord-mark-white.svg"
        alt="Discord Logo"
        width={24}
        height={24}
      />
      <span>Iniciar sesión con Discord</span>
    </button>
  );
};
