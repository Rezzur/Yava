import { useParams } from "react-router-dom";
import { useChatStore } from "@/entities/chat/model/chatStore";
import { useUser } from "@/entities/user/model/useUser";
import { useWebSocket } from "@/shared/api/websocket";
import { Avatar } from "@/shared/ui/Avatar";
import { fileApi } from "@/shared/api/client";
import { Search, Phone, MoreVertical, Paperclip, Smile, Mic, Send, Check, CheckCheck, FileText, Image as ImageIcon, User as UserIcon, ChevronDown, Reply, Copy, Trash2, X, PhoneOff, MicOff, Video, Bell, Image, Link as LinkIcon, File, Square } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { clsx } from "clsx";

export function ChatArea() {
  const { chatId } = useParams();
  const [inputText, setInputText] = useState("");
  const [isAttachOpen, setIsAttachOpen] = useState(false);
  const [activeMessageId, setActiveMessageId] = useState<number | null>(null);
  const [isSending, setIsSending] = useState(false);
  
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const [isCallOpen, setIsCallOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isEmojiOpen, setIsEmojiOpen] = useState(false);
  
  const imageInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const attachMenuRef = useRef<HTMLDivElement>(null);
  const messageMenuRef = useRef<HTMLDivElement>(null);
  const emojiMenuRef = useRef<HTMLDivElement>(null);

  const { user: currentUser } = useUser();
  const { chats, messages, fetchMessages, sendMessage, markAsRead, setActiveChatId, isLoading } = useChatStore();
  const { subscribeToChat } = useWebSocket();

  const chat = chats.find(c => c.id === Number(chatId));
  const API_URL = 'http://localhost:8080';

  useEffect(() => {
    if (chatId) {
      const id = Number(chatId);
      setActiveChatId(id);
      fetchMessages(id);
      markAsRead(id);
    } else {
      setActiveChatId(null);
    }
  }, [chatId]);

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
    if (!inputText.trim() || !chatId || isSending) return;
    setIsSending(true);
    try {
      await sendMessage(Number(chatId), inputText.trim(), 'TEXT');
      setInputText("");
    } finally {
      setIsSending(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, fileType: 'IMAGE' | 'FILE') => {
    const file = e.target.files?.[0];
    if (!file || !chatId) return;

    setIsSending(true);
    try {
      const uploadRes = await fileApi.upload(file, file.name);
      const type = file.type.startsWith('image/') ? 'IMAGE' : 'FILE';
      await sendMessage(Number(chatId), file.name, type, uploadRes.data.url);
    } catch (error) {
      console.error('File upload failed:', error);
      alert('Ошибка при загрузке файла');
    } finally {
      setIsSending(false);
      setIsAttachOpen(false);
      if (imageInputRef.current) imageInputRef.current.value = '';
      if (documentInputRef.current) documentInputRef.current.value = '';
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };
      mediaRecorder.onstop = async () => {
        if (audioChunksRef.current.length === 0) {
          setIsSending(false);
          return;
        }
        setIsSending(true);
        const mimeType = mediaRecorder.mimeType || 'audio/webm';
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        try {
          const uploadRes = await fileApi.upload(audioBlob, 'voice_message.webm'); 
          await sendMessage(Number(chatId), "Голосовое сообщение", 'VOICE', uploadRes.data.url);
        } catch (error) { 
          console.error('Voice upload failed:', error); 
        } finally {
          setIsSending(false);
        }
        stream.getTracks().forEach(track => track.stop());
      };
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => setRecordingTime(prev => prev + 1), 1000);
    } catch (err) { alert('Нет доступа к микрофону'); }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  if (!chatId) return <div className="flex-1 bg-[#e4ebf0] dark:bg-slate-950 flex items-center justify-center text-slate-500 text-lg font-medium">Выберите чат, чтобы начать общение</div>;

  const title = chat?.title || (chat?.user && chat.user.name) || "Чат";
  const avatar = chat?.avatarUrl || (chat?.user && chat.user.avatarUrl);
  const status = chat?.type === 'private' ? (chat?.user?.status || 'недавно') : `${chat?.membersCount || 0} участников`;

  const handleEmojiClick = (emoji: string) => {
    setInputText(prev => prev + emoji);
    setIsEmojiOpen(false);
  };

  return (
    <div className="flex-1 flex h-full relative z-10 bg-[#e4ebf0] dark:bg-slate-950 overflow-hidden">
      <input type="file" ref={imageInputRef} accept="image/*,video/*" className="hidden" onChange={(e) => handleFileChange(e, 'IMAGE')} />
      <input type="file" ref={documentInputRef} accept="*/*" className="hidden" onChange={(e) => handleFileChange(e, 'FILE')} />
      
      <div className="flex-1 flex flex-col h-full relative">
        <div className="absolute inset-0 z-0 opacity-[0.4] pointer-events-none dark:opacity-[0.1]" style={{backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23a1b3c0' fill-opacity='0.2' fill-rule='evenodd'/%3E%3C/svg%3E")`}} />

        <div className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 z-10 shrink-0 shadow-sm">
          <div className="flex items-center cursor-pointer flex-1" onClick={() => setIsInfoOpen(!isInfoOpen)}>
            <Avatar src={avatar} name={title} size="sm" className="mr-4" />
            <div><div className="font-semibold text-[16px] dark:text-slate-100">{title}</div><div className="text-sm text-slate-500 dark:text-slate-400">{status}</div></div>
          </div>
          
          <div className="flex items-center gap-6 text-slate-500">
            {/* Commented out unused features 
            <button onClick={() => setIsSearchOpen(!isSearchOpen)}><Search className="w-5 h-5 hover:text-[#3390ec]" /></button>
            <button onClick={() => setIsCallOpen(true)}><Phone className="w-5 h-5 hover:text-green-500" /></button>
            */}
            <button onClick={() => setIsInfoOpen(!isInfoOpen)}><MoreVertical className="w-5 h-5 hover:text-[#3390ec]" /></button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 z-10 flex flex-col gap-2 relative custom-scrollbar bg-slate-50/10 dark:bg-transparent">
          {messages.map((msg) => {
            const isMe = String(msg.sender.id) === String(currentUser?.id) || msg.isMe;
            return (
              <div key={msg.id} className={clsx("flex w-full mb-1", isMe ? "justify-end" : "justify-start")}>
                <div className={clsx("flex max-w-[75%]", isMe ? "flex-row-reverse" : "flex-row")}>
                  {!isMe && chat?.type === 'group' && <Avatar src={msg.sender.avatarUrl} name={msg.sender.name} size="sm" className="mr-2 self-end mb-1" />}
                  <div className={clsx("rounded-2xl px-3 py-2 text-[15px] shadow-sm relative group min-w-[80px]", isMe ? "bg-[#eeffde] dark:bg-[#2b5278] text-black dark:text-white rounded-br-none ml-2" : "bg-white dark:bg-[#182533] text-black dark:text-white rounded-bl-none mr-2")}>
                    {msg.type?.toUpperCase() === 'IMAGE' && msg.mediaUrl && <img src={API_URL + msg.mediaUrl} className="rounded-lg mb-2 max-w-full max-h-64 cursor-pointer" alt="attachment" onClick={() => window.open(API_URL + msg.mediaUrl, '_blank')} />}
                    {msg.type?.toUpperCase() === 'VOICE' && msg.mediaUrl && <div className="mb-2 py-1"><audio controls className="h-10 max-w-[240px]"><source src={API_URL + msg.mediaUrl} type="audio/webm" /></audio></div>}
                    {msg.type?.toUpperCase() === 'FILE' && msg.mediaUrl && <a href={API_URL + msg.mediaUrl} target="_blank" rel="noreferrer" className="flex items-center gap-3 bg-black/5 dark:bg-white/5 p-3 rounded-xl mb-2 hover:bg-black/10 transition-colors"><div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white"><FileText className="w-5 h-5" /></div><div className="flex-1 overflow-hidden"><div className="text-sm font-medium truncate">{msg.text}</div><div className="text-[10px] opacity-50 uppercase">Файл</div></div></a>}
                    <div className="pr-12 leading-relaxed whitespace-pre-wrap break-words">{msg.type?.toUpperCase() === 'TEXT' ? msg.text : (msg.type?.toUpperCase() !== 'VOICE' && msg.text)}</div>
                    <div className="absolute right-2 bottom-1.5 flex items-center gap-1 text-xs text-slate-400">{msg.timestamp || new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}{isMe && <span className="text-[#4caf50]">{msg.isRead ? <CheckCheck className="w-4 h-4" /> : <Check className="w-4 h-4" />}</span>}</div>
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 z-10 bg-transparent flex justify-center w-full max-w-3xl mx-auto">
          <div className="flex items-end gap-2 w-full relative">
            <div className="flex-1 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex items-end p-2 px-3 transition-colors relative">
              {!isRecording ? (
                <>
                  <button type="button" onClick={() => setIsEmojiOpen(!isEmojiOpen)} className="p-2 text-slate-400 hover:text-[#3390ec] text-button"><Smile className="w-6 h-6" /></button>
                  <textarea value={inputText} onChange={(e) => setInputText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage())} placeholder="Сообщение" className="flex-1 bg-transparent border-none outline-none py-2 px-2 text-[16px] resize-none max-h-40 min-h-[40px] dark:text-slate-100" rows={1} />
                  <div className="relative" ref={attachMenuRef}>
                    <button type="button" onClick={() => setIsAttachOpen(!isAttachOpen)} className="p-2 text-slate-400 hover:text-[#3390ec] text-button"><Paperclip className="w-6 h-6" /></button>
                    {isAttachOpen && (
                      <div className="absolute bottom-full right-0 mb-2 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-800 p-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
                        <div onClick={() => imageInputRef.current?.click()} className="flex items-center px-3 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl cursor-pointer group"><div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 mr-3 group-hover:bg-blue-500 group-hover:text-white"><ImageIcon className="w-4 h-4" /></div><span className="text-sm font-medium">Фото или видео</span></div>
                        <div onClick={() => documentInputRef.current?.click()} className="flex items-center px-3 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl cursor-pointer group"><div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-500 mr-3 group-hover:bg-green-500 group-hover:text-white"><FileText className="w-4 h-4" /></div><span className="text-sm font-medium">Файл</span></div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center px-4 py-2 text-red-500 animate-pulse font-medium"><div className="w-2 h-2 bg-red-500 rounded-full mr-3 animate-ping"></div>Запись... {Math.floor(recordingTime/60)}:{(recordingTime%60).toString().padStart(2,'0')}</div>
              )}
            </div>
            <button 
              type={inputText.trim() ? "submit" : "button"} 
              onClick={isRecording ? stopRecording : (inputText.trim() ? undefined : startRecording)} 
              disabled={isSending} 
              className={clsx("w-12 h-12 rounded-full text-white flex items-center justify-center shadow-md transition-all shrink-0", isRecording ? "bg-red-500" : "bg-[#3390ec]")}
            >
              {isSending ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : (isRecording ? <Square className="w-5 h-5 fill-current" /> : (inputText.trim() ? <Send className="w-6 h-6" /> : <Mic className="w-6 h-6" />))}
            </button>
          </div>
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
              <Avatar src={avatar} name={title} size="xl" className="mb-4" />
              <h2 className="text-xl font-bold dark:text-slate-100 text-center">{title}</h2>
              <div className="text-slate-500 dark:text-slate-400 mt-1">{status}</div>
            </div>

            {/* Commented out non-functional sections 
            <div className="p-2">
              <div className="flex items-center px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer rounded-xl transition-colors">
                <Bell className="w-5 h-5 text-slate-500 mr-4" />
                <span className="flex-1 dark:text-slate-100">Уведомления</span>
                <div className="w-10 h-5 bg-[#3390ec] rounded-full relative">
                  <div className="absolute top-1 left-6 w-3 h-3 bg-white rounded-full" />
                </div>
              </div>
            </div>
            */}
          </div>
        </div>
      )}

      {/* Call Modal Overlay - Commented out
      {isCallOpen && (
        ...
      )}
      */}
    </div>
  );
}
