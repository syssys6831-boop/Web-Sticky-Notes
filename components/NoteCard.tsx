
import React, { useState, useEffect } from 'react';
import { Note } from '../types';
import XIcon from './icons/XIcon';
import PaletteIcon from './icons/PaletteIcon';
import FolderIcon from './icons/FolderIcon';
import { NOTE_COLORS } from '../hooks/useFirestoreNotes';

interface NoteCardProps {
  note: Note;
  onContentChange: (id: string, content: string) => void;
  onMinimize: (id:string) => void;
  onStatusChange: (id: string, status: 'active' | 'minimized' | 'archived') => void;
  onInteract: (id: string) => void; // 클릭 시 앞으로 가져오기 위한 핸들러
  onDragStart: (id: string, e: React.MouseEvent<HTMLDivElement>) => void; // 헤더 드래그 시작
  onTouchStart: (id: string, e: React.TouchEvent<HTMLDivElement>) => void;
  onResizeStart: (id: string, e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => void;
  onColorChange: (id: string, color: string) => void;
}

const NoteCard: React.FC<NoteCardProps> = ({ 
  note, 
  onContentChange, 
  onMinimize, 
  onStatusChange,
  onInteract,
  onDragStart, 
  onTouchStart, 
  onResizeStart, 
  onColorChange
}) => {
  const [localContent, setLocalContent] = useState(note.content);
  const [bgColor, textColor] = note.color.split(' ');
  const [isPaletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => {
    if (note.content !== localContent) {
      setLocalContent(note.content);
    }
  }, [note.content]);

  const handleBlur = () => {
    if (localContent !== note.content) {
      onContentChange(note.id, localContent);
    }
  };

  const formattedTimestamp = note.lastEdited?.toDate().toLocaleString([], { 
    month: 'short', 
    day: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit' 
  }) || '...';

  return (
    <div
      data-note-id={note.id}
      // Capture phase event ensures this fires before children (like textarea) but doesn't stop propagation
      onMouseDownCapture={() => onInteract(note.id)}
      className={`absolute rounded-lg shadow-2xl flex flex-col transition-all duration-75 border border-black/5 ${bgColor}`}
      style={{
        left: `${note.position.x}px`,
        top: `${note.position.y}px`,
        width: `${note.size?.width || 300}px`,
        height: `${note.size?.height || 300}px`,
      }}
    >
      {/* Draggable Header - Windows Sticky Style */}
      <div
        className={`flex justify-between items-center px-3 py-2.5 rounded-t-lg cursor-grab active:cursor-grabbing group h-12 select-none`}
        onMouseDown={(e) => onDragStart(note.id, e)}
        onTouchStart={(e) => onTouchStart(note.id, e)}
      >
        <div className="flex items-center gap-1.5">
          <button
            onClick={(e) => { e.stopPropagation(); setPaletteOpen(prev => !prev); }}
            onMouseDown={(e) => e.stopPropagation()} // Prevent drag when clicking button
            className={`p-1.5 rounded-md hover:bg-black/10 focus:outline-none ${textColor} transition-colors`}
          >
            <PaletteIcon className="w-5 h-5" />
          </button>
          
          {isPaletteOpen && (
            <div 
              className="absolute top-11 left-2 bg-white/95 backdrop-blur-sm p-1.5 rounded-xl shadow-2xl flex gap-1.5 z-50 border border-slate-200"
              onMouseDown={(e) => e.stopPropagation()}
            >
              {NOTE_COLORS.map(color => (
                <button
                  key={color}
                  onClick={() => {
                    onColorChange(note.id, color);
                    setPaletteOpen(false);
                  }}
                  className={`w-7 h-7 rounded-full ${color.split(' ')[0]} border border-black/10 hover:scale-110 transition-transform shadow-sm`}
                ></button>
              ))}
            </div>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); onStatusChange(note.id, 'archived'); }}
            onMouseDown={(e) => e.stopPropagation()}
            className={`p-1.5 rounded-md hover:bg-black/10 focus:outline-none ${textColor} transition-colors`}
          >
            <FolderIcon className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex items-center gap-2">
           <span className={`text-[11px] font-black uppercase tracking-wider opacity-60 ${textColor} pointer-events-none`}>
            {formattedTimestamp}
           </span>
           <button
            onClick={(e) => { e.stopPropagation(); onMinimize(note.id); }}
            onMouseDown={(e) => e.stopPropagation()}
            className={`p-1.5 rounded-md hover:bg-red-500 hover:text-white focus:outline-none ${textColor} transition-all`}
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      <textarea
        value={localContent}
        onChange={(e) => setLocalContent(e.target.value)}
        onBlur={handleBlur}
        className={`flex-grow p-5 bg-transparent resize-none focus:outline-none font-bold ${textColor} placeholder-current placeholder-opacity-30 text-base leading-relaxed custom-scrollbar`}
        placeholder="무엇을 적어볼까요?"
      ></textarea>

      {/* Resize Handle */}
      <div
        className="absolute bottom-0 right-0 w-6 h-6 cursor-se-resize z-10 flex items-end justify-end p-1"
        onMouseDown={(e) => onResizeStart(note.id, e)}
        onTouchStart={(e) => onResizeStart(note.id, e)}
      >
        <svg width="12" height="12" viewBox="0 0 12 12" className={`opacity-20 ${textColor}`}>
          <path d="M12 0L0 12H12V0Z" fill="currentColor" />
        </svg>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default NoteCard;
