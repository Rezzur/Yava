import { useState } from "react";
import { MessageCircle, ArrowRight, User as UserIcon, Lock, Phone } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { clsx } from "clsx";
import { useAuthStore } from "@/entities/user/model/authStore";

export function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  
  const navigate = useNavigate();
  const { login, register, isLoading, error, clearError } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    
    try {
      if (isLogin) {
        await login(identifier, password);
      } else {
        await register({ name, username: identifier, phone, password });
      }
      navigate("/chat");
    } catch (err) {
      // Error is handled by the store
    }
  };

  const isFormValid = isLogin 
    ? identifier.trim() && password.trim()
    : name.trim() && identifier.trim() && phone.trim() && password.trim();

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#e4ebf0] dark:bg-slate-950 transition-colors p-4 relative overflow-hidden">
      
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-500/20 dark:bg-blue-500/10 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-purple-500/20 dark:bg-purple-500/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="w-full max-w-[400px] bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl overflow-hidden relative z-10 animate-in fade-in zoom-in-95 duration-300">
        
        <div className="pt-10 pb-6 px-8 flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-[#3390ec] to-[#0057b7] rounded-[1.5rem] shadow-lg shadow-blue-500/30 flex items-center justify-center text-white mb-6">
            <MessageCircle className="w-10 h-10" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            {isLogin ? "Вход в Yavimax" : "Регистрация"}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-[15px]">
            {isLogin 
              ? "Введите номер телефона или username и пароль" 
              : "Заполните данные, чтобы создать новый аккаунт"}
          </p>
        </div>

        {error && (
          <div className="mx-8 mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="px-8 pb-8 flex flex-col gap-4">
          
          {!isLogin && (
            <>
              <div className="relative group">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-[#3390ec] transition-colors" />
                <input 
                  type="text" 
                  placeholder="Ваше имя" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required={!isLogin}
                  className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl py-3.5 pl-12 pr-4 text-[16px] outline-none focus:ring-2 focus:ring-[#3390ec] dark:text-slate-100 transition-all placeholder-slate-400"
                />
              </div>

              <div className="relative group">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-[#3390ec] transition-colors" />
                <input 
                  type="tel" 
                  placeholder="Номер телефона" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required={!isLogin}
                  className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl py-3.5 pl-12 pr-4 text-[16px] outline-none focus:ring-2 focus:ring-[#3390ec] dark:text-slate-100 transition-all placeholder-slate-400"
                />
              </div>
            </>
          )}

          <div className="relative group">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">@</span>
            <input 
              type="text" 
              placeholder="Username" 
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
              className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl py-3.5 pl-10 pr-4 text-[16px] outline-none focus:ring-2 focus:ring-[#3390ec] dark:text-slate-100 transition-all placeholder-slate-400"
            />
          </div>

          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-[#3390ec] transition-colors" />
            <input 
              type="password" 
              placeholder="Пароль" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl py-3.5 pl-12 pr-4 text-[16px] outline-none focus:ring-2 focus:ring-[#3390ec] dark:text-slate-100 transition-all placeholder-slate-400"
            />
          </div>

          <button 
            type="submit"
            disabled={!isFormValid || isLoading}
            className={clsx(
              "w-full mt-2 py-4 rounded-2xl text-white font-medium text-[16px] flex items-center justify-center transition-all shadow-md active:scale-[0.98]",
              isFormValid && !isLoading
                ? "bg-[#3390ec] hover:bg-[#2884e0] shadow-blue-500/25" 
                : "bg-slate-300 dark:bg-slate-700 cursor-not-allowed text-slate-500 dark:text-slate-400 shadow-none"
            )}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>{isLogin ? "Войти" : "Продолжить"} <ArrowRight className="w-5 h-5 ml-2" /></>
            )}
          </button>
        </form>

        <div className="bg-slate-50 dark:bg-slate-800/50 p-6 flex justify-center border-t border-slate-100 dark:border-slate-800">
          <button 
            onClick={() => { setIsLogin(!isLogin); clearError(); }}
            className="text-[#3390ec] hover:text-[#2884e0] font-medium text-[15px] transition-colors"
          >
            {isLogin ? "Нет аккаунта? Зарегистрироваться" : "Уже есть аккаунт? Войти"}
          </button>
        </div>
      </div>
    </div>
  );
}
