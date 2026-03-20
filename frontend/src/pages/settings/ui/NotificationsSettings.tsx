import { useNavigate } from "react-router-dom";
import { ArrowLeft, Bell, BellOff, Volume2, MessageSquare, Users, Radio } from "lucide-react";
import { useState } from "react";
import { clsx } from "clsx";

export function NotificationsSettings() {
  const navigate = useNavigate();

  return (
    <div className="flex-1 bg-[#f4f4f5] dark:bg-slate-950 flex flex-col h-full z-10 overflow-y-auto custom-scrollbar transition-colors">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 h-14 border-b border-slate-200 dark:border-slate-800 flex items-center px-4 sticky top-0 z-20 shadow-sm transition-colors">
        <button 
          onClick={() => navigate('/settings')}
          className="p-2 mr-4 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <span className="font-semibold text-lg text-slate-800 dark:text-slate-100">Уведомления и звуки</span>
      </div>

      <div className="max-w-xl mx-auto w-full p-4 flex flex-col gap-6 pb-12">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm overflow-hidden flex flex-col transition-colors">
          <div className="px-5 py-3 text-xs font-bold text-[#3390ec] uppercase tracking-wider">Уведомления о сообщениях</div>
          
          <ToggleItem 
            icon={<MessageSquare className="w-5 h-5" />} 
            text="Личные чаты" 
            color="bg-blue-500" 
            defaultChecked={true}
          />
          <ToggleItem 
            icon={<Users className="w-5 h-5" />} 
            text="Группы" 
            color="bg-green-500" 
            defaultChecked={true}
          />
          <ToggleItem 
            icon={<Radio className="w-5 h-5" />} 
            text="Каналы" 
            color="bg-red-500" 
            defaultChecked={false}
          />
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm overflow-hidden flex flex-col transition-colors">
          <div className="px-5 py-3 text-xs font-bold text-[#3390ec] uppercase tracking-wider">Звуки</div>
          <ToggleItem 
            icon={<Volume2 className="w-5 h-5" />} 
            text="Звук в приложении" 
            color="bg-orange-500" 
            defaultChecked={true}
          />
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm overflow-hidden flex flex-col transition-colors">
          <div className="px-5 py-3 text-xs font-bold text-[#3390ec] uppercase tracking-wider">Сброс</div>
          <button className="flex items-center px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-800 text-red-500 font-medium transition-colors">
            <BellOff className="w-5 h-5 mr-4" />
            Сбросить все уведомления
          </button>
        </div>
      </div>
    </div>
  );
}

function ToggleItem({ icon, text, color, defaultChecked }: { icon: React.ReactNode, text: string, color: string, defaultChecked: boolean }) {
  const [checked, setChecked] = useState(defaultChecked);
  
  return (
    <div 
      className="flex items-center px-5 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer border-b border-slate-100 dark:border-slate-800 last:border-0 transition-all group"
      onClick={() => setChecked(!checked)}
    >
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white mr-4 shadow-sm ${color} transition-transform group-active:scale-95`}>
        {icon}
      </div>
      <span className="flex-1 text-[16px] font-medium text-slate-800 dark:text-slate-100">{text}</span>
      <div className={clsx(
        "w-10 h-5 rounded-full relative transition-colors duration-200",
        checked ? "bg-[#3390ec]" : "bg-slate-300 dark:bg-slate-700"
      )}>
        <div className={clsx(
          "absolute top-1 w-3 h-3 bg-white rounded-full transition-all duration-200",
          checked ? "left-6" : "left-1"
        )} />
      </div>
    </div>
  );
}
