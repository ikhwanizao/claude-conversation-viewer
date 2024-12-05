'use client';

import { useParams } from 'next/navigation';
import ConversationViewer from '../../../components/ConversationViewer';

export default function ConversationPage() {
  const params = useParams();
  return (
    <main className="min-h-screen bg-gray-900 overflow-x-hidden">
      <ConversationViewer conversationId={params.id as string} />
    </main>
  );
}