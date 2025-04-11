import React from 'react';

interface AvatarProps {
  src?: string;
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const Avatar: React.FC<AvatarProps> = ({
  src,
  name,
  size = 'md',
  className = '',
}) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-base'
  };
  
  const classes = `${sizeClasses[size]} rounded-full flex items-center justify-center ${className}`;
  
  if (src) {
    return (
      <img 
        src={src} 
        alt={name} 
        className={`${classes} object-cover`}
      />
    );
  }
  
  // 根据名字生成一个唯一的背景色
  const colors = [
    'bg-red-500', 'bg-blue-500', 'bg-green-500', 
    'bg-yellow-500', 'bg-purple-500', 'bg-pink-500'
  ];
  
  const colorIndex = name.charCodeAt(0) % colors.length;
  const bgColorClass = colors[colorIndex];
  
  return (
    <div className={`${classes} ${bgColorClass} text-white`}>
      {getInitials(name)}
    </div>
  );
};

export default Avatar;