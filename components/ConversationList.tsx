'use client';

import { useState, useEffect } from 'react';
import { Upload, Search, AlertCircle, Calendar } from 'lucide-react';
import Link from 'next/link';
import { Conversation } from '../types';

export default function ConversationList() {
    const [conversations, setConversations] = useState<Conversation[] | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        try {
            const storedConversations = localStorage.getItem('conversations');
            if (storedConversations) {
                setConversations(JSON.parse(storedConversations));
            }
        } catch (err) {
            console.error('Error loading conversations:', err);
        }
    }, []);

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        setError(null);

        if (file) {
            setIsLoading(true);
            try {
                const text = await file.text();
                const data = JSON.parse(text);
                const nonEmptyConversations = data
                    .filter((conv: Conversation) => {
                        if (!conv.chat_messages?.length) return false;
                        return conv.chat_messages.some(msg =>
                            msg.text?.trim() ||
                            msg.attachments?.some(att => att.extracted_content?.trim())
                        );
                    });

                if (nonEmptyConversations.length > 0) {
                    localStorage.setItem('conversations', JSON.stringify(nonEmptyConversations));
                    setConversations(nonEmptyConversations);
                } else {
                    setError('No valid conversations found in the file');
                }
            } catch (err) {
                setError('Error reading file. Please make sure it\'s a valid JSON file.');
                console.error('Error parsing JSON:', err);
            } finally {
                setIsLoading(false);
            }
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const filteredConversations = conversations?.filter(conv =>
        conv.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="max-w-4xl mx-auto p-4 text-gray-200">
            {/* File Upload Section */}
            <div className="mb-8">
                <div className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center bg-gray-800">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <label className="mt-4 block">
                        <span className="mt-2 block text-sm font-medium text-gray-300">
                            Upload conversations.json
                        </span>
                        <input
                            type="file"
                            className="mt-2 block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-700 file:text-gray-200 hover:file:bg-gray-600"
                            accept=".json"
                            onChange={handleFileUpload}
                            disabled={isLoading}
                        />
                    </label>
                    {isLoading && <div className="mt-4 text-blue-400">Loading...</div>}
                    {error && (
                        <div className="mt-4 text-red-400 flex items-center justify-center gap-2">
                            <AlertCircle className="h-4 w-4" />
                            {error}
                        </div>
                    )}
                </div>
            </div>

            {/* Search Bar */}
            {conversations && (
                <div className="mb-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search conversations..."
                            className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-400 focus:outline-none focus:border-gray-600"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            )}

            {/* Conversations List */}
            {filteredConversations && (
                <div className="space-y-4">
                    {filteredConversations.map((conv) => (
                        <Link
                            key={conv.uuid}
                            href={`/conversation/${conv.uuid}`}
                            className="block bg-gray-800 rounded-lg p-4 hover:bg-gray-700 transition-colors"
                        >
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-medium text-gray-200">{conv.name}</h2>
                                <div className="flex items-center text-gray-400 text-sm">
                                    <Calendar className="h-4 w-4 mr-1" />
                                    {formatDate(conv.created_at)}
                                </div>
                            </div>
                            <p className="text-gray-400 text-sm mt-2">
                                {conv.chat_messages.length} messages
                            </p>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}