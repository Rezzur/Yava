import { useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, Clock, Phone, Users, ShieldAlert } from "lucide-react";
import { useState } from "react";
import { clsx } from "clsx";

export function PrivacySettings() {
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
        <span className="font-semibold text-lg text-slate-800 dark:text-slate-100">Конфиденциальность</span>
      </div>

      <div className="max-w-xl mx-auto w-full p-4 flex flex-col gap-6 pb-12">
        
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm overflow-hidden flex flex-col transition-colors">
          <div className="px-5 py-3 text-xs font-bold text-[#3390ec] uppercase tracking-wider flex items-center">
            <ShieldAlert className="w-4 h-4 mr-2" /> Безопасность
          </div>
          <div className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer border-b border-slate-100 dark:border-slate-800 transition-all group">
            <span className="text-[16px] font-medium text-slate-800 dark:text-slate-100">Облачный пароль</span>
            <span className="text-sm text-slate-400">Выкл</span>
          </div>
          <div className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-all group">
            <span className="text-[16px] font-medium text-slate-800 dark:text-slate-100">Активные сеансы</span>
            <span className="text-sm text-[#3390ec] font-medium">1</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm overflow-hidden flex flex-col transition-colors">
          <div className="px-5 py-3 text-xs font-bold text-[#3390ec] uppercase tracking-wider flex items-center">
            <Eye className="w-4 h-4 mr-2" /> Кто может видеть
          </div>
          <PrivacyItem icon={<Phone className="w-5 h-5" />} text="Номер телефона" value="Мои контакты" />
          <PrivacyItem icon={<Clock className="w-5 h-5" />} text="Последняя активность" value="Все" />
          <PrivacyItem icon={<Users className="w-5 h-5" />} text="Группы и каналы" value="Все" />
        </div>

      </div>
    </div>
  );
}

function PrivacyItem({ icon, text, value }: { icon: React.ReactNode, text: string, value: string }) {
  return (
    <div className="flex items-center px-5 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer border-b border-slate-100 dark:border-slate-800 last:border-0 transition-all group">
      <div className="text-slate-500 dark:text-slate-400 mr-4 group-hover:text-[#3390ec] transition-colors">
        {icon}
      </div>
      <span className="flex-1 text-[16px] font-medium text-slate-800 dark:text-slate-100">{text}</span>
      <span className="text-sm text-slate-500 dark:text-slate-400">{value}</span>
    </div>
  );
}
