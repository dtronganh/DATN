export interface GearChatboxSuggestion {
  id: number;
  name: string;
  slug: string;
  price: number;
  stock: number;
  thumbnail: string | null;
}

export interface GearChatboxHistoryItem {
  role: 'user' | 'assistant';
  content: string;
}

export interface GearChatboxAskPayload {
  message: string;
  locale?: string;
  history?: GearChatboxHistoryItem[];
}

export interface GearChatboxAskResponse {
  answer: string;
  suggestions: GearChatboxSuggestion[];
}
