import { useNavigate } from "react-router-dom";
import { ArrowLeft, Palette, Type, Image as ImageIcon, Check } from "lucide-react";
import { useTheme } from "@/shared/lib/theme/useTheme";
import { clsx } from "clsx";
import { useState } from "react";

export function AppearanceSettings() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [fontSize, setFontSize] = useState(16);

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
        <span className="font-semibold text-lg text-slate-800 dark:text-slate-100">Настройки чатов</span>
      </div>

      <div className="max-w-xl mx-auto w-full p-4 flex flex-col gap-6 pb-12">
        {/* Theme Selection */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm p-5 transition-colors">
          <div className="text-xs font-bold text-[#3390ec] uppercase tracking-wider mb-4 px-1">Тема оформления</div>
          <div className="grid grid-cols-3 gap-4">
            <ThemeOption 
              label="Светлая" 
              active={theme === 'light'} 
              onClick={() => setTheme('light')}
              colors="bg-white border-slate-200"
            />
            <ThemeOption 
              label="Темная" 
              active={theme === 'dark'} 
              onClick={() => setTheme('dark')}
              colors="bg-slate-900 border-slate-800"
            />
            <ThemeOption 
              label="Системная" 
              active={theme === 'system'} 
              onClick={() => setTheme('system')}
              colors="bg-gradient-to-br from-white to-slate-900 border-slate-200"
            />
          </div>
        </div>

        {/* Font Size */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm p-5 transition-colors">
          <div className="flex items-center mb-4 text-[#3390ec]">
            <Type className="w-5 h-5 mr-3" />
            <div className="text-xs font-bold uppercase tracking-wider">Размер шрифта: {fontSize}px</div>
          </div>
          <input 
            type="range" 
            min="12" 
            max="24" 
            value={fontSize}
            onChange={(e) => setFontSize(parseInt(e.target.value))}
            className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#3390ec]"
          />
          <div className="flex justify-between mt-2 text-[10px] text-slate-400 font-bold uppercase">
            <span>А</span>
            <span>А</span>
          </div>
        </div>

        {/* Chat Background */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm overflow-hidden transition-colors">
          <div className="flex items-center px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer group transition-colors">
            <div className="w-9 h-9 rounded-xl bg-purple-500 flex items-center justify-center text-white mr-4 shadow-sm group-hover:scale-105 transition-transform">
              <ImageIcon className="w-5 h-5" />
            </div>
            <span className="flex-1 font-medium text-slate-800 dark:text-slate-100">Изменить фон чата</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ThemeOption({ label, active, onClick, colors }: { label: string, active: boolean, onClick: () => void, colors: string }) {
  return (
    <div className="flex flex-col items-center gap-2 cursor-pointer group" onClick={onClick}>
      <div className={clsx(
        "w-full aspect-[4/3] rounded-xl border-2 transition-all flex items-center justify-center relative overflow-hidden",
        colors,
        active ? "border-[#3390ec] shadow-md shadow-blue-500/10 scale-105" : "border-transparent group-hover:border-slate-300 dark:group-hover:border-slate-600"
      )}>
        {active && <div className="absolute top-1 right-1 bg-[#3390ec] rounded-full p-0.5"><Check className="w-3 h-3 text-white" /></div>}
        <div className="w-1/2 h-2 bg-[#3390ec]/20 rounded-full mb-1"></div>
        <div className="w-1/3 h-2 bg-slate-400/20 rounded-full"></div>
      </div>
      <span className={clsx("text-xs font-semibold", active ? "text-[#3390ec]" : "text-slate-500 dark:text-slate-400")}>{label}</span>
    </div>
  );
}
