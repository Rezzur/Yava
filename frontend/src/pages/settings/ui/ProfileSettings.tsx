import { useNavigate } from "react-router-dom";
import { ArrowLeft, Check, Camera } from "lucide-react";
import { useUser } from "@/entities/user/model/useUser";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const profileSchema = z.object({
  name: z.string().min(2, "Имя должно быть не короче 2 символов"),
  username: z.string().min(3, "Юзернейм должен быть не короче 3 символов"),
  bio: z.string().max(150, "О себе не более 150 символов").optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export function ProfileSettings() {
  const navigate = useNavigate();
  const { user, updateProfile } = useUser();

  const { register, handleSubmit, formState: { errors, isDirty } } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      username: user?.username || "",
      bio: user?.bio || "",
    }
  });

  if (!user) return null;

  const onSubmit = (data: ProfileFormValues) => {
    updateProfile(data);
    navigate('/settings'); // Return back after saving
  };

  return (
    <div className="flex-1 bg-[#f4f4f5] dark:bg-slate-950 flex flex-col h-full z-10 overflow-y-auto custom-scrollbar transition-colors">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 h-14 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 sticky top-0 z-20 shadow-sm transition-colors">
        <div className="flex items-center">
          <button 
            onClick={() => navigate('/settings')}
            className="p-2 mr-4 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="font-semibold text-lg text-slate-800 dark:text-slate-100">Изменить профиль</span>
        </div>
        {isDirty && (
          <button 
            onClick={handleSubmit(onSubmit)}
            className="p-2 rounded-full hover:bg-green-50 dark:hover:bg-green-900/20 text-green-600 transition-colors"
          >
            <Check className="w-6 h-6" />
          </button>
        )}
      </div>

      <div className="max-w-xl mx-auto w-full p-4 flex flex-col gap-6 pb-12">
        {/* Avatar Upload */}
        <div className="flex justify-center mt-4">
          <div className="relative group cursor-pointer">
            <img 
              src={user.avatarUrl} 
              className="w-32 h-32 rounded-full object-cover border-4 border-white dark:border-slate-800 shadow-md" 
              alt="Profile" 
            />
            <div className="absolute inset-0 bg-black/50 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white">
              <Camera className="w-8 h-8 mb-1" />
              <span className="text-xs font-medium uppercase tracking-wide">Обновить</span>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <form id="profile-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm p-4 flex flex-col gap-4 transition-colors">
            <div>
              <label className="block text-sm font-medium text-[#3390ec] mb-1 px-1">Имя</label>
              <input 
                {...register("name")}
                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl py-3 px-4 text-[16px] outline-none focus:ring-2 focus:ring-[#3390ec] dark:text-slate-100 transition-all"
                placeholder="Ваше имя"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1 px-1">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-[#3390ec] mb-1 px-1">О себе</label>
              <textarea 
                {...register("bio")}
                rows={3}
                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl py-3 px-4 text-[16px] outline-none focus:ring-2 focus:ring-[#3390ec] resize-none dark:text-slate-100 transition-all"
                placeholder="Расскажите немного о себе"
              />
              <p className="text-slate-400 dark:text-slate-500 text-xs mt-1 px-1">Любые подробности, например: возраст, род занятий или город.</p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm p-4 flex flex-col transition-colors">
            <label className="block text-sm font-medium text-[#3390ec] mb-1 px-1">Имя пользователя</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">@</span>
              <input 
                {...register("username")}
                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl py-3 pl-8 pr-4 text-[16px] outline-none focus:ring-2 focus:ring-[#3390ec] dark:text-slate-100 transition-all"
                placeholder="username"
              />
            </div>
            {errors.username && <p className="text-red-500 text-xs mt-1 px-1">{errors.username.message}</p>}
            <p className="text-slate-400 dark:text-slate-500 text-xs mt-2 px-1 leading-relaxed">
              Вы можете выбрать публичное имя в Yavimax. Это позволит другим пользователям находить вас по такому имени и связываться с вами, не зная вашего номера телефона.
            </p>
          </div>
          
        </form>
      </div>
    </div>
  );
}
