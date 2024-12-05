import { useState } from 'react';
import { Upload, MessageCircle, Calendar, Search, AlertCircle, Paperclip } from 'lucide-react';

interface Attachment {
    file_name: string;
    file_size?: number;
    file_type?: string;
    extracted_content?: string;
}

interface ChatMessage {
    uuid: string;
    text: string;
    content: Array<{ type: string; text: string }>;
    sender: 'human' | 'assistant';
    created_at: string;
    updated_at: string;
    attachments: Attachment[];
    files: Array<{ file_name: string }>;
}

interface Conversation {
    uuid: string;
    name: string;
    created_at: string;
    updated_at: string;
    account: {
        uuid: string;
    };
    chat_messages: ChatMessage[];
}

export default function ConversationViewer() {
    const [conversations, setConversations] = useState<Conversation[] | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const sortMessages = (messages: ChatMessage[]) => {
        return [...messages].sort((a, b) => {
            // First compare timestamps
            const timeComparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();

            // If timestamps are different, use that
            if (timeComparison !== 0) return timeComparison;

            // For same timestamps, ensure human messages come first
            return a.sender === 'human' ? -1 : 1;
        });
    };

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
                    })
                    .map((conv: Conversation) => ({
                        ...conv,
                        chat_messages: sortMessages(conv.chat_messages)
                    }));

                setConversations(nonEmptyConversations);
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
        conv.chat_messages.length > 0 &&
        (conv.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            conv.chat_messages.some(msg =>
                msg.text.toLowerCase().includes(searchTerm.toLowerCase())
            ))
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
                    {isLoading && (
                        <div className="mt-4 text-blue-400">Loading...</div>
                    )}
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
                <div className="mb-6 relative">
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

            {/* Conversations Display */}
            {filteredConversations && (
                <div className="space-y-6">
                    {filteredConversations.map((conv) => (
                        <div key={conv.uuid} className="bg-gray-800 rounded-lg shadow-xl p-6 border border-gray-700">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-gray-200">{conv.name}</h2>
                                <div className="flex items-center text-gray-400 text-sm">
                                    <Calendar className="h-4 w-4 mr-1" />
                                    {formatDate(conv.created_at)}
                                </div>
                            </div>

                            <div className="space-y-4">
                                {conv.chat_messages.map((msg) => (
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
                                            {/* Update this part */}
                                            <div className="text-gray-200 whitespace-pre-wrap break-words max-w-full overflow-x-auto">
                                                {msg.text}
                                            </div>
                                            {/* And update the attachments part */}
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
                    ))}
                </div>
            )}
        </div>
    );
}