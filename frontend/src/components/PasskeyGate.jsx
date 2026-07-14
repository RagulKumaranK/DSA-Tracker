import { useState } from 'react';

const CORRECT_PASSKEY = '2004';

export default function PasskeyGate({ onUnlock }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState(false);
  const [shaking, setShaking] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (code === CORRECT_PASSKEY) {
      sessionStorage.setItem('dsa-unlocked', 'true');
      onUnlock();
    } else {
      setError(true);
      setShaking(true);
      setTimeout(() => setShaking(false), 500);
      setTimeout(() => setError(false), 2000);
    }
  };

  const handleDotClick = (num) => {
    if (code.length < 4) {
      setCode((prev) => prev + num);
      setError(false);
    }
  };

  const handleDelete = () => {
    setCode((prev) => prev.slice(0, -1));
    setError(false);
  };

  const handleClear = () => {
    setCode('');
    setError(false);
  };

  const filledDots = code.length;

  return (
    <div className="passkey-overlay">
      <div className="passkey-glow" />
      <div className={`passkey-card ${shaking ? 'shake' : ''}`}>
        {/* Lock icon */}
        <div className="passkey-icon">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            <circle cx="12" cy="16" r="1" />
          </svg>
        </div>

        <h2 className="passkey-title">Verification Required</h2>
        <p className="passkey-subtitle">Enter the 4-digit passkey to continue</p>

        {/* Dots indicator */}
        <div className="passkey-dots">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`passkey-dot ${i < filledDots ? 'filled' : ''} ${error ? 'error' : ''}`}
            />
          ))}
        </div>

        {/* Error message */}
        <div className={`passkey-error ${error ? 'visible' : ''}`}>
          Incorrect passkey. Try again.
        </div>

        {/* Number pad */}
        <div className="passkey-numpad">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              type="button"
              className="numpad-btn"
              onClick={() => handleDotClick(String(num))}
            >
              {num}
            </button>
          ))}
          <button type="button" className="numpad-btn numpad-action" onClick={handleClear}>
            C
          </button>
          <button
            type="button"
            className="numpad-btn"
            onClick={() => handleDotClick('0')}
          >
            0
          </button>
          <button type="button" className="numpad-btn numpad-action" onClick={handleDelete}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" />
              <line x1="18" y1="9" x2="12" y2="15" />
              <line x1="12" y1="9" x2="18" y2="15" />
            </svg>
          </button>
        </div>

        {/* Submit */}
        <button
          type="button"
          className="passkey-submit"
          onClick={handleSubmit}
          disabled={code.length < 4}
        >
          Unlock
        </button>
      </div>
    </div>
  );
}
