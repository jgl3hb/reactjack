import React from 'react';

/**
 * Character avatar rendering for Alice, Bob, Chuck, Jim Bob, and You.
 */
export const CharacterAvatar = ({ characterId, className = 'w-12 h-12' }) => {
  switch (characterId) {
    case 'alice':
      return (
        <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <circle cx="32" cy="32" r="30" fill="#1e1b4b" stroke="#6366f1" strokeWidth="2.5" />
          <circle cx="32" cy="24" r="11" fill="#c7d2fe" />
          <rect x="23" y="21" width="7" height="6" rx="2" stroke="#312e81" strokeWidth="1.5" fill="none" />
          <rect x="34" y="21" width="7" height="6" rx="2" stroke="#312e81" strokeWidth="1.5" fill="none" />
          <line x1="30" y1="24" x2="34" y2="24" stroke="#312e81" strokeWidth="1.5" />
          <path d="M18 52c0-8 6.3-13 14-13s14 5 14 13" fill="#4338ca" />
        </svg>
      );
    case 'bob':
      return (
        <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <circle cx="32" cy="32" r="30" fill="#4c0519" stroke="#f43f5e" strokeWidth="2.5" />
          <circle cx="32" cy="24" r="11" fill="#fecdd3" />
          <path d="M22 22h20l-3 4H25l-3-4z" fill="#881337" />
          <circle cx="28" cy="23" r="2.5" fill="#000" />
          <circle cx="36" cy="23" r="2.5" fill="#000" />
          <path d="M27 29q5 4 10 0" stroke="#881337" strokeWidth="1.5" fill="none" />
          <path d="M18 52c0-8 6.3-13 14-13s14 5 14 13" fill="#be123c" />
        </svg>
      );
    case 'chuck':
      return (
        <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <circle cx="32" cy="32" r="30" fill="#064e3b" stroke="#10b981" strokeWidth="2.5" />
          <circle cx="32" cy="24" r="11" fill="#a7f3d0" />
          <rect x="20" y="20" width="24" height="5" rx="2" fill="#047857" />
          <circle cx="28" cy="26" r="2" fill="#065f46" />
          <circle cx="36" cy="26" r="2" fill="#065f46" />
          <line x1="28" y1="31" x2="36" y2="31" stroke="#047857" strokeWidth="1.5" />
          <path d="M18 52c0-8 6.3-13 14-13s14 5 14 13" fill="#059669" />
        </svg>
      );
    case 'jimbob':
      return (
        <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <circle cx="32" cy="32" r="30" fill="#451a03" stroke="#f59e0b" strokeWidth="2.5" />
          <circle cx="32" cy="24" r="11" fill="#fde68a" />
          <path d="M22 17c2-4 18-4 20 0l-3 3H25l-3-3z" fill="#b45309" />
          <circle cx="27" cy="24" r="2.5" fill="#78350f" />
          <circle cx="37" cy="24" r="2.5" fill="#78350f" />
          <ellipse cx="32" cy="29" rx="3" ry="2" fill="#b45309" />
          <path d="M18 52c0-8 6.3-13 14-13s14 5 14 13" fill="#d97706" />
        </svg>
      );
    case 'human':
    default:
      return (
        <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <circle cx="32" cy="32" r="30" fill="#083344" stroke="#06b6d4" strokeWidth="2.5" />
          <circle cx="32" cy="24" r="11" fill="#cffafe" />
          <circle cx="28" cy="23" r="2.5" fill="#0e7490" />
          <circle cx="36" cy="23" r="2.5" fill="#0e7490" />
          <path d="M28 29q4 3 8 0" stroke="#0e7490" strokeWidth="1.5" fill="none" />
          <path d="M18 52c0-8 6.3-13 14-13s14 5 14 13" fill="#0891b2" />
        </svg>
      );
  }
};

export default CharacterAvatar;
