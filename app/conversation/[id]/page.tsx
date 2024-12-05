'use client';

import { useParams, notFound } from 'next/navigation';
import ConversationViewer from '../../../components/ConversationViewer';

export default function ConversationPage() {
  const params = useParams();
  
  if (!params.id) {
    return notFound();
  }

  return (
    <main className="min-h-screen bg-gray-900 overflow-x-hidden">
      <ConversationViewer conversationId={params.id as string} />
    </main>
  );
}