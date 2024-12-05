'use client';

import ConversationViewer from '../components/ConversationViewer';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-900 overflow-x-hidden">
      <ConversationViewer />
    </main>
  );
}