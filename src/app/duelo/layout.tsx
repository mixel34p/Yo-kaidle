import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Yo-kaidle Duelo - Desafía a tus amigos o a la IA',
  description: 'Modo duelo de Yo-kaidle. Compite contra otro jugador o contra la IA para adivinar el Yo-kai antes que tu rival.',
};

export default function DueloLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <header className="mb-6 text-center">
        <div className="flex justify-center mb-4 px-1">
          <Link href="/">
            <img 
              src="/images/logo/logo.png" 
              alt="Yo-kaidle Logo" 
              className="w-full object-contain drop-shadow-2xl" 
              style={{ maxHeight: 'calc(20vh)' }}
            />
          </Link>
        </div>
        <h1 className="text-3xl font-bold">Modo Duelo</h1>
        <p className="mt-2 text-gray-600 font-medium">Demuestra quién es el verdadero maestro Yo-kai</p>
      </header>
      {children}
    </div>
  );
}