import { useNavigate } from "react-router";
import { ArrowLeft, Bell, Lock, Palette, Database, HelpCircle, User, Phone, Image as ImageIcon } from "lucide-react";
import { currentUser } from "../mockData";

export function Settings() {
  const navigate = useNavigate();

  return (
    <div className="flex-1 bg-[#f4f4f5] flex flex-col h-full z-10 overflow-y-auto">
      {/* Header */}
      <div className="bg-white h-14 border-b border-slate-200 flex items-center px-4 sticky top-0 z-20">
        <button 
          onClick={() => navigate('/')}
          className="p-2 mr-4 rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <span className="font-semibold text-lg text-slate-800">Настройки</span>
      </div>

      <div className="max-w-3xl mx-auto w-full p-4 flex flex-col gap-4 pb-12">
        {/* Profile Info */}
        <div className="bg-white rounded-xl shadow-sm p-4 flex flex-col items-center sm:flex-row sm:items-start gap-4 cursor-pointer hover:bg-slate-50 transition-colors">
          <div className="relative group cursor-pointer">
            <img 
              src={currentUser.avatar} 
              className="w-24 h-24 rounded-full object-cover" 
              alt="Profile" 
            />
            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <ImageIcon className="text-white w-8 h-8" />
            </div>
          </div>
          
          <div className="flex-1 text-center sm:text-left mt-2 sm:mt-0">
            <h2 className="text-xl font-semibold text-slate-900">{currentUser.name}</h2>
            <div className="text-slate-500 mt-1">{currentUser.phone}</div>
            <div className="text-[#3390ec] font-medium mt-1">{currentUser.username}</div>
            <div className="text-slate-600 mt-2 text-sm">{currentUser.bio}</div>
          </div>
        </div>

        {/* Settings Categories */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden flex flex-col">
          <SettingsItem icon={<User />} text="Изменить профиль" color="bg-blue-500" />
          <SettingsItem icon={<Phone />} text="Звонки и устройства" color="bg-green-500" />
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden flex flex-col">
          <SettingsItem icon={<Bell />} text="Уведомления и звуки" color="bg-red-500" />
          <SettingsItem icon={<Lock />} text="Конфиденциальность" color="bg-slate-500" />
          <SettingsItem icon={<Database />} text="Данные и память" color="bg-green-500" />
          <SettingsItem icon={<Palette />} text="Настройки чатов" color="bg-purple-500" />
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden flex flex-col">
          <SettingsItem icon={<HelpCircle />} text="Помощь Yavimax" color="bg-orange-500" />
          <SettingsItem icon={<HelpCircle />} text="Вопросы и ответы" color="bg-blue-400" />
        </div>
        
        <div className="text-center text-slate-400 text-sm mt-4">
          Yavimax Web 1.0.0
        </div>
      </div>
    </div>
  );
}

function SettingsItem({ icon, text, color }: { icon: React.ReactNode, text: string, color: string }) {
  return (
    <div className="flex items-center px-4 py-3.5 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-0 transition-colors">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white mr-4 ${color}`}>
        {icon}
      </div>
      <span className="flex-1 text-[16px] text-slate-800">{text}</span>
    </div>
  );
}
