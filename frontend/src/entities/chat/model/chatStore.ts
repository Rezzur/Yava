import { create } from 'zustand';
import { chatApi, userApi, type ChatDTO, type MessageDTO, type UserSummary } from '@/shared/api/client';

interface ChatState {
  chats: ChatDTO[];
  currentChat: ChatDTO | null;
  activeChatId: number | null;
  messages: MessageDTO[];
  isLoading: boolean;
  isMessagesLoading: boolean;
  searchResults: UserSummary[];
  isSearching: boolean;
  
  fetchChats: () => Promise<void>;
  setCurrentChat: (chat: ChatDTO | null) => void;
  setActiveChatId: (id: number | null) => void;
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
  activeChatId: null,
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

  setCurrentChat: (chat) => set({ currentChat: chat }),
  setActiveChatId: (id) => set({ activeChatId: id }),

  fetchMessages: async (chatId) => {
    set({ isMessagesLoading: true, activeChatId: chatId });
    try {
      console.log('Fetching messages for chat:', chatId);
      const response = await chatApi.getMessages(chatId);
      const msgs = Array.isArray(response.data) ? [...response.data].reverse() : [];
      set({ messages: msgs, isMessagesLoading: false });
      
      // Auto mark as read
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
      
      // Add message manually only if it hasn't been added by WebSocket yet
      if (!state.messages.find(m => m.id === response.data.id)) {
        set({ messages: [...state.messages, response.data] });
      }
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
    console.log('WS incoming message:', message);
    
    // 1. Update sidebar for this chat
    get().updateChatLastMessage(message.chatId, message.text, message.timestamp);

    // 2. If it's for another chat, increment unread count
    if (state.activeChatId !== message.chatId) {
      set({
        chats: state.chats.map(chat =>
          chat.id === message.chatId ? { ...chat, unreadCount: (chat.unreadCount || 0) + 1 } : chat
        )
      });
      return;
    }

    // 3. If it's for current chat, add to list if not present
    if (!state.messages.find(m => m.id === message.id)) {
      set({ messages: [...state.messages, message] });
      // Since we are looking at it, mark as read on backend
      chatApi.markAsRead(message.chatId);
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
