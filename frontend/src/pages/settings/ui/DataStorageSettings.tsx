import { useNavigate } from "react-router-dom";
import { ArrowLeft, Database, HardDrive, Wifi, Smartphone, Image as ImageIcon, Trash2 } from "lucide-react";
import { useState } from "react";
import { clsx } from "clsx";

export function DataStorageSettings() {
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
        <span className="font-semibold text-lg text-slate-800 dark:text-slate-100">Данные и память</span>
      </div>

      <div className="max-w-xl mx-auto w-full p-4 flex flex-col gap-6 pb-12">
        
        {/* Usage Stats */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm p-6 flex flex-col items-center justify-center transition-colors">
          <HardDrive className="w-12 h-12 text-[#3390ec] mb-3" />
          <div className="text-3xl font-bold text-slate-900 dark:text-white">2.4 ГБ</div>
          <div className="text-sm text-slate-500 dark:text-slate-400 mb-6">Занято кэшем Yavimax</div>
          
          <button className="w-full py-3 bg-[#3390ec] hover:bg-[#2884e0] text-white rounded-xl font-medium flex items-center justify-center transition-colors">
            <Trash2 className="w-5 h-5 mr-2" /> Очистить кэш
          </button>
        </div>

        {/* Auto Download */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm overflow-hidden flex flex-col transition-colors">
          <div className="px-5 py-3 text-xs font-bold text-[#3390ec] uppercase tracking-wider flex items-center">
            <Database className="w-4 h-4 mr-2" /> Автозагрузка медиа
          </div>
          <ToggleItem icon={<Smartphone className="w-5 h-5" />} text="Через мобильную сеть" defaultChecked={false} />
          <ToggleItem icon={<Wifi className="w-5 h-5" />} text="Через Wi-Fi" defaultChecked={true} />
        </div>

      </div>
    </div>
  );
}

function ToggleItem({ icon, text, defaultChecked }: { icon: React.ReactNode, text: string, defaultChecked: boolean }) {
  const [checked, setChecked] = useState(defaultChecked);
  
  return (
    <div 
      className="flex items-center px-5 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer border-b border-slate-100 dark:border-slate-800 last:border-0 transition-all group"
      onClick={() => setChecked(!checked)}
    >
      <div className="text-slate-500 dark:text-slate-400 mr-4 group-hover:text-[#3390ec] transition-colors">
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
