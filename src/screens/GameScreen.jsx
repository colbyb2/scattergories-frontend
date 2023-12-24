import React, { useState, useContext, useEffect } from "react";
import Timer from "../components/Timer";
import { Typography } from "@mui/material";
import GameForm from "../components/GameForm";
import LeaderBoard from "../components/LeaderBoard";
import GameContext from "../logic/GameContext";
import Socket from "../logic/Socket";
import { useParams } from "react-router-dom";

function GameScreen() {
  const [gameState, setGameState] = useContext(GameContext);

  const [roundState, setRoundState] = useState(0);

  const { lobbyId } = useParams();

  useEffect(() => registerListeners());

  useEffect(() => attemptReconnect(), [gameState.connected]);

  const registerListeners = () => {
    Socket.instance.socket.on("StartRound", (game) => {
      if (game.id === gameState.id) {
        setGameState((prevState) => Object.assign({}, prevState, game));
        setRoundState(1);
      }
    });
    Socket.instance.socket.on("GameFetched", (game) => {
      if (game.id === lobbyId) {
        setGameState((prevState) => Object.assign({}, prevState, game));
        setRoundState(game.roundStage);
      }
    });
  };

  const attemptReconnect = () => {
    if (gameState.connected) {
      Socket.instance.socket.emit("UserReconnect", lobbyId);
    }
  };

  const startRound = () => {
    setRoundState(2);
  };

  const submitScores = (score) => {
    Socket.instance.socket.emit("SubmitScore", score);
    Socket.instance.socket.on("ScoresDone", (game) => {
      if (game.id === gameState.id) {
        setGameState((prevState) => Object.assign({}, prevState, game));
        setRoundState(3);
      }
    });
    //Sends traffic to server to prevent inactivity
    fetch(Socket.baseURL + "/health");
  };

  return (
    <div className="VStack" style={{ flex: 1 }}>
      {roundState === 0 ? (
        <Typography variant="h2" style={{ marginTop: "10vh" }}>
          Reconnecting...
        </Typography>
      ) : null}
      {roundState === 1 ? (
        <RoundIntro gameState={gameState} startRound={startRound} />
      ) : null}
      {roundState === 2 ? (
        <GameForm setRoundState={setRoundState} submitScores={submitScores} />
      ) : null}
      {roundState === 3 ? <LeaderBoard /> : null}
    </div>
  );
}

function RoundIntro({ gameState, startRound }) {
  const [timer, setTimer] = useState(1);

  useEffect(() => {
    if (gameState.roundStage === 1) setTimer(gameState.remainingTime);
  }, [gameState.currentRound]);

  return (
    <div className="VStack">
      <Typography variant="h2">{`Round ${gameState.currentRound}/${gameState.rounds}`}</Typography>
      <div className="HStack" style={{ marginTop: 40, marginBottom: 35 }}>
        <Typography variant="h3" style={{ paddingRight: 20 }}>
          Letter:{" "}
        </Typography>
        <Typography
          variant="h3"
          style={{ fontWeight: "bold", fontSize: 70, color: "blue" }}
        >
          {gameState.currentLetter}
        </Typography>
      </div>
      <Timer
        length={5}
        newTime={timer}
        onFinish={startRound}
        completeText="Go"
        delay={true}
        width="100px"
        height="100px"
        fontSize="50px"
      />
    </div>
  );
}

export default GameScreen;
