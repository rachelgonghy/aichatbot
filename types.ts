
export enum Role {
  USER = 'user',
  MODEL = 'model'
}

export interface Attachment {
  mimeType: string;
  data: string; // base64
  url: string;
}

export interface Message {
  id: string;
  role: Role;
  text: string;
  attachments?: Attachment[];
  timestamp: Date;
  isStreaming?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
}
