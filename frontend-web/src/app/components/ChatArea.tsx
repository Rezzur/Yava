import { useParams } from "react-router";
import { CHATS, MESSAGES, currentUser } from "../mockData";
import { Search, Phone, MoreVertical, Paperclip, Smile, Mic, Send, Check, CheckCheck } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { clsx } from "clsx";

export function ChatArea() {
  const { chatId } = useParams();
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const chat = CHATS.find(c => c.id === chatId);
  const messages = MESSAGES[chatId || ""] || [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatId, messages]);

  if (!chat) return <div className="flex-1 bg-[#e4ebf0] flex items-center justify-center">Чат не найден</div>;

  const title = chat.title || (chat.user && chat.user.name);
  const avatar = chat.avatar || (chat.user && chat.user.avatar);
  const status = chat.type === 'private' ? chat.user?.status : `${chat.membersCount?.toLocaleString('ru-RU')} участников`;

  return (
    <div className="flex-1 flex flex-col h-full relative z-10 bg-[#e4ebf0]">
      {/* Dynamic Background Pattern - simulating Telegram's doodle background */}
      <div 
        className="absolute inset-0 z-0 opacity-[0.4] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23a1b3c0' fill-opacity='0.2' fill-rule='evenodd'/%3E%3C/svg%3E")`
        }}
      />

      {/* Header */}
      <div className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 z-10 shrink-0 shadow-sm cursor-pointer">
        <div className="flex items-center">
          <img src={avatar} className="w-10 h-10 rounded-full object-cover mr-4" alt={title} />
          <div>
            <div className="font-semibold text-[16px]">{title}</div>
            <div className="text-sm text-slate-500">{status}</div>
          </div>
        </div>
        <div className="flex items-center gap-6 text-slate-500">
          <button className="hover:text-slate-800 transition-colors"><Search className="w-5 h-5" /></button>
          <button className="hover:text-slate-800 transition-colors"><Phone className="w-5 h-5" /></button>
          <button className="hover:text-slate-800 transition-colors"><MoreVertical className="w-5 h-5" /></button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 z-10 flex flex-col gap-2 relative">
        <div className="text-center my-4">
          <span className="bg-black/10 text-white px-3 py-1 rounded-full text-xs font-medium shadow-sm backdrop-blur-md">
            Сегодня
          </span>
        </div>
        {messages.map((msg) => (
          <div key={msg.id} className={clsx("flex max-w-[70%]", msg.isMe ? "ml-auto" : "mr-auto")}>
            {/* Left avatar for group messages */}
            {!msg.isMe && chat.type === 'group' && (
              <img src="https://i.pravatar.cc/150?u=any" className="w-9 h-9 rounded-full mr-2 self-end mb-1" alt="user" />
            )}
            
            <div className={clsx(
              "rounded-2xl px-3 py-2 text-[15px] shadow-sm relative group",
              msg.isMe 
                ? "bg-[#eeffde] text-black rounded-br-none" 
                : "bg-white text-black rounded-bl-none"
            )}>
              {!msg.isMe && chat.type === 'group' && (
                <div className="text-[#3390ec] text-sm font-semibold mb-1">
                  Илья
                </div>
              )}
              
              <div className="pr-12 leading-relaxed whitespace-pre-wrap">
                {msg.text}
              </div>
              
              <div className="absolute right-2 bottom-1.5 flex items-center gap-1 text-xs text-slate-400">
                {msg.timestamp}
                {msg.isMe && (
                  <span className="text-[#4caf50]">
                    {msg.isRead ? <CheckCheck className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 z-10 bg-transparent flex justify-center w-full max-w-3xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm flex items-end w-full p-2 gap-2 max-h-32">
          <button className="p-2 text-slate-400 hover:text-slate-600 shrink-0">
            <Paperclip className="w-6 h-6" />
          </button>
          
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Написать сообщение..."
            className="flex-1 max-h-24 py-2 px-2 resize-none outline-none text-[15px] custom-scrollbar bg-transparent"
            rows={1}
            style={{ minHeight: "40px" }}
          />
          
          <div className="flex items-center gap-1 pb-1 shrink-0">
            <button className="p-2 text-slate-400 hover:text-slate-600">
              <Smile className="w-6 h-6" />
            </button>
            {inputText.length > 0 ? (
              <button className="p-2 text-white bg-[#3390ec] rounded-full hover:bg-blue-600 transition-colors ml-1">
                <Send className="w-5 h-5 ml-0.5" />
              </button>
            ) : (
              <button className="p-2 text-slate-400 hover:text-slate-600">
                <Mic className="w-6 h-6" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
