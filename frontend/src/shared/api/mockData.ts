import type { ChatDTO, MessageDTO, UserSummary } from './client';

export type { ChatDTO, MessageDTO, UserSummary };

export const currentUser: UserSummary = {
  id: 1,
  name: "Иван Иванов",
  username: "@ivan_yavi",
  phone: "+7 (999) 123-45-67",
  avatarUrl: "https://i.pravatar.cc/150?u=me",
  bio: "Люблю Yavimax, лучший мессенджер!",
};

export const USERS: Record<string, UserSummary> = {
  "1": {
    id: 1,
    name: "Павел Явимакс",
    username: "@pavel_yavimax",
    phone: "+7 (900) 000-00-00",
    avatarUrl: "https://i.pravatar.cc/150?u=pavel",
    status: "в сети",
  },
  "2": {
    id: 2,
    name: "Мама",
    username: "",
    phone: "+7 (911) 111-11-11",
    avatarUrl: "https://i.pravatar.cc/150?u=mom",
    status: "недавно",
  },
  "3": {
    id: 3,
    name: "Илья (Дизайн)",
    username: "@ilya_design",
    phone: "+7 (922) 222-22-22",
    avatarUrl: "https://i.pravatar.cc/150?u=ilya",
    status: "в сети",
  },
};

export const CHATS: ChatDTO[] = [
  {
    id: 1,
    type: "private",
    user: USERS["1"],
    lastMessage: "Привет! Как тебе новый дизайн Yavimax?",
    unreadCount: 2,
    timestamp: "15:42",
    isPinned: true
  },
  {
    id: 2,
    type: "channel",
    title: "Yavimax News",
    avatarUrl: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=150&h=150&fit=crop",
    membersCount: 142030,
    lastMessage: "Вышло обновление 1.0!",
    unreadCount: 15,
    timestamp: "12:00",
    isPinned: true
  },
  {
    id: 3,
    type: "private",
    user: USERS["2"],
    lastMessage: "Ты покушал?",
    unreadCount: 0,
    timestamp: "Вчера"
  },
  {
    id: 4,
    type: "group",
    title: "Фронтендеры на галере",
    avatarUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=150&h=150&fit=crop",
    membersCount: 42,
    lastMessage: "Илья: Кто сломал прод?",
    unreadCount: 102,
    timestamp: "Вчера"
  },
  {
    id: 5,
    type: "private",
    user: USERS["3"],
    lastMessage: "Скинь макеты по Явимаксу",
    unreadCount: 0,
    timestamp: "Ср"
  }
];

export const MESSAGES: Record<number, MessageDTO[]> = {
  1: [
    { id: 1, chatId: 1, sender: USERS["1"], text: "Привет! Добро пожаловать в Yavimax.", type: "text", isRead: true, timestamp: "15:40", createdAt: new Date().toISOString() },
    { id: 2, chatId: 1, sender: { id: 1, name: "Иван", username: "@ivan", phone: "", avatarUrl: "" }, text: "Ого, выглядит прямо как Telegram!", type: "text", isRead: true, timestamp: "15:41", createdAt: new Date().toISOString() },
    { id: 3, chatId: 1, sender: USERS["1"], text: "Как тебе новый дизайн?", type: "text", isRead: false, timestamp: "15:42", createdAt: new Date().toISOString() },
  ],
  2: [
    { id: 4, chatId: 2, sender: USERS["1"], text: "Добро пожаловать в официальный канал Yavimax News!", type: "text", isRead: true, timestamp: "10:00", createdAt: new Date().toISOString() },
    { id: 5, chatId: 2, sender: USERS["1"], text: "Вышло обновление 1.0!", type: "text", isRead: false, timestamp: "12:00", createdAt: new Date().toISOString() },
  ],
  3: [
    { id: 6, chatId: 3, sender: USERS["2"], text: "Сынок, ты когда приедешь?", type: "text", isRead: true, timestamp: "Вчера", createdAt: new Date().toISOString() },
    { id: 7, chatId: 3, sender: { id: 1, name: "Иван", username: "@ivan", phone: "", avatarUrl: "" }, text: "Мам, я занят, пишу клон телеграма.", type: "text", isRead: true, timestamp: "Вчера", createdAt: new Date().toISOString() },
  ],
  4: [
    { id: 8, chatId: 4, sender: USERS["3"], text: "Антон: Ребят, у нас баг в продакшене", type: "text", isRead: true, timestamp: "Вчера", createdAt: new Date().toISOString() },
    { id: 9, chatId: 4, sender: USERS["3"], text: "Илья: Кто сломал прод?", type: "text", isRead: true, timestamp: "Вчера", createdAt: new Date().toISOString() },
  ],
  5: [
    { id: 10, chatId: 5, sender: USERS["3"], text: "Скинь макеты по Явимаксу, клиент ждет.", type: "text", isRead: true, timestamp: "Ср", createdAt: new Date().toISOString() },
  ],
};
