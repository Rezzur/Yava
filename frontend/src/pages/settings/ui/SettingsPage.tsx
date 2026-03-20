import { useNavigate } from "react-router-dom";
import { ArrowLeft, Bell, Lock, Palette, Database, HelpCircle, User, Phone, Info } from "lucide-react";
import { useUser } from "@/entities/user/model/useUser";
import { ReactNode } from "react";

export function SettingsPage() {
  const navigate = useNavigate();
  const { user } = useUser();

  if (!user) return null;

  return (
    <div className="flex-1 bg-[#f4f4f5] dark:bg-slate-950 flex flex-col h-full z-10 overflow-y-auto custom-scrollbar transition-colors">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 h-14 border-b border-slate-200 dark:border-slate-800 flex items-center px-4 sticky top-0 z-20 shadow-sm transition-colors">
        <button 
          onClick={() => navigate('/chat')}
          className="p-2 mr-4 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <span className="font-semibold text-lg text-slate-800 dark:text-slate-100">Настройки</span>
      </div>

      <div className="max-w-3xl mx-auto w-full p-4 flex flex-col gap-4 pb-12">
        {/* Profile Info Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm p-5 flex items-center gap-5 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
          <div className="relative group overflow-hidden rounded-full shrink-0">
            <img 
              src={user.avatarUrl} 
              className="w-24 h-24 rounded-full object-cover border-2 border-blue-500/20" 
              alt="Profile" 
            />
          </div>
          
          <div className="flex-1">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{user.name}</h2>
            <div className="text-slate-500 dark:text-slate-400 mt-0.5 text-[15px]">{user.phone}</div>
            <div className="text-[#3390ec] font-semibold mt-0.5">@{user.username}</div>
            <div className="text-slate-600 dark:text-slate-400 mt-2 text-sm leading-snug">{user.bio}</div>
          </div>
        </div>

        {/* Categories Section 1 */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm overflow-hidden flex flex-col transition-colors">
          <SettingsItem 
            icon={<User className="w-5 h-5" />} 
            text="Изменить профиль" 
            color="bg-blue-500"
            onClick={() => navigate('/settings/profile')}
          />
          <SettingsItem 
            icon={<Phone className="w-5 h-5" />} 
            text="Звонки и устройства" 
            color="bg-green-500" 
          />
        </div>

        {/* Categories Section 2 */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm overflow-hidden flex flex-col transition-colors">
          <SettingsItem 
            icon={<Bell className="w-5 h-5" />} 
            text="Уведомления и звуки" 
            color="bg-red-500"
            onClick={() => navigate('/settings/notifications')}
          />
          <SettingsItem 
            icon={<Lock className="w-5 h-5" />} 
            text="Конфиденциальность" 
            color="bg-slate-500"
            onClick={() => navigate('/settings/privacy')}
          />
          <SettingsItem 
            icon={<Database className="w-5 h-5" />} 
            text="Данные и память" 
            color="bg-green-500"
            onClick={() => navigate('/settings/data')}
          />
          <SettingsItem 
            icon={<Palette className="w-5 h-5" />} 
            text="Настройки чатов" 
            color="bg-purple-500"
            onClick={() => navigate('/settings/appearance')}
          />
        </div>

        {/* Categories Section 3 */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm overflow-hidden flex flex-col transition-colors">
          <SettingsItem 
            icon={<HelpCircle className="w-5 h-5" />} 
            text="Помощь Yavimax" 
            color="bg-orange-500" 
          />
          <SettingsItem 
            icon={<Info className="w-5 h-5" />} 
            text="Вопросы и ответы" 
            color="bg-blue-400" 
          />
        </div>
        
        <div className="text-center text-slate-400 dark:text-slate-600 text-[13px] mt-6 font-medium">
          Yavimax Web 1.0.0
        </div>
      </div>
    </div>
  );
}

interface SettingsItemProps {
  icon: ReactNode;
  text: string;
  color: string;
  onClick?: () => void;
}

function SettingsItem({ icon, text, color, onClick }: SettingsItemProps) {
  return (
    <div 
      className="flex items-center px-5 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer border-b border-slate-100 dark:border-slate-800 last:border-0 transition-all group"
      onClick={onClick}
    >
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white mr-4 shadow-sm ${color} group-hover:scale-105 transition-transform`}>
        {icon}
      </div>
      <span className="flex-1 text-[16px] font-medium text-slate-800 dark:text-slate-100">{text}</span>
    </div>
  );
}
