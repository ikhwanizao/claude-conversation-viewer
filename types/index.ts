export interface Attachment {
    file_name: string;
    file_size?: number;
    file_type?: string;
    extracted_content?: string;
  }
  
  export interface ChatMessage {
    uuid: string;
    text: string;
    content: Array<{ type: string; text: string }>;
    sender: 'human' | 'assistant';
    created_at: string;
    updated_at: string;
    attachments: Attachment[];
    files: Array<{ file_name: string }>;
  }
  
  export interface Conversation {
    uuid: string;
    name: string;
    created_at: string;
    updated_at: string;
    account: {
      uuid: string;
    };
    chat_messages: ChatMessage[];
  }