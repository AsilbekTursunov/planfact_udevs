import React, { useState, useRef } from 'react';
import { Paperclip, Send, X } from 'lucide-react';
import { authStore } from '@/store/auth.store';

const CommentChat = ({ dealGuid }) => {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [attachedFiles, setAttachedFiles] = useState([]);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    setAttachedFiles(prev => [...prev, ...files]);
    e.target.value = '';
  };

  const handleSend = () => {
    if (!text.trim() && attachedFiles.length === 0) return;

    const newMsg = {
      id: Date.now(),
      message: text.trim(),
      files: attachedFiles.map(f => ({ name: f.name, size: f.size })),
      email: authStore?.userEmail || 'User',
      createdAt: new Date().toISOString(),
    };

    setMessages(prev => [newMsg, ...prev]);
    setText('');
    setAttachedFiles([]);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col bg-white rounded-lg shadow-[0_8px_18px_rgba(118,164,172,0.1)] h-full border border-gray-100/50">
      {/* Header */}
      <div className="p-5 border-b border-gray-100 inline-flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-800 tracking-wider">ФАЙЛЫ И КОММЕНТАРИИ</h3>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-y-auto flex flex-col justify-center">
        {messages.length === 0 && attachedFiles.length === 0 ? (
          <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mb-5 border border-neutral-100/30">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-gray-400">
                <path d="M22 19V9C22 7.89543 21.1046 7 20 7H13.4142L11.7071 5.29289C11.332 4.91775 10.8234 4.70711 10.2929 4.70711H4C2.89543 4.70711 2 5.60254 2 6.70711V19C2 20.1046 2.89543 21 4 21H20C21.1046 21 22 20.1046 22 19Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M12 11H16M12 13H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <p className="text-xs text-gray-400 max-w-[200px] leading-relaxed">
              Прикрепляйте файлы и оставляйте комментарии для себя и своих коллег
            </p>
          </div>
        ) : (
          <div className="w-full flex-1 flex flex-col gap-3 self-start justify-start">
            {messages.map(msg => (
              <div key={msg.id} className="p-3 bg-gray-50 rounded-lg w-full">
                {msg.files?.map((f, i) => (
                  <div key={i} className="text-xs text-cyan-600 underline mb-1">{f.name}</div>
                ))}
                {msg.message && <p className="text-sm text-gray-800">{msg.message}</p>}
                <div className="flex items-center justify-between mt-2 text-[11px] text-gray-400">
                  <span>{msg.email}</span>
                  <span>{new Date(msg.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Input Bar */}
      <div className="p-5 border-t border-gray-100">
        {attachedFiles.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {attachedFiles.map((f, i) => (
              <div key={i} className="flex items-center gap-1 bg-cyan-50 text-cyan-700 text-xs px-2 py-1 rounded-md">
                <span className="truncate max-w-[100px]">{f.name}</span>
                <button onClick={() => setAttachedFiles(prev => prev.filter((_, idx) => idx !== i))}>
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-end gap-3">
          <label className="cursor-pointer text-cyan-600 hover:text-cyan-700 pb-1">
            <Paperclip size={18} />
            <input 
              ref={fileInputRef} 
              type="file" 
              className="hidden" 
              multiple 
              onChange={handleFileChange} 
            />
          </label>
          <div className="flex-1 relative">
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Написать комментарий"
              className="w-full bg-transparent border-b border-gray-200 focus:border-cyan-500 outline-none text-sm pb-1 resize-none pr-8"
              rows={1}
            />
          </div>
          <button 
            onClick={handleSend} 
            className={`pb-1 ${(text.trim() || attachedFiles.length > 0) ? 'text-cyan-600 hover:text-cyan-700' : 'text-gray-300'}`}
          >
            <Send size={18} fill={(text.trim() || attachedFiles.length > 0) ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommentChat;