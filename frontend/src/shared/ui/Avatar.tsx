import { clsx } from "clsx";

interface AvatarProps {
  src?: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function Avatar({ src, name, size = 'md', className }: AvatarProps) {
  const sizeClasses = {
    xs: "w-8 h-8 text-[10px]",
    sm: "w-10 h-10 text-xs",
    md: "w-12 h-12 text-sm",
    lg: "w-16 h-16 text-lg",
    xl: "w-24 h-24 text-2xl"
  };

  if (src && src !== 'null' && src !== '') {
    return (
      <img 
        src={src} 
        alt={name} 
        className={clsx("rounded-full object-cover shrink-0", sizeClasses[size], className)} 
      />
    );
  }

  const initials = name
    ? name.split(' ').filter(x => x).map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : '?';

  // More professional color palette (slate/blue tones)
  const colors = [
    'bg-slate-400', 'bg-blue-400', 'bg-indigo-400', 
    'bg-emerald-400', 'bg-cyan-400', 'bg-sky-400'
  ];
  
  const colorIndex = name 
    ? name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length
    : 0;

  return (
    <div className={clsx(
      "rounded-full flex items-center justify-center text-white font-semibold shrink-0 uppercase", 
      colors[colorIndex],
      sizeClasses[size],
      className
    )}>
      {initials}
    </div>
  );
}
