
import React from 'react';
import { audioManager } from './audio';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  playSound?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ children, className, onClick, playSound = true, ...props }) => {
  const baseClasses = `
    px-4 py-2 rounded-lg font-bold text-white transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900
    disabled:opacity-50 disabled:cursor-not-allowed
  `;
  const defaultClasses = `
    bg-cyan-600 hover:bg-cyan-500 focus:ring-cyan-400
  `;

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (playSound && !props.disabled) {
      audioManager.playClickSound();
    }
    if (onClick) {
      onClick(event);
    }
  };

  return (
    <button className={`${baseClasses} ${className || defaultClasses}`} onClick={handleClick} {...props}>
      {children}
    </button>
  );
};
