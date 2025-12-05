import React from 'react';
import UserProfileClient from '@/components/profile/UserProfileClient';

interface PageProps {
  params: {
    username: string;
  };
}

// Generar parámetros estáticos vacíos (requerido para export)
export async function generateStaticParams() {
  return [];
}

// Permitir parámetros dinámicos
export const dynamicParams = true;

export default function UserProfilePage({ params }: PageProps) {
  return <UserProfileClient username={params.username} />;
}
