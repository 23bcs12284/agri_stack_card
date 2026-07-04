import React from 'react';
import CardDetailClient from './CardDetailClient';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CardDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <CardDetailClient id={id} />;
}
