import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('yavimax_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('yavimax_token');
      localStorage.removeItem('yavimax_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export interface AuthResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  user: UserSummary;
}

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
  title?: string;
  avatarUrl?: string;
  lastMessage?: string;
  unreadCount: number;
  timestamp: string;
  isPinned?: boolean;
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

export const authApi = {
  register: (data: { name: string; username: string; phone: string; password: string }) =>
    api.post<AuthResponse>('/auth/register', data),

  login: (data: { identifier: string; password: string }) =>
    api.post<AuthResponse>('/auth/login', data),
};

export const userApi = {
  me: () => api.get<UserSummary>('/users/me'),
  
  search: (query: string) => 
    api.get<UserSummary[]>('/users/search', { params: { query } }),
};

export const chatApi = {
  getChats: () => api.get<ChatDTO[]>('/chats'),
  
  createChat: (userId: number) => 
    api.post<ChatDTO>('/chats', null, { params: { userId } }),
  
  getMessages: (chatId: number, page = 0, size = 50) =>
    api.get<MessageDTO[]>(`/chats/${chatId}/messages`, { params: { page, size } }),
  
  sendMessage: (chatId: number, text: string) =>
    api.post<MessageDTO>(`/chats/${chatId}/messages`, { text }),
};

export default api;
