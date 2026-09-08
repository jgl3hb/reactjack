import React from 'react';
import CharacterAvatar from './CharacterAvatar';

/**
 * TableTalkLog: Collapsible panel showing chronological banter history
 */
export const TableTalkLog = ({ messages = [], isOpen = false, onToggle, onClear }) => {
  return (
    <div className="fixed bottom-4 right-4 z-40">
      {isOpen ? (
        <div className="w-80 sm:w-96 max-h-96 flex flex-col bg-gray-950/95 border border-green-700/60 rounded-2xl shadow-2xl backdrop-blur-md overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-green-950/80 border-b border-green-800/60">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse" />
              <h3 className="text-white text-sm font-bold tracking-wide">Table Banter</h3>
            </div>
            <div className="flex items-center gap-2">
              {messages.length > 0 && (
                <button
                  onClick={onClear}
                  className="text-xs text-gray-400 hover:text-gray-200 px-2 py-0.5 rounded border border-gray-700"
                >
                  Clear
                </button>
              )}
              <button
                onClick={onToggle}
                className="text-gray-400 hover:text-white text-base font-bold px-2 py-0.5 rounded"
                aria-label="Close Table Talk"
              >
                X
              </button>
            </div>
          </div>

          <div className="flex-1 p-3 overflow-y-auto space-y-2.5 max-h-72 text-xs">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 py-8 italic">
                No chatter yet. Deal a round to start table talk!
              </div>
            ) : (
              messages.map((msg, i) => (
                <div key={msg.id || i} className="flex items-start gap-2.5 bg-gray-900/60 p-2 rounded-xl border border-white/5">
                  <div className="flex-shrink-0 mt-0.5">
                    <CharacterAvatar characterId={msg.characterId} className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-semibold text-gray-200 truncate">{msg.speaker}</span>
                      <span className="text-[10px] text-gray-500">{msg.time}</span>
                    </div>
                    <p className="text-gray-300 leading-snug">{msg.text}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        <button
          onClick={onToggle}
          className="flex items-center gap-2 bg-green-900/90 hover:bg-green-800 border border-green-600/50 text-white px-4 py-2.5 rounded-full shadow-lg transition-all duration-200 hover:scale-105"
        >
          <span className="w-2 h-2 rounded-full bg-green-400" />
          <span className="text-xs sm:text-sm font-semibold">Table Banter</span>
          {messages.length > 0 && (
            <span className="bg-yellow-500 text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {messages.length}
            </span>
          )}
        </button>
      )}
    </div>
  );
};

export default TableTalkLog;
