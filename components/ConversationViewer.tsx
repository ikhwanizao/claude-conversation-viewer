'use client';

import { useState, useEffect } from 'react';
import { MessageCircle, Calendar, Paperclip, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Conversation, ChatMessage } from '../types';

interface ConversationViewerProps {
    conversationId: string;
}

const sortMessages = (messages: ChatMessage[]) => {
    return [...messages].sort((a, b) => {
        const timeComparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();

        if (timeComparison !== 0) return timeComparison;

        return a.sender === 'human' ? -1 : 1;
    });
};

export default function ConversationViewer({ conversationId }: ConversationViewerProps) {
    const [conversation, setConversation] = useState<Conversation | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const storedData = localStorage.getItem('conversations');
        if (!storedData) {
            setError('No conversations found. Please upload a conversations file.');
            return;
        }

        try {
            const conversations = JSON.parse(storedData);
            const conv = conversations.find((c: Conversation) => c.uuid === conversationId);
            if (conv) {
                conv.chat_messages = sortMessages(conv.chat_messages);
                setConversation(conv);
            } else {
                setError('Conversation not found');
            }
        } catch {
            setError('Error loading conversation data');
        }
    }, [conversationId]);

    if (error) {
        return (
            <div className="max-w-4xl mx-auto p-4 text-gray-200">
                <Link href="/" className="flex items-center text-blue-400 hover:text-blue-300 mb-4">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to conversations
                </Link>
                <div className="text-center mt-8 bg-gray-800 p-6 rounded-lg">
                    <p className="text-red-400">{error}</p>
                </div>
            </div>
        );
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (!conversation) {
        return (
            <div className="max-w-4xl mx-auto p-4 text-gray-200">
                <Link href="/" className="flex items-center text-blue-400 hover:text-blue-300">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to conversations
                </Link>
                <div className="text-center mt-8">Conversation not found</div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-4 text-gray-200">
            <div className="mb-4">
                <Link href="/" className="flex items-center text-blue-400 hover:text-blue-300">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to conversations
                </Link>
            </div>

            <div className="bg-gray-800 rounded-lg shadow-xl p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-xl font-bold">{conversation.name}</h1>
                    <div className="flex items-center text-gray-400 text-sm">
                        <Calendar className="h-4 w-4 mr-1" />
                        {formatDate(conversation.created_at)}
                    </div>
                </div>

                <div className="space-y-4">
                    {conversation.chat_messages.map((msg) => (
                        <div
                            key={msg.uuid}
                            className={`flex ${msg.sender === 'assistant' ? 'justify-start' : 'justify-end'
                                }`}
                        >
                            <div
                                className={`max-w-[80%] rounded-lg p-4 ${msg.sender === 'assistant'
                                    ? 'bg-gray-700'
                                    : 'bg-gray-600'
                                    }`}
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    <MessageCircle className="h-4 w-4 text-gray-400" />
                                    <span className="font-medium text-gray-200">
                                        {msg.sender === 'assistant' ? 'Claude' : 'User'}
                                    </span>
                                    <span className="text-xs text-gray-400">
                                        {formatDate(msg.created_at)}
                                    </span>
                                </div>
                                <div className="text-gray-200 whitespace-pre-wrap break-words max-w-full overflow-x-auto">
                                    {msg.text}
                                </div>
                                {msg.attachments.length > 0 && (
                                    <div className="mt-4 space-y-2">
                                        {msg.attachments.map((attachment, index) => (
                                            <div key={index} className="bg-gray-900 rounded p-3">
                                                <div className="flex items-center gap-2 mb-2 text-gray-400">
                                                    <Paperclip className="h-4 w-4" />
                                                    <span className="text-sm font-medium">
                                                        {attachment.file_name}
                                                    </span>
                                                </div>
                                                {attachment.extracted_content && (
                                                    <pre className="text-sm text-gray-300 whitespace-pre-wrap break-words font-mono bg-gray-800 p-2 rounded mt-2 overflow-x-auto">
                                                        {attachment.extracted_content}
                                                    </pre>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}