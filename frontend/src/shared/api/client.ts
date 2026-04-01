import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('yavimax_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('yavimax_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export interface UserSummary {
  id: number;
  name: string;
  username: string;
  phone: string;
  avatarUrl?: string;
  bio?: string;
  status?: string;
}

export interface ChatDTO {
  id: number;
  type: 'private' | 'group' | 'channel';
  title: string;
  avatarUrl?: string;
  lastMessage?: string;
  unreadCount: number;
  timestamp: string;
  isPinned: boolean;
  user?: UserSummary;
  membersCount?: number;
}

export interface MessageDTO {
  id: number;
  chatId: number;
  sender: UserSummary;
  text: string;
  type: string;
  mediaUrl?: string;
  isRead: boolean;
  timestamp: string;
  createdAt: string;
  isMe?: boolean;
}

export interface AuthResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  user: UserSummary;
}

export const authApi = {
  register: (data: { name: string; username: string; phone: string; password: string }) =>
    api.post<AuthResponse>('/auth/register', data),
  
  login: (data: { identifier: string; password: string }) =>
    api.post<AuthResponse>('/auth/login', data),
};

export const userApi = {
  search: (query: string) =>
    api.get<UserSummary[]>('/users/search', { params: { query } }),
  
  getProfile: () =>
    api.get<UserSummary>('/users/profile'),
};

export const chatApi = {
  getChats: () =>
    api.get<ChatDTO[]>('/chats'),
  
  createChat: (userId: number) =>
    api.post<ChatDTO>('/chats', null, { params: { userId } }),
  
  getMessages: (chatId: number, page = 0, size = 50) =>
    api.get<MessageDTO[]>(`/chats/${chatId}/messages`, { params: { page, size } }),
  
  sendMessage: (chatId: number, text: string, type = 'TEXT', mediaUrl?: string) =>
    api.post<MessageDTO>(`/chats/${chatId}/messages`, { text, type, mediaUrl }),

  markAsRead: (chatId: number) =>
    api.post<void>(`/chats/${chatId}/read`),
};

export const fileApi = {
  upload: (file: File | Blob, fileName: string = 'file') => {
    const formData = new FormData();
    // Important: if it's a Blob (voice), we must provide a filename
    formData.append('file', file, fileName);
    
    return api.post<{ url: string; filename: string }>('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

export default api;
