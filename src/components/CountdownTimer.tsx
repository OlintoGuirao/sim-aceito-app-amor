import React, { useState, useEffect } from 'react';
interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}
interface CountdownTimerProps {
  targetDate: Date;
}
const CountdownTimer: React.FC<CountdownTimerProps> = ({
  targetDate
}) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = +targetDate - +new Date();
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor(difference / (1000 * 60 * 60) % 24),
          minutes: Math.floor(difference / 1000 / 60 % 60),
          seconds: Math.floor(difference / 1000 % 60)
        });
      }
    };
    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);
  const cardClass =
    'bg-wedding-secondary border-2 border-wedding-olive rounded-2xl p-4 text-center animate-fade-in shadow-md';
  const numberClass = 'text-3xl md:text-4xl font-bold text-wedding-olive mb-1';
  const labelClass = 'text-sm font-semibold text-wedding-olive uppercase tracking-wide';

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full max-w-2xl">
        <div className={cardClass}>
          <div className={numberClass}>{timeLeft.days}</div>
          <div className={labelClass}>Dias</div>
        </div>

        <div className={cardClass} style={{ animationDelay: '0.1s' }}>
          <div className={numberClass}>{timeLeft.hours}</div>
          <div className={labelClass}>Horas</div>
        </div>

        <div className={cardClass} style={{ animationDelay: '0.2s' }}>
          <div className={numberClass}>{timeLeft.minutes}</div>
          <div className={labelClass}>Minutos</div>
        </div>

        <div className={cardClass} style={{ animationDelay: '0.3s' }}>
          <div className={numberClass}>{timeLeft.seconds}</div>
          <div className={labelClass}>Segundos</div>
        </div>
      </div>
    </div>
  );
};
export default CountdownTimer;