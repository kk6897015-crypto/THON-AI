import React, { useState, useEffect } from 'react';

export const CountDownBadge = ({ deadline }) => {
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    if (!deadline) return;

    const calculateTime = () => {
      const target = new Date(deadline).getTime();
      const now = new Date().getTime();
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft({ expired: true });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds, diff });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [deadline]);

  if (!deadline) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono-tabular bg-slate-800/80 border border-slate-700 text-slate-400">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
        No deadline
      </span>
    );
  }

  if (!timeLeft) return null;

  if (timeLeft.expired) {
    return (
      <span className="badge-expired inline-flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
        EXPIRED
      </span>
    );
  }

  if (timeLeft.days === 0) {
    return (
      <span className="badge-urgent inline-flex items-center gap-1.5 font-mono-tabular">
        <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
        CLOSING IN {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
      </span>
    );
  }

  if (timeLeft.days <= 3) {
    return (
      <span className="badge-urgent inline-flex items-center gap-1.5 font-mono-tabular">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
        {timeLeft.days}d {timeLeft.hours}h LEFT
      </span>
    );
  }

  return (
    <span className="badge-live inline-flex items-center gap-1.5 font-mono-tabular">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
      {timeLeft.days} DAYS LEFT
    </span>
  );
};

