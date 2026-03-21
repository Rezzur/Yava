import { useParams } from "react-router-dom";
import { useChatStore } from "@/entities/chat/model/chatStore";
import { useUser } from "@/entities/user/model/useUser";
import { useWebSocket } from "@/shared/api/websocket";
import { Search, Phone, MoreVertical, Paperclip, Smile, Mic, Send, Check, CheckCheck, FileText, Image as ImageIcon, User as UserIcon, ChevronDown, Reply, Copy, Trash2, X, PhoneOff, MicOff, Video, Bell, Image, Link as LinkIcon, File } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { clsx } from "clsx";

export function ChatArea() {
  const { chatId } = useParams();
  const [inputText, setInputText] = useState("");
  const [isAttachOpen, setIsAttachOpen] = useState(false);
  const [activeMessageId, setActiveMessageId] = useState<number | null>(null);
  
  const [isCallOpen, setIsCallOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isEmojiOpen, setIsEmojiOpen] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const attachMenuRef = useRef<HTMLDivElement>(null);
  const messageMenuRef = useRef<HTMLDivElement>(null);
  const emojiMenuRef = useRef<HTMLDivElement>(null);

  const { user: currentUser } = useUser();
  const { chats, messages, fetchMessages, sendMessage, isLoading, isMessagesLoading } = useChatStore();
  const { subscribeToChat } = useWebSocket();

  const chat = chats.find(c => c.id === Number(chatId));

  // Fetch messages when chat changes
  useEffect(() => {
    if (chatId) {
      fetchMessages(Number(chatId));
    }
  }, [chatId]);

  // Subscribe to WebSocket for real-time messages
  useEffect(() => {
    if (chatId) {
      const subscription = subscribeToChat(Number(chatId));
      return () => {
        subscription?.unsubscribe();
      };
    }
  }, [chatId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (attachMenuRef.current && !attachMenuRef.current.contains(event.target as Node)) setIsAttachOpen(false);
      if (messageMenuRef.current && !messageMenuRef.current.contains(event.target as Node)) setActiveMessageId(null);
      if (emojiMenuRef.current && !emojiMenuRef.current.contains(event.target as Node)) setIsEmojiOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSendMessage = async () => {
    if (!inputText.trim() || !chatId) return;
    await sendMessage(Number(chatId), inputText.trim());
    setInputText("");
  };

  const handleSendFile = async (type: 'IMAGE' | 'DOCUMENT') => {
    // For now, since we don't have a real upload endpoint, 
    // we'll just send a text message indicating the type
    if (!chatId) return;
    const text = type === 'IMAGE' ? "📷 Фотография" : "📄 Документ";
    await sendMessage(Number(chatId), text);
    setIsAttachOpen(false);
  };

  if (!chatId) return (
    <div className="flex-1 bg-[#e4ebf0] dark:bg-slate-950 flex items-center justify-center text-slate-500">
      Выберите чат, чтобы начать общение
    </div>
  );

  if (!chat && !isLoading) return (
    <div className="flex-1 bg-[#e4ebf0] dark:bg-slate-950 flex items-center justify-center text-slate-500">
      Чат не найден
    </div>
  );

  const title = chat?.title || (chat?.user && chat.user.name) || "Чат";
  const avatar = chat?.avatarUrl || (chat?.user && chat.user.avatarUrl) || `https://i.pravatar.cc/150?u=${chatId}`;
  const status = chat?.type === 'private' ? (chat?.user?.status || 'недавно') : `${chat?.membersCount || 0} участников`;

  const handleEmojiClick = (emoji: string) => {
    setInputText(prev => prev + emoji);
    setIsEmojiOpen(false);
  };

  return (
    <div className="flex-1 flex h-full relative z-10 bg-[#e4ebf0] dark:bg-slate-950 overflow-hidden">
      
      <div className="flex-1 flex flex-col h-full relative">
        <div 
          className="absolute inset-0 z-0 opacity-[0.4] pointer-events-none dark:opacity-[0.1]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23a1b3c0' fill-opacity='0.2' fill-rule='evenodd'/%3E%3C/svg%3E")`
          }}
        />

        {/* Header */}
        <div className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 z-10 shrink-0 shadow-sm transition-colors">
          {!isSearchOpen ? (
            <>
              <div className="flex items-center cursor-pointer flex-1" onClick={() => setIsInfoOpen(!isInfoOpen)}>
                <img src={avatar} className="w-10 h-10 rounded-full object-cover mr-4" alt={title} />
                <div>
                  <div className="font-semibold text-[16px] dark:text-slate-100">{title}</div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">{status}</div>
                </div>
              </div>
              <div className="flex items-center gap-6 text-slate-500">
                <button onClick={() => setIsSearchOpen(true)} className="hover:text-[#3390ec] transition-colors"><Search className="w-5 h-5" /></button>
                <button onClick={() => setIsCallOpen(true)} className="hover:text-green-500 transition-colors"><Phone className="w-5 h-5" /></button>
                <button onClick={() => setIsInfoOpen(!isInfoOpen)} className="hover:text-[#3390ec] transition-colors"><MoreVertical className="w-5 h-5" /></button>
              </div>
            </>
          ) : (
            <div className="flex items-center w-full animate-in fade-in slide-in-from-right-4 duration-200">
              <Search className="w-5 h-5 text-slate-400 mr-4 shrink-0" />
              <input 
                type="text" 
                placeholder="Поиск сообщений..." 
                className="flex-1 bg-transparent border-none outline-none text-[16px] dark:text-slate-100"
                autoFocus
              />
              <button onClick={() => setIsSearchOpen(false)} className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors shrink-0">
                <X className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 z-10 flex flex-col gap-2 relative custom-scrollbar">
          {isMessagesLoading && messages.length === 0 && (
            <div className="flex-1 flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-[#3390ec] border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
          
          {messages.map((msg) => {
            const isMenuOpen = activeMessageId === msg.id;
            const isMe = msg.sender.id === currentUser?.id || msg.isMe;
            
            return (
              <div key={msg.id} className={clsx("flex max-w-[70%]", isMe ? "ml-auto" : "mr-auto")}>
                {!isMe && chat?.type === 'group' && (
                  <img src={msg.sender.avatarUrl || "https://i.pravatar.cc/150?u=" + msg.sender.id} className="w-9 h-9 rounded-full mr-2 self-end mb-1" alt="user" />
                )}
                
                <div 
                  className={clsx(
                    "rounded-2xl px-3 py-2 text-[15px] shadow-sm relative group",
                    isMe 
                      ? "bg-[#eeffde] dark:bg-[#2b5278] text-black dark:text-white rounded-br-none" 
                      : "bg-white dark:bg-[#182533] text-black dark:text-white rounded-bl-none"
                  )}
                >
                  {!isMe && chat?.type === 'group' && (
                    <div className="text-[#3390ec] text-sm font-semibold mb-1">
                      {msg.sender.name}
                    </div>
                  )}
                  
                  <div className="pr-12 leading-relaxed whitespace-pre-wrap">
                    {msg.text}
                  </div>
                  
                  <div className="absolute right-2 bottom-1.5 flex items-center gap-1 text-xs text-slate-400">
                    {msg.timestamp || new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    {isMe && (
                      <span className="text-[#4caf50]">
                        {msg.isRead ? <CheckCheck className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                      </span>
                    )}
                  </div>

                  <button 
                    onClick={() => setActiveMessageId(isMenuOpen ? null : msg.id)}
                    className={clsx(
                      "absolute top-1 -right-8 p-1 rounded-full bg-black/5 dark:bg-white/10 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-all",
                      isMenuOpen ? "opacity-100" : "opacity-0 group-hover:opacity-100",
                      isMe ? "-left-8 right-auto" : ""
                    )}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>

                  {isMenuOpen && (
                    <div 
                      ref={messageMenuRef}
                      className={clsx(
                        "absolute top-8 w-44 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-100 dark:border-slate-800 py-1 z-50 animate-in fade-in zoom-in-95 duration-150",
                        isMe ? "right-full mr-2" : "left-full ml-2"
                      )}
                    >
                      <button className="w-full flex items-center px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-slate-700 dark:text-slate-200">
                        <Reply className="w-4 h-4 mr-3" /> <span className="text-[14px]">Ответить</span>
                      </button>
                      <button className="w-full flex items-center px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-slate-700 dark:text-slate-200">
                        <Copy className="w-4 h-4 mr-3" /> <span className="text-[14px]">Копировать</span>
                      </button>
                      <div className="h-[1px] bg-slate-100 dark:bg-slate-800 my-1"></div>
                      <button className="w-full flex items-center px-4 py-2 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-red-500">
                        <Trash2 className="w-4 h-4 mr-3" /> <span className="text-[14px]">Удалить</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 z-10 bg-transparent flex justify-center w-full max-w-3xl mx-auto">
          <form 
            className="flex items-end gap-2 w-full relative"
            onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
          >
            <div className="flex-1 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex items-end p-2 px-3 transition-colors relative">
              
              <div className="relative" ref={emojiMenuRef}>
                <button 
                  type="button"
                  onClick={() => setIsEmojiOpen(!isEmojiOpen)}
                  className={clsx("p-2 transition-colors", isEmojiOpen ? "text-[#3390ec]" : "text-slate-400 hover:text-[#3390ec]")}
                >
                  <Smile className="w-6 h-6" />
                </button>
                {isEmojiOpen && (
                  <div className="absolute bottom-full left-0 mb-2 w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-800 p-3 animate-in fade-in slide-in-from-bottom-2 duration-200 grid grid-cols-6 gap-2">
                    {['😀','😂','🥰','😎','🤔','👍','🔥','🎉','❤️','🙌','👀','😢'].map(emoji => (
                      <button 
                        key={emoji} 
                        type="button"
                        onClick={() => handleEmojiClick(emoji)}
                        className="text-xl hover:scale-125 transition-transform flex items-center justify-center h-8"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <textarea 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Сообщение"
                className="flex-1 bg-transparent border-none outline-none py-2 px-2 text-[16px] resize-none max-h-40 min-h-[40px] dark:text-slate-100 placeholder-slate-400"
                rows={1}
              />
              
              <div className="relative" ref={attachMenuRef}>
                <button 
                  type="button"
                  onClick={() => setIsAttachOpen(!isAttachOpen)}
                  className={clsx("p-2 transition-colors", isAttachOpen ? "text-[#3390ec]" : "text-slate-400 hover:text-[#3390ec]")}
                >
                  <Paperclip className="w-6 h-6" />
                </button>

                {isAttachOpen && (
                  <div className="absolute bottom-full right-0 mb-2 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-800 p-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
                    <div 
                      onClick={() => handleSendFile('IMAGE')}
                      className="flex items-center px-3 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl cursor-pointer transition-colors group"
                    >
                      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-500 mr-3 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                        <ImageIcon className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Фото или видео</span>
                    </div>
                    <div 
                      onClick={() => handleSendFile('DOCUMENT')}
                      className="flex items-center px-3 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl cursor-pointer transition-colors group"
                    >
                      <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-500 mr-3 group-hover:bg-green-500 group-hover:text-white transition-colors">
                        <FileText className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Документ</span>
                    </div>
                  </div>
                )}
              </div>

            </div>
            <button 
              type="submit"
              className="w-12 h-12 rounded-full bg-[#3390ec] text-white flex items-center justify-center shadow-md hover:bg-[#2884e0] transition-all active:scale-95 shrink-0"
            >
              {inputText.trim() ? <Send className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </button>
          </form>
        </div>
      </div>

      {/* Chat Info Sidebar */}
      {isInfoOpen && (
        <div className="w-80 h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex flex-col shrink-0 animate-in slide-in-from-right duration-300 z-20">
          <div className="h-16 border-b border-slate-200 dark:border-slate-800 flex items-center px-4 shrink-0">
            <button onClick={() => setIsInfoOpen(false)} className="p-2 mr-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors">
              <X className="w-5 h-5" />
            </button>
            <span className="font-semibold text-lg dark:text-slate-100">Информация</span>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <div className="p-6 flex flex-col items-center border-b border-slate-100 dark:border-slate-800">
              <img src={avatar} className="w-32 h-32 rounded-full object-cover mb-4" alt={title} />
              <h2 className="text-xl font-bold dark:text-slate-100 text-center">{title}</h2>
              <div className="text-slate-500 dark:text-slate-400 mt-1">{status}</div>
            </div>

            <div className="p-2">
              <div className="flex items-center px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer rounded-xl transition-colors">
                <Bell className="w-5 h-5 text-slate-500 mr-4" />
                <span className="flex-1 dark:text-slate-100">Уведомления</span>
                <div className="w-10 h-5 bg-[#3390ec] rounded-full relative">
                  <div className="absolute top-1 left-6 w-3 h-3 bg-white rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
