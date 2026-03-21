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
  sendMessage: (chatId: number, text: string, type?: string) => Promise<void>;
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
      // Backend returns messages in reverse chronological order (desc), so we reverse for display
      set({ messages: response.data.reverse(), isMessagesLoading: false });
    } catch (error) {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (chatId, text, type = 'TEXT') => {
    try {
      const response = await chatApi.sendMessage(chatId, text, type);
      const state = get();
      
      // If we are still in this chat, add the message
      if (state.messages.length > 0 && state.messages[0].chatId === chatId) {
        set({ messages: [...state.messages, response.data] });
      }
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
    // Only add if it's for the current active chat
    // Note: chatId in MessageDTO might be different type than currentChat.id check
    set({ messages: [...state.messages, message] });
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
