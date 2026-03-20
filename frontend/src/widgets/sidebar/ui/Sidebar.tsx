import { useState } from "react";
import { Menu, Search, Users, Radio, Phone, Bookmark, Settings, Moon, Sun, Info, X, Camera, ArrowRight, Check, MessageCircle } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { CHATS } from "@/shared/api/mockData";
import { useTheme } from "@/shared/lib/theme/useTheme";
import { useUser } from "@/entities/user/model/useUser";
import { clsx } from "clsx";

export function Sidebar() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [groupName, setGroupName] = useState("");
  
  // Use global stores
  const { theme, toggleTheme } = useTheme();
  const { user } = useUser();
  const isDarkMode = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  const { chatId } = useParams();
  const navigate = useNavigate();

  const filteredChats = CHATS.filter(c => {
    const title = c.title || (c.user && c.user.name) || "";
    return title.toLowerCase().includes(search.toLowerCase());
  });

  const handleCreateGroupOpen = () => {
    setIsDrawerOpen(false);
    setIsCreateGroupOpen(true);
  };

  const handleAboutOpen = () => {
    setIsDrawerOpen(false);
    setIsAboutOpen(true);
  };

  const handleFavoritesClick = () => {
    setIsDrawerOpen(false);
    navigate('/chat/saved'); // Assume ID 'saved' is handled or will be handled
  };

  return (
    <div className="w-[400px] h-full flex-shrink-0 border-r border-slate-200 bg-white flex flex-col relative z-20 transition-all dark:bg-slate-900 dark:border-slate-800">
      {/* Header */}
      <div className="flex items-center px-4 py-3 gap-4">
        <button 
          onClick={() => setIsDrawerOpen(true)}
          className="p-2 -ml-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors dark:hover:bg-slate-800"
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
            className="w-full bg-[#f4f4f5] dark:bg-slate-800 rounded-full py-2 pl-10 pr-4 text-[15px] outline-none focus:ring-2 focus:ring-[#3390ec] focus:bg-white dark:focus:bg-slate-700 transition-all transition-colors placeholder-slate-500 dark:text-slate-200"
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
        {filteredChats.map((chat) => {
          const title = chat.title || (chat.user && chat.user.name);
          const avatar = chat.avatarUrl || (chat.user && chat.user.avatarUrl);
          const isActive = chat.id === Number(chatId);

          return (
            <Link 
              key={chat.id} 
              to={`/chat/${chat.id}`}
              className={clsx(
                "flex items-center px-3 py-2.5 mx-2 rounded-xl mb-1 cursor-pointer transition-colors",
                isActive ? "bg-[#3390ec] text-white" : "hover:bg-[#f4f4f5] dark:hover:bg-slate-800 text-slate-900 dark:text-slate-100"
              )}
            >
              <div className="relative shrink-0 w-14 h-14">
                <img 
                  src={avatar} 
                  alt={title} 
                  className="w-14 h-14 rounded-full object-cover"
                />
                {chat.user && chat.user.status === 'в сети' && (
                  <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white dark:border-slate-900 rounded-full z-10"></div>
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
                      "h-6 min-w-[24px] rounded-full flex items-center justify-center text-[12px] font-bold px-2 ml-2 shrink-0",
                      isActive ? "bg-white text-[#3390ec]" : "bg-[#c5cdd3] dark:bg-slate-700 text-white dark:text-slate-200"
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
      {isDrawerOpen && (
        <>
          <div 
            className="fixed inset-0 z-50 bg-black/20 backdrop-blur-[1px]"
            onClick={() => setIsDrawerOpen(false)}
          />
          <div className="fixed top-0 left-0 bottom-0 w-[300px] z-[60] bg-white dark:bg-slate-900 shadow-2xl flex flex-col animate-in slide-in-from-left duration-300">
            {/* Drawer Header */}
            <div className="bg-[#3390ec] p-4 pt-6 text-white relative">
              <button 
                onClick={() => setIsDrawerOpen(false)}
                className="absolute top-4 right-4 p-1 hover:bg-black/10 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              
              {user && (
                <>
                  <img 
                    src={user.avatarUrl} 
                    className="w-16 h-16 rounded-full border-2 border-white/20 mb-4 object-cover"
                    alt="Me"
                  />
                  <div className="font-semibold text-[16px]">{user.name}</div>
                  <div className="text-blue-100 text-sm">{user.phone}</div>
                </>
              )}
            </div>

            {/* Drawer Menu Items */}
            <div className="flex-1 py-2 overflow-y-auto">
              <DrawerItem icon={<Users />} text="Создать группу" onClick={handleCreateGroupOpen} />
              <DrawerItem icon={<Radio />} text="Создать канал" />
              <DrawerItem icon={<Phone />} text="Звонки" />
              <DrawerItem icon={<Bookmark />} text="Избранное" onClick={handleFavoritesClick} />
              <DrawerItem 
                icon={<Settings />} 
                text="Настройки" 
                onClick={() => {
                  setIsDrawerOpen(false);
                  navigate('/settings');
                }}
              />
              
              <div className="h-[1px] bg-slate-100 dark:bg-slate-800 my-2" />
              
              <div 
                className="flex items-center px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                onClick={toggleTheme}
              >
                <div className="text-slate-500 mr-6">
                  {isDarkMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
                </div>
                <span className="flex-1 font-medium text-[15px] dark:text-slate-100">Ночной режим</span>
                <div className={clsx(
                  "w-10 h-5 rounded-full relative transition-colors duration-200",
                  isDarkMode ? "bg-[#3390ec]" : "bg-slate-300"
                )}>
                  <div className={clsx(
                    "absolute top-1 w-3 h-3 bg-white rounded-full transition-all duration-200",
                    isDarkMode ? "left-6" : "left-1"
                  )} />
                </div>
              </div>
              
              <DrawerItem icon={<Info />} text="О Yavimax" onClick={handleAboutOpen} />
            </div>

            <div className="p-4 text-center text-[12px] text-slate-400 font-medium">
              Yavimax Desktop 1.0.0
            </div>
          </div>
        </>
      )}

      {/* About Modal */}
      {isAboutOpen && (
        <div className="fixed inset-0 z-[70] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 relative">
            <button 
              onClick={() => setIsAboutOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="p-8 flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-[#3390ec] to-[#0057b7] rounded-3xl shadow-lg flex items-center justify-center text-white mb-6">
                <MessageCircle className="w-12 h-12" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Yavimax Web</h2>
              <div className="text-sm text-slate-500 font-medium mb-6">Версия 1.0.0 (Production Build)</div>
              <p className="text-[15px] text-slate-600 dark:text-slate-300 leading-relaxed mb-8">
                Быстрый, защищенный и полностью бесплатный мессенджер для общения с друзьями и коллегами.
              </p>
              <button 
                onClick={() => window.open('https://github.com', '_blank')}
                className="w-full py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white rounded-xl font-medium transition-colors"
              >
                Проект на GitHub
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Group Modal Overlay */}
      {isCreateGroupOpen && (
        <div className="fixed inset-0 z-[70] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Создать группу</h3>
              <button 
                onClick={() => setIsCreateGroupOpen(false)}
                className="p-2 -mr-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Modal Content */}
            <div className="p-6 flex flex-col gap-6">
              {/* Group Name & Avatar */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-[#3390ec] text-white flex items-center justify-center shrink-0 cursor-pointer hover:bg-[#2884e0] transition-colors relative group overflow-hidden">
                  <Camera className="w-6 h-6 z-10" />
                </div>
                <div className="flex-1 border-b-2 border-slate-200 dark:border-slate-700 focus-within:border-[#3390ec] dark:focus-within:border-[#3390ec] transition-colors pb-1">
                  <input 
                    type="text" 
                    placeholder="Название группы" 
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    className="w-full bg-transparent border-none outline-none text-[16px] text-slate-900 dark:text-slate-100 placeholder-slate-400"
                    autoFocus
                  />
                </div>
              </div>

              {/* Members Selection */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-[#3390ec]">Кого добавить?</label>
                <div className="max-h-48 overflow-y-auto custom-scrollbar border border-slate-100 dark:border-slate-800 rounded-xl p-2">
                  {CHATS.filter(c => c.type === 'private').map((chat, idx) => (
                    <div key={chat.id} className="flex items-center p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg cursor-pointer transition-colors group">
                      <div className="relative mr-3">
                        <img src={chat.avatarUrl || (chat.user && chat.user.avatarUrl)} className="w-10 h-10 rounded-full object-cover" alt="User" />
                        {idx === 0 && (
                          <div className="absolute -bottom-1 -right-1 bg-[#3390ec] rounded-full p-0.5 border border-white dark:border-slate-900">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 text-[15px] font-medium text-slate-800 dark:text-slate-200">
                        {chat.title || (chat.user && chat.user.name)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 flex justify-end gap-3">
              <button 
                onClick={() => setIsCreateGroupOpen(false)}
                className="px-5 py-2.5 rounded-xl text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                Отмена
              </button>
              <button 
                className={clsx(
                  "px-5 py-2.5 rounded-xl text-white font-medium flex items-center transition-all",
                  groupName.trim() ? "bg-[#3390ec] hover:bg-[#2884e0] shadow-md shadow-blue-500/20" : "bg-slate-300 dark:bg-slate-700 cursor-not-allowed"
                )}
                disabled={!groupName.trim()}
              >
                Далее <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DrawerItem({ icon, text, onClick }: { icon: React.ReactNode, text: string, onClick?: () => void }) {
  return (
    <div 
      className="flex items-center px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors group"
      onClick={onClick}
    >
      <div className="text-slate-500 dark:text-slate-400 mr-6 group-hover:text-[#3390ec] transition-colors">
        {icon}
      </div>
      <span className="font-medium text-[15px] text-slate-700 dark:text-slate-100">{text}</span>
    </div>
  );
}
