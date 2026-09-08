import React, { useState } from 'react';
import { getChuckMentorAdvice, HI_LO_SYSTEM_GUIDE, getShoeAdvantageLevel } from '../utils/cardCounting';
import CharacterAvatar from './CharacterAvatar';

/**
 * CardCountingTrainer component:
 * Provides the Hi-Lo tracking dashboard, training wheel toggles, quiz mode, and Chuck's advice.
 */
export const CardCountingTrainer = ({
  runningCount,
  trueCount,
  cardsSeen,
  decksRemaining,
  cardsRemaining,
  showCardTags,
  onToggleCardTags,
  quizMode,
  onToggleQuizMode
}) => {
  const [showChuckModal, setShowChuckModal] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [quizInput, setQuizInput] = useState('');
  const [quizFeedback, setQuizFeedback] = useState(null);
  const [quizStreak, setQuizStreak] = useState(0);

  const advantage = getShoeAdvantageLevel(trueCount);
  const chuckAdvice = getChuckMentorAdvice({
    runningCount,
    trueCount,
    cardsRemaining
  });

  const handleQuizSubmit = (e) => {
    e.preventDefault();
    const parsed = parseInt(quizInput, 10);
    if (isNaN(parsed)) return;

    const diff = Math.abs(parsed - runningCount);
    if (diff === 0) {
      setQuizFeedback({
        correct: true,
        message: `Spot on! Running count is exactly ${runningCount > 0 ? `+${runningCount}` : runningCount} (True Count: ${trueCount > 0 ? `+${trueCount}` : trueCount}).`
      });
      setQuizStreak((prev) => prev + 1);
    } else {
      setQuizFeedback({
        correct: false,
        message: `Not quite. Your guess was ${parsed}, but actual Running count is ${runningCount > 0 ? `+${runningCount}` : runningCount} (True Count: ${trueCount > 0 ? `+${trueCount}` : trueCount}).`
      });
      setQuizStreak(0);
    }
    setQuizInput('');
  };

  return (
    <div className="w-full max-w-5xl my-4 px-2">
      {/* Tracker Bar */}
      <div className="bg-gray-950/80 border border-green-700/60 rounded-2xl p-4 shadow-xl backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-400" />
            <span className="text-white font-bold text-sm sm:text-base tracking-wide uppercase">
              Counter Tracker (Hi-Lo)
            </span>
          </div>

          <div className="flex flex-wrap gap-2 text-xs">
            {/* Card Tag Overlay Toggle */}
            <button
              onClick={onToggleCardTags}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                showCardTags
                  ? 'bg-emerald-600 text-white shadow-[0_0_10px_rgba(16,185,129,0.5)]'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              Card Badges: {showCardTags ? 'ON (+1/0/-1)' : 'OFF'}
            </button>

            {/* Quiz Mode Toggle */}
            <button
              onClick={onToggleQuizMode}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                quizMode
                  ? 'bg-amber-600 text-white shadow-[0_0_10px_rgba(245,158,11,0.5)]'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              Quiz Mode: {quizMode ? 'ACTIVE (Hidden)' : 'INACTIVE'}
            </button>

            {/* Ask Coach Advice Button */}
            <button
              onClick={() => setShowChuckModal(true)}
              className="px-3 py-1.5 rounded-lg font-semibold bg-indigo-700 hover:bg-indigo-600 text-white transition-all flex items-center gap-1.5"
            >
              <CharacterAvatar characterId="chuck" className="w-4 h-4" />
              Coach Advice
            </button>

            {/* Hi-Lo System Guide */}
            <button
              onClick={() => setShowGuideModal(true)}
              className="px-3 py-1.5 rounded-lg font-semibold bg-gray-800 hover:bg-gray-700 text-gray-200 transition-all"
            >
              Hi-Lo Guide
            </button>
          </div>
        </div>

        {/* Counter Values */}
        {quizMode ? (
          <div className="bg-amber-950/40 border border-amber-600/40 rounded-xl p-4 text-center">
            <div className="text-amber-300 font-bold text-sm sm:text-base mb-1">
              Quiz Mode Active: Count is Hidden
            </div>
            <div className="text-gray-300 text-xs mb-3">
              Track the cards in your head as they are dealt onto the table. Check your accuracy below!
            </div>

            <form onSubmit={handleQuizSubmit} className="flex flex-wrap justify-center items-center gap-2 max-w-md mx-auto">
              <input
                type="number"
                value={quizInput}
                onChange={(e) => setQuizInput(e.target.value)}
                placeholder="Your running count (e.g. 2, -1)"
                className="bg-gray-900 border border-gray-700 text-white text-sm rounded-lg px-3 py-2 w-48 text-center focus:outline-none focus:border-amber-500"
              />
              <button
                type="submit"
                className="bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm px-4 py-2 rounded-lg transition-all"
              >
                Submit Check
              </button>
            </form>

            {quizFeedback && (
              <div
                className={`mt-3 text-xs sm:text-sm font-semibold p-2.5 rounded-lg ${
                  quizFeedback.correct ? 'bg-green-900/60 text-green-300 border border-green-500/50' : 'bg-red-900/60 text-red-300 border border-red-500/50'
                }`}
              >
                {quizFeedback.message} {quizStreak > 1 && `(Streak: ${quizStreak} in a row!)`}
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="bg-black/30 rounded-xl p-2.5 border border-white/5">
              <div className="text-xs text-gray-400 uppercase font-semibold">Running Count</div>
              <div className={`text-2xl font-extrabold ${runningCount > 0 ? 'text-green-400' : runningCount < 0 ? 'text-red-400' : 'text-white'}`}>
                {runningCount > 0 ? `+${runningCount}` : runningCount}
              </div>
            </div>

            <div className="bg-black/30 rounded-xl p-2.5 border border-white/5">
              <div className="text-xs text-gray-400 uppercase font-semibold">True Count</div>
              <div className={`text-2xl font-extrabold ${trueCount > 0 ? 'text-emerald-400' : trueCount < 0 ? 'text-rose-400' : 'text-white'}`}>
                {trueCount > 0 ? `+${trueCount}` : trueCount}
              </div>
              <div className={`text-[10px] font-medium mt-0.5 ${advantage.color}`}>{advantage.level}</div>
            </div>

            <div className="bg-black/30 rounded-xl p-2.5 border border-white/5">
              <div className="text-xs text-gray-400 uppercase font-semibold">Cards Seen</div>
              <div className="text-2xl font-extrabold text-gray-200">{cardsSeen}</div>
            </div>

            <div className="bg-black/30 rounded-xl p-2.5 border border-white/5">
              <div className="text-xs text-gray-400 uppercase font-semibold">Decks Remaining</div>
              <div className="text-2xl font-extrabold text-cyan-300">{decksRemaining.toFixed(2)}</div>
            </div>
          </div>
        )}
      </div>

      {/* Chuck Modal */}
      {showChuckModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-gray-900 border-2 border-emerald-500/80 rounded-2xl max-w-lg w-full p-6 shadow-2xl text-white">
            <div className="flex items-center gap-3 mb-4">
              <CharacterAvatar characterId="chuck" className="w-12 h-12" />
              <div>
                <h3 className="text-lg font-bold text-emerald-400">Chuck's Counting Analysis</h3>
                <p className="text-xs text-gray-400">Hi-Lo Shoe Assessment</p>
              </div>
            </div>

            <div className="bg-black/40 rounded-xl p-4 border border-emerald-900/50 mb-4 text-sm text-gray-200 leading-relaxed">
              "{chuckAdvice}"
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs mb-5">
              <div className="bg-gray-800/80 p-2.5 rounded-lg">
                <span className="text-gray-400 block">Current Running:</span>
                <span className="font-bold text-white text-sm">{runningCount > 0 ? `+${runningCount}` : runningCount}</span>
              </div>
              <div className="bg-gray-800/80 p-2.5 rounded-lg">
                <span className="text-gray-400 block">Calculated True:</span>
                <span className="font-bold text-emerald-300 text-sm">{trueCount > 0 ? `+${trueCount}` : trueCount}</span>
              </div>
            </div>

            <button
              onClick={() => setShowChuckModal(false)}
              className="w-full bg-emerald-600 hover:bg-emerald-500 font-bold py-2.5 rounded-xl transition-all"
            >
              Back to Table
            </button>
          </div>
        </div>
      )}

      {/* Guide Modal */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl max-w-xl w-full p-6 shadow-2xl text-white max-h-[85vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-yellow-400 mb-2">{HI_LO_SYSTEM_GUIDE.title}</h3>
            <p className="text-xs text-gray-300 mb-4">
              The Hi-Lo system tracks the ratio of high cards (10s, Aces) to low cards remaining in the shoe.
            </p>

            <div className="space-y-3 mb-5">
              {HI_LO_SYSTEM_GUIDE.principles.map((principle, idx) => (
                <div key={idx} className="bg-gray-800/70 p-3 rounded-xl border border-white/5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-white text-sm">{principle.group}</span>
                    <span className="font-black text-sm px-2 py-0.5 rounded bg-gray-700 text-yellow-300">
                      Value: {principle.value}
                    </span>
                  </div>
                  <div className="text-[11px] font-semibold text-emerald-400 mb-1">{principle.tag}</div>
                  <p className="text-xs text-gray-300">{principle.detail}</p>
                </div>
              ))}
            </div>

            <div className="bg-black/40 p-3.5 rounded-xl border border-white/10 mb-5">
              <h4 className="text-xs font-bold uppercase text-yellow-400 mb-1">True Count Conversion</h4>
              <p className="text-xs text-gray-300 leading-relaxed">
                {HI_LO_SYSTEM_GUIDE.trueCountExplanation}
              </p>
            </div>

            <button
              onClick={() => setShowGuideModal(false)}
              className="w-full bg-gray-700 hover:bg-gray-600 font-bold py-2.5 rounded-xl transition-all"
            >
              Close Guide
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CardCountingTrainer;
