'use client';

import ConversationList from '@/components/ConversationList';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-900 overflow-x-hidden">
      <ConversationList />
    </main>
  );
}