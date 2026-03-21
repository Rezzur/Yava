import { clsx } from "clsx";

interface AvatarProps {
  src?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function Avatar({ src, name, size = 'md', className }: AvatarProps) {
  const sizeClasses = {
    sm: "w-10 h-10 text-sm",
    md: "w-14 h-14 text-lg",
    lg: "w-24 h-24 text-2xl",
    xl: "w-32 h-32 text-4xl"
  };

  if (src) {
    return (
      <img 
        src={src} 
        alt={name} 
        className={clsx("rounded-full object-cover shrink-0", sizeClasses[size], className)} 
      />
    );
  }

  const initials = name
    ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : '?';

  // Generate a consistent color based on the name
  const colors = [
    'bg-red-500', 'bg-green-500', 'bg-blue-500', 
    'bg-yellow-500', 'bg-purple-500', 'bg-pink-500', 
    'bg-indigo-500', 'bg-teal-500', 'bg-orange-500'
  ];
  
  const colorIndex = name 
    ? name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length
    : 0;

  return (
    <div className={clsx(
      "rounded-full flex items-center justify-center text-white font-bold shrink-0", 
      colors[colorIndex],
      sizeClasses[size],
      className
    )}>
      {initials}
    </div>
  );
}
