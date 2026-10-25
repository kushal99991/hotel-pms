import React, { useEffect, useRef, useState } from "react";
import { Box } from "@mui/material";

interface CountdownSecondsProps {
  duration?: number;
  onCountdownComplete?: () => void;
}

const CountdownSeconds: React.FC<CountdownSecondsProps> = ({
  duration,
  onCountdownComplete,
}) => {
  const timerLength = duration ?? 0;
  const startRef = useRef<Date | null>(null);
  const intervalRef = useRef<number | null>(null);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(duration ?? 0);

  function onTimerComplete() {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      onCountdownComplete?.();
    }
  }

  function onTick() {
    if (startRef.current) {
      const timeNow = new Date();
      const secondsElapsed =
        (timeNow.getTime() - startRef.current.getTime()) / 1000;
      const secondsLeft = timerLength - secondsElapsed;
      if (secondsLeft >= 0) {
        setSecondsLeft(timerLength - secondsElapsed);
      } else {
        onTimerComplete();
      }
    }
  }

  function startInterval() {
    startRef.current = new Date();
    intervalRef.current = window.setInterval(onTick, 500);
  }
  const roundedSecondsLeft = Math.floor(secondsLeft ?? 0);
  useEffect(() => {
    if (!intervalRef.current) {
      startInterval();
    } else if (intervalRef.current) {
      window.clearTimeout(intervalRef.current);
      startInterval();
    }
    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
      }
    };
  }, [duration]);
  return (
    <Box>
      {`${roundedSecondsLeft} ${roundedSecondsLeft !== 1 ? "seconds" : "second"}`}
    </Box>
  );
};

export default CountdownSeconds;
