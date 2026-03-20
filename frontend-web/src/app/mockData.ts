export type User = {
  id: string;
  name: string;
  avatar: string;
  status: string;
  phone: string;
  username: string;
  bio?: string;
};

export type Message = {
  id: string;
  chatId: string;
  text: string;
  timestamp: string;
  isMe: boolean;
  isRead: boolean;
};

export type Chat = {
  id: string;
  type: 'private' | 'group' | 'channel';
  user?: User; // for private
  title?: string; // for group/channel
  avatar?: string; // for group/channel
  membersCount?: number;
  lastMessage: string;
  unreadCount: number;
  timestamp: string;
  isPinned?: boolean;
};

export const currentUser: User = {
  id: "me",
  name: "Иван Иванов",
  avatar: "https://i.pravatar.cc/150?u=me",
  status: "в сети",
  phone: "+7 (999) 123-45-67",
  username: "@ivan_yavi",
  bio: "Люблю Yavimax, лучший мессенджер!"
};

export const USERS: Record<string, User> = {
  "u1": {
    id: "u1",
    name: "Павел Явимакс",
    avatar: "https://i.pravatar.cc/150?u=pavel",
    status: "был(а) недавно",
    phone: "+7 (900) 000-00-00",
    username: "@pavel_yavimax",
    bio: "Основатель Yavimax."
  },
  "u2": {
    id: "u2",
    name: "Мама",
    avatar: "https://i.pravatar.cc/150?u=mom",
    status: "в сети",
    phone: "+7 (911) 111-11-11",
    username: "",
  },
  "u3": {
    id: "u3",
    name: "Илья (Дизайн)",
    avatar: "https://i.pravatar.cc/150?u=ilya",
    status: "был(а) в 14:20",
    phone: "+7 (922) 222-22-22",
    username: "@ilya_design"
  }
};

export const CHATS: Chat[] = [
  {
    id: "c1",
    type: "private",
    user: USERS["u1"],
    lastMessage: "Привет! Как тебе новый дизайн Yavimax? Мы старались сделать его максимально похожим на... ну, ты понял.",
    unreadCount: 2,
    timestamp: "15:42",
    isPinned: true
  },
  {
    id: "c2",
    type: "channel",
    title: "Yavimax News",
    avatar: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=150&h=150&fit=crop",
    membersCount: 142030,
    lastMessage: "Вышло обновление 1.0! Теперь мы поддерживаем темную тему.",
    unreadCount: 15,
    timestamp: "12:00",
    isPinned: true
  },
  {
    id: "c3",
    type: "private",
    user: USERS["u2"],
    lastMessage: "Ты покушал? Опять в своем компьютере сидишь?",
    unreadCount: 0,
    timestamp: "Вчера"
  },
  {
    id: "c4",
    type: "group",
    title: "Фронтендеры на галере",
    avatar: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=150&h=150&fit=crop",
    membersCount: 42,
    lastMessage: "Илья: Кто сломал прод?",
    unreadCount: 102,
    timestamp: "Вчера"
  },
  {
    id: "c5",
    type: "private",
    user: USERS["u3"],
    lastMessage: "Скинь макеты по Явимаксу, клиент ждет.",
    unreadCount: 0,
    timestamp: "Ср"
  }
];

export const MESSAGES: Record<string, Message[]> = {
  "c1": [
    { id: "m1", chatId: "c1", text: "Привет! Добро пожаловать в Yavimax.", timestamp: "15:40", isMe: false, isRead: true },
    { id: "m2", chatId: "c1", text: "Ого, выглядит прямо как Telegram!", timestamp: "15:41", isMe: true, isRead: true },
    { id: "m3", chatId: "c1", text: "Привет! Как тебе новый дизайн Yavimax? Мы старались сделать его максимально похожим на... ну, ты понял.", timestamp: "15:42", isMe: false, isRead: false },
    { id: "m4", chatId: "c1", text: "И да, это тестовое сообщение, чтобы показать как выглядят непрочитанные.", timestamp: "15:42", isMe: false, isRead: false }
  ],
  "c2": [
    { id: "m5", chatId: "c2", text: "Добро пожаловать в официальный канал Yavimax News!", timestamp: "10:00", isMe: false, isRead: true },
    { id: "m6", chatId: "c2", text: "Вышло обновление 1.0! Теперь мы поддерживаем темную тему.", timestamp: "12:00", isMe: false, isRead: false }
  ],
  "c3": [
    { id: "m7", chatId: "c3", text: "Сынок, ты когда приедешь?", timestamp: "Вчера", isMe: false, isRead: true },
    { id: "m8", chatId: "c3", text: "Мам, я занят, пишу клон телеграма.", timestamp: "Вчера", isMe: true, isRead: true },
    { id: "m9", chatId: "c3", text: "Ты покушал? Опять в своем компьютере сидишь?", timestamp: "Вчера", isMe: false, isRead: true }
  ],
  "c4": [
    { id: "m10", chatId: "c4", text: "Антон: Ребят, у нас баг в продакшене", timestamp: "Вчера", isMe: false, isRead: true },
    { id: "m11", chatId: "c4", text: "Илья: Кто сломал прод?", timestamp: "Вчера", isMe: false, isRead: true }
  ],
  "c5": [
    { id: "m12", chatId: "c5", text: "Скинь макеты по Явимаксу, клиент ждет.", timestamp: "Ср", isMe: false, isRead: true }
  ]
};
