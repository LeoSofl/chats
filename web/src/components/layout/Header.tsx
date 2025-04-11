import React from 'react';
import { EllipsisVerticalIcon as DotsVerticalIcon } from '@heroicons/react/24/solid';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

const Header: React.FC<HeaderProps> = ({ title, subtitle }) => {
  return (
    <div className="flex justify-between items-center p-4 border-b bg-white">
      <div>
        <h2 className="text-lg font-medium">{title}</h2>
        {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
      </div>
      <button className="p-2 rounded-full hover:bg-gray-100">
        <DotsVerticalIcon className="h-5 w-5 text-gray-500" />
      </button>
    </div>
  );
};

export default Header;