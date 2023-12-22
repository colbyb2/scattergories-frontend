import React, { useState, useContext, useEffect } from "react";
import { TextField, Typography, IconButton, Button } from "@mui/material";
import Timer from "./Timer";
import CancelIcon from "@mui/icons-material/Cancel";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import Filter2Icon from "@mui/icons-material/Filter2";
import GameContext from "../logic/GameContext";

function GameForm({ letter, submitScores }) {
  const [gameState, setGameState] = useContext(GameContext);

  const [roundActive, setRoundActive] = useState(true);
  const [answers, setAnswers] = useState([
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
  ]);
  const [results, setResults] = useState([]);
  const [timer, setTimer] = useState(1);

  const [submitted, setSubmitted] = useState(false);

  const [categories, setCategories] = useState([]);

  useEffect(() => {
    if (gameState.roundStage === 2) {
      if (gameState.remainingTime === 0) setRoundActive(false);
      else setTimer(gameState.remainingTime);
    }

    const start = (gameState.currentRound - 1) * 12;
    const end = start + 12;
    setCategories(gameState.allCategories.slice(start, end));
  }, [gameState.currentRound]);

  const roundComplete = () => {
    setRoundActive(false);
  };

  const submitScore = () => {
    const score = results.reduce((acc, curr) => {
      if (curr) {
        return acc + curr;
      } else {
        return acc + 0;
      }
    }, 0);
    submitScores(score);
    setSubmitted(true);
  };

  return (
    <div className="VStack" style={{ margin: "30px 0" }}>
      {roundActive ? (
        <>
          <Timer
            length={gameState.time}
            newTime={timer}
            onFinish={roundComplete}
            width="100px"
            height="100px"
            fontSize="50px"
          />
          <Typography
            variant="h4"
            style={{ marginTop: 30 }}
          >{`Round ${gameState.currentRound}: Letter is ${gameState.currentLetter}`}</Typography>
        </>
      ) : (
        <Typography variant="h4" style={{ marginBottom: 20 }}>
          {`Round Points: ${results.reduce((acc, curr) => {
            if (curr) {
              return acc + curr;
            } else {
              return acc + 0;
            }
          }, 0)}`}
        </Typography>
      )}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          minWidth: "40vw",
        }}
      >
        {roundActive ? null : (
          <Button
            variant="contained"
            style={{ maxWidth: 150, alignSelf: "center" }}
            onClick={submitScore}
            disabled={submitted}
          >
            {submitted ? "Submitted Score" : "Done Scoring"}
          </Button>
        )}
        {categories.map((cat, idx) => (
          <div className="HStack" key={cat}>
            <Typography
              variant="caption"
              style={{
                fontSize: "18px",
                paddingTop: "15px",
                marginRight: "10px",
              }}
            >
              {`${idx + 1})`}
            </Typography>
            <TextField
              variant="standard"
              label={cat}
              style={{ width: "100%" }}
              InputProps={{ readOnly: !roundActive }}
              value={answers[idx]}
              onChange={(e) => {
                let newAnswers = [...answers];
                newAnswers[idx] = e.target.value;
                setAnswers(newAnswers);
              }}
            />
            {!roundActive ? (
              <div className="HStack" style={{ paddingTop: "15px" }}>
                <IconButton
                  title="Wrong"
                  onClick={() => {
                    let newResults = [...results];
                    newResults[idx] = 0;
                    setResults(newResults);
                  }}
                >
                  <CancelIcon
                    fontSize="large"
                    color={results[idx] === 0 || !results[idx] ? "error" : ""}
                  />
                </IconButton>
                <IconButton
                  title="Correct"
                  onClick={() => {
                    let newResults = [...results];
                    newResults[idx] = 1;
                    setResults(newResults);
                  }}
                >
                  <CheckCircleIcon
                    fontSize="large"
                    color={
                      results[idx] === 1 || results[idx] === undefined
                        ? "primary"
                        : ""
                    }
                  />
                </IconButton>
                <IconButton
                  title="Double Points"
                  onClick={() => {
                    let newResults = [...results];
                    newResults[idx] = 2;
                    setResults(newResults);
                  }}
                >
                  <Filter2Icon
                    fontSize="large"
                    color={
                      results[idx] === 2 || results[idx] === undefined
                        ? "success"
                        : ""
                    }
                  />
                </IconButton>
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}

export default GameForm;
