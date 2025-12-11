"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

interface CountdownTimerProps {
  endDate: Date;
}

export function CountdownTimer({ endDate }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const end = new Date(endDate).getTime();
      const difference = end - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    // Calculer immédiatement
    calculateTimeLeft();

    // Mettre à jour toutes les secondes
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [endDate]);

  if (!timeLeft) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Clock className="h-4 w-4" />
        <span>Calcul en cours...</span>
      </div>
    );
  }

  if (timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0) {
    return (
      <div className="flex items-center gap-2 text-sm font-medium text-destructive">
        <Clock className="h-4 w-4" />
        <span>Enchère terminée</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Clock className="h-4 w-4 text-muted-foreground" />
      <div className="flex items-center gap-2 text-sm">
        {timeLeft.days > 0 && (
          <span className="font-medium">
            {timeLeft.days}j
          </span>
        )}
        <span className="font-medium">
          {String(timeLeft.hours).padStart(2, "0")}h
        </span>
        <span className="font-medium">
          {String(timeLeft.minutes).padStart(2, "0")}m
        </span>
        <span className="font-medium text-primary">
          {String(timeLeft.seconds).padStart(2, "0")}s
        </span>
      </div>
    </div>
  );
}

