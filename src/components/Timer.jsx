import React, { useEffect, useState, useCallback, useRef } from "react";
import { Typography } from "@mui/material";
import "./Timer.css";

function Timer({
  length = 3,
  running = true,
  onFinish = () => {},
  color = "blue",
  backgroundColor = "white",
  outlineColor = "black",
  fontColor = "black",
  delay = false,
  completeText = "Start",
  completeColor = "green",
  width = "30vmin",
  height = "30vmin",
  fontSize = 80,
  newTime = 1,
}) {
  const [time, setTime] = useState(1);
  const [done, setDone] = useState(false);
  const Ref = useRef(null);
  const first = useRef(true);

  useEffect(() => {
    resetTimer();
  }, []);

  useEffect(() => {
    if (first.current) first.current = false;
    else setTime(newTime);
  }, [newTime]);

  const resetTimer = () => {
    setTime(length);
    start();
  };

  const start = () => {
    setDone(false);
    const id = setInterval(() => {
      setTime((prev) => prev - 1);
    }, 1000);
    Ref.current = id;
  };

  const stop = () => {
    clearInterval(Ref.current);
    Ref.current = null;
  };

  useEffect(() => {
    if (time <= 0) {
      clearInterval(Ref.current);
      if (delay) {
        setDone(true);
        setTime(length);
        setTimeout(onFinish, 1500);
      } else {
        onFinish();
      }
    }
  }, [time]);

  useEffect(() => {
    if (!running) {
      stop();
    } else if (!Ref.current) {
      start();
    }
  }, [running]);

  return (
    <div className="timer-container">
      <div
        className="timer-circle"
        style={{
          background:
            `linear-gradient(${backgroundColor}, ${backgroundColor}) content-box no-repeat,` +
            `conic-gradient(${done ? completeColor : color} ${
              (time / length) * 100
            }%, 0, ${outlineColor}) border-box`,
          width,
          height,
        }}
      >
        <Typography
          variant="h1"
          className="timer-text"
          style={{ color: done ? completeColor : fontColor, fontSize }}
        >
          {done ? completeText : time}
        </Typography>
      </div>
    </div>
  );
}

export default Timer;
