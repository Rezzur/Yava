import { create } from 'zustand';
import { chatApi, userApi, type ChatDTO, type MessageDTO, type UserSummary } from '@/shared/api/client';

interface ChatState {
  chats: ChatDTO[];
  currentChat: ChatDTO | null;
  messages: MessageDTO[];
  isLoading: boolean;
  isMessagesLoading: boolean;
  searchResults: UserSummary[];
  isSearching: boolean;
  
  fetchChats: () => Promise<void>;
  setCurrentChat: (chat: ChatDTO | null) => void;
  fetchMessages: (chatId: number) => Promise<void>;
  sendMessage: (chatId: number, text: string) => Promise<void>;
  searchUsers: (query: string) => Promise<void>;
  clearSearch: () => void;
  createChat: (userId: number) => Promise<ChatDTO>;
  addMessage: (message: MessageDTO) => void;
  updateChatLastMessage: (chatId: number, text: string, timestamp: string) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  chats: [],
  currentChat: null,
  messages: [],
  isLoading: false,
  isMessagesLoading: false,
  searchResults: [],
  isSearching: false,

  fetchChats: async () => {
    set({ isLoading: true });
    try {
      const response = await chatApi.getChats();
      set({ chats: response.data, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
    }
  },

  setCurrentChat: (chat) => set({ currentChat: chat, messages: [] }),

  fetchMessages: async (chatId) => {
    set({ isMessagesLoading: true });
    try {
      const response = await chatApi.getMessages(chatId);
      set({ messages: response.data.reverse(), isMessagesLoading: false });
    } catch (error) {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (chatId, text) => {
    try {
      const response = await chatApi.sendMessage(chatId, text);
      const state = get();
      
      set({ messages: [...state.messages, response.data] });
      get().updateChatLastMessage(chatId, text, response.data.timestamp);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  },

  searchUsers: async (query) => {
    if (!query.trim()) {
      set({ searchResults: [] });
      return;
    }
    set({ isSearching: true });
    try {
      const response = await userApi.search(query);
      set({ searchResults: response.data, isSearching: false });
    } catch (error) {
      set({ isSearching: false });
    }
  },

  clearSearch: () => set({ searchResults: [] }),

  createChat: async (userId) => {
    const response = await chatApi.createChat(userId);
    const state = get();
    
    if (!state.chats.find(c => c.id === response.data.id)) {
      set({ chats: [response.data, ...state.chats] });
    }
    return response.data;
  },

  addMessage: (message) => {
    const state = get();
    if (!state.messages.find(m => m.id === message.id)) {
      set({ messages: [...state.messages, message] });
    }
  },

  updateChatLastMessage: (chatId, text, timestamp) => {
    const state = get();
    set({
      chats: state.chats.map(chat =>
        chat.id === chatId ? { ...chat, lastMessage: text, timestamp } : chat
      ),
    });
  },
}));
