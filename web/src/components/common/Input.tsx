import React, { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  className = '',
  ...props
}) => {
  return (
    <div className="mb-4">
      {label && (
        <label className="block text-gray-700 text-sm font-bold mb-2">
          {label}
        </label>
      )}
      <input
        className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-primary ${
          error ? 'border-red-500' : ''
        } ${className}`}
        {...props}
      />
      {error && (
        <p className="text-red-500 text-xs italic mt-1">{error}</p>
      )}
    </div>
  );
};

export default Input;
