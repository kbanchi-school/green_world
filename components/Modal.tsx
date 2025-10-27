import React from 'react';

interface ModalProps {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  contentDataTutorialId?: string;
}

const Modal: React.FC<ModalProps> = ({ title, children, onClose, contentDataTutorialId }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[1000] p-4">
      <div className="bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg border border-slate-600 animate-fade-in" data-tutorial-id={contentDataTutorialId}>
        <div className="flex justify-between items-center p-4 border-b border-slate-700">
          <h2 className="text-2xl font-bold text-cyan-300">{title}</h2>
          {onClose && <button onClick={onClose} className="text-slate-400 hover:text-white">&times;</button>}
        </div>
        <div>{children}</div>
      </div>
       <style>{`
        @keyframes fade-in {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in {
            animation: fade-in 0.3s ease-out forwards;
        }
    `}</style>
    </div>
  );
};

export default Modal;