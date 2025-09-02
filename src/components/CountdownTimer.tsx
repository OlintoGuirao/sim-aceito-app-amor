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
  return <div className="flex flex-col items-center space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full max-w-2xl">
        <div className="glass-effect rounded-2xl p-4 text-center animate-fade-in">
          <div className="text-3xl md:text-4xl font-bold text-wedding-marsala mb-1">
            {timeLeft.days}
          </div>
          <div className="text-sm font-medium text-wedding-secondary uppercase tracking-wide bg-transparent">
            Dias
          </div>
        </div>
        
        <div className="glass-effect rounded-2xl p-4 text-center animate-fade-in" style={{
        animationDelay: '0.1s'
      }}>
          <div className="text-3xl md:text-4xl font-bold text-wedding-marsala mb-1">
            {timeLeft.hours}
          </div>
          <div className="text-sm font-medium text-wedding-secondary uppercase tracking-wide bg-transparent">
            Horas
          </div>
        </div>
        
        <div className="glass-effect rounded-2xl p-4 text-center animate-fade-in" style={{
        animationDelay: '0.2s'
      }}>
          <div className="text-3xl md:text-4xl font-bold text-wedding-marsala mb-1">
            {timeLeft.minutes}
          </div>
          <div className="text-sm font-medium text-wedding-secondary uppercase tracking-wide bg-transparent">
            Minutos
          </div>
        </div>
        
        <div className="glass-effect rounded-2xl p-4 text-center animate-fade-in" style={{
        animationDelay: '0.3s'
      }}>
          <div className="text-3xl md:text-4xl font-bold text-wedding-marsala mb-1">
            {timeLeft.seconds}
          </div>
          <div className="text-sm font-medium text-wedding-secondary uppercase tracking-wide bg-transparent">
            Segundos
          </div>
        </div>
      </div>
    </div>;
};
export default CountdownTimer;