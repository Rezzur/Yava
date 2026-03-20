import { MessageCircle } from "lucide-react";

export function EmptyChat() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-[url('https://web.telegram.org/a/chat-bg-pattern-light.png')] bg-[#94afb6]/20 bg-cover">
      <div className="bg-[#94afb6]/20 py-2 px-4 rounded-full text-white backdrop-blur-sm text-sm font-medium flex items-center gap-2 shadow-sm bg-black/10">
        <MessageCircle className="w-4 h-4" />
        Выбери��е чат, чтобы начать общение
      </div>
    </div>
  );
}
