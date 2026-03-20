import { useState } from "react";
import { Menu, Search, Bookmark, Users, Phone, Settings, CircleHelp, Moon, Sun, Lock, Info, X } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router";
import { CHATS, currentUser } from "../mockData";
import { clsx } from "clsx";

export function Sidebar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { chatId } = useParams();
  const navigate = useNavigate();

  const filteredChats = CHATS.filter(c => {
    const title = c.title || (c.user && c.user.name) || "";
    return title.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="w-[400px] flex-shrink-0 border-r border-slate-200 bg-white flex flex-col relative z-20 transition-all">
      {/* Header */}
      <div className="flex items-center px-4 py-3 gap-4">
        <button 
          onClick={() => setIsMenuOpen(true)}
          className="p-2 -ml-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>
        <div className="flex-1 relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            <Search className="w-5 h-5" />
          </div>
          <input 
            type="text" 
            placeholder="Поиск"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#f4f4f5] rounded-full py-2 pl-10 pr-4 text-[15px] outline-none focus:ring-2 focus:ring-[#3390ec] focus:bg-white transition-all transition-colors placeholder-slate-500"
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
        {filteredChats.map((chat) => {
          const title = chat.title || (chat.user && chat.user.name);
          const avatar = chat.avatar || (chat.user && chat.user.avatar);
          const isActive = chat.id === chatId;

          return (
            <Link 
              key={chat.id} 
              to={`/chat/${chat.id}`}
              className={clsx(
                "flex items-center px-3 py-2.5 mx-2 rounded-xl mb-1 cursor-pointer transition-colors",
                isActive ? "bg-[#3390ec] text-white" : "hover:bg-[#f4f4f5] text-slate-900"
              )}
            >
              <div className="relative">
                <img 
                  src={avatar} 
                  alt={title} 
                  className="w-14 h-14 rounded-full object-cover shrink-0"
                />
                {chat.user && chat.user.status === 'в сети' && (
                  <div className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
                )}
              </div>
              <div className="ml-3 flex-1 overflow-hidden">
                <div className="flex justify-between items-baseline mb-1">
                  <span className="font-semibold truncate text-[16px] leading-5">{title}</span>
                  <span className={clsx("text-xs ml-2 whitespace-nowrap", isActive ? "text-blue-100" : "text-slate-500")}>
                    {chat.timestamp}
                  </span>
                </div>
                <div className="flex justify-between items-start">
                  <span className={clsx("text-[15px] truncate max-w-[200px]", isActive ? "text-blue-100" : "text-slate-500")}>
                    {chat.lastMessage}
                  </span>
                  {chat.unreadCount > 0 && (
                    <div className={clsx(
                      "min-w-6 h-6 rounded-full flex items-center justify-center text-[12px] font-bold px-1.5 ml-2 mt-0.5",
                      isActive ? "bg-white text-[#3390ec]" : "bg-[#c5cdd3] text-white",
                      chat.unreadCount > 0 && !isActive ? "bg-[#3390ec]" : ""
                    )}>
                      {chat.unreadCount}
                    </div>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Slide Out Main Menu Drawer */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/20"
          onClick={() => setIsMenuOpen(false)}
        >
          <div 
            className="w-[300px] h-full bg-white shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* User Profile Header */}
            <div className="bg-[#3390ec] text-white p-4 pt-6">
              <div className="flex justify-between items-start mb-4">
                <img 
                  src={currentUser.avatar} 
                  className="w-16 h-16 rounded-full border-2 border-white/20" 
                  alt="Avatar" 
                />
                <button onClick={() => setIsMenuOpen(false)}>
                  <X className="w-6 h-6 text-white/70 hover:text-white" />
                </button>
              </div>
              <div className="font-semibold text-lg">{currentUser.name}</div>
              <div className="text-blue-100 text-sm">{currentUser.phone}</div>
            </div>

            {/* Menu Items */}
            <div className="py-2 flex-1 overflow-y-auto">
              <MenuItem icon={<Users />} text="Создать группу" />
              <MenuItem icon={<Users className="opacity-70" />} text="Создать канал" />
              <MenuItem icon={<Phone />} text="Звонки" />
              <MenuItem icon={<Bookmark />} text="Избранное" />
              <MenuItem 
                icon={<Settings />} 
                text="Настройки" 
                onClick={() => {
                  setIsMenuOpen(false);
                  navigate('/settings');
                }} 
              />
              <div className="h-px bg-slate-200 my-2 mx-4" />
              <MenuItem icon={<Moon />} text="Ночной режим" action={<Switch />} />
              <MenuItem icon={<Info />} text="О Yavimax" />
            </div>
            
            <div className="p-4 text-center text-xs text-slate-400 border-t border-slate-100">
              Yavimax Desktop 1.0.0
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MenuItem({ icon, text, onClick, action }: { icon: React.ReactNode, text: string, onClick?: () => void, action?: React.ReactNode }) {
  return (
    <div 
      className="flex items-center px-6 py-3 hover:bg-[#f4f4f5] cursor-pointer text-slate-700 transition-colors"
      onClick={onClick}
    >
      <div className="w-6 h-6 mr-6 text-slate-500">
        {icon}
      </div>
      <span className="flex-1 font-medium">{text}</span>
      {action && <div>{action}</div>}
    </div>
  );
}

function Switch() {
  return (
    <div className="w-10 h-6 bg-slate-300 rounded-full relative">
      <div className="w-5 h-5 bg-white rounded-full absolute left-0.5 top-0.5 shadow-sm"></div>
    </div>
  );
}
