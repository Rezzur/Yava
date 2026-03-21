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
  markAsRead: (chatId: number) => Promise<void>;
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
      console.error('Failed to fetch chats:', error);
      set({ isLoading: false });
    }
  },

  setCurrentChat: (chat) => set({ currentChat: chat, messages: [] }),

  fetchMessages: async (chatId) => {
    set({ isMessagesLoading: true });
    try {
      console.log('Fetching messages for chat:', chatId);
      const response = await chatApi.getMessages(chatId);
      // Backend returns messages in reverse chronological order (desc), so we reverse for display
      const msgs = Array.isArray(response.data) ? [...response.data].reverse() : [];
      set({ messages: msgs, isMessagesLoading: false });
      
      // Auto mark as read when fetching messages
      get().markAsRead(chatId);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (chatId, text, type = 'TEXT') => {
    try {
      const response = await chatApi.sendMessage(chatId, text, type);
      const state = get();
      
      // Add message locally
      set({ messages: [...state.messages, response.data] });
      get().updateChatLastMessage(chatId, text, response.data.timestamp);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  },

  markAsRead: async (chatId) => {
    try {
      await chatApi.markAsRead(chatId);
      const state = get();
      set({
        chats: state.chats.map(chat => 
          chat.id === chatId ? { ...chat, unreadCount: 0 } : chat
        )
      });
    } catch (error) {
      console.error('Failed to mark as read:', error);
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
      console.error('Search failed:', error);
      set({ searchResults: [], isSearching: false });
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
    // Avoid duplicates
    if (!state.messages.find(m => m.id === message.id)) {
      set({ messages: [...state.messages, message] });
      
      // Update unread count if it's not the current chat
      // or if it IS the current chat but window is not focused (simplified for now)
      get().updateChatLastMessage(message.chatId, message.text, message.timestamp);
      
      // If message is from others and not in current chat, increment unread
      // Note: in a real app we'd check if chat is active
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
