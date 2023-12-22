import { Button, Typography, Modal } from "@mui/material";
import React, { useEffect, useState, useContext } from "react";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import { useNavigate } from "react-router-dom";
import GameContext from "../logic/GameContext";
import Socket from "../logic/Socket";
import ChickenImage from "../assets/king-chicken.png";

function LeaderBoard() {
  const [gameState, setGameState] = useContext(GameContext);

  const [rowsVisible, setRowsVisible] = useState([]);
  const [showWinner, setShowWinner] = useState(false);

  const [isHost, setIsHost] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    effect();
  }, []);

  const effect = async () => {
    staggerAnimation().then(() => {
      showWinnerImage();
      if (gameState.currentRound === gameState.rounds) {
      }
    });
  };

  const staggerAnimation = async () => {
    const wait = (ms) => new Promise((res) => setTimeout(res, ms));

    for (let i = 0; i < gameState.users.length; i++) {
      setRowsVisible((prev) => {
        let copy = [...prev];
        copy[i] = true;
        return copy;
      });

      await wait(750);
    }
  };

  const showWinnerImage = () => {
    gameState.users.sort(
      (a, b) => gameState.scores[b.socketId] - gameState.scores[a.socketId]
    );
    if (gameState.users[0].socketId === Socket.instance.socket.id) {
      setShowWinner(true);
    }
  };

  //Continue is clicked on leaderboard
  const nextRound = () => {
    if (gameState.currentRound.toString() === gameState.rounds) {
      navigate("/");
      return;
    }
    Socket.instance.socket.emit("NextRound");
  };

  useEffect(() => {
    if (gameState.host.socketId === Socket.instance.socket.id) {
      setIsHost(true);
    } else {
      setIsHost(false);
    }
  }, []);

  return (
    <div className="VStack">
      <Typography variant="h3">Leaderboard</Typography>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "35vw",
          minWidth: "300px",
          padding: "10px",
          border: "0.5px solid grey",
          borderRadius: "15px",
          marginTop: 25,
        }}
      >
        {gameState.users
          .sort(
            (a, b) =>
              gameState.scores[b.socketId] - gameState.scores[a.socketId]
          )
          .map((user, idx) => {
            return (
              <div
                className="fade"
                key={user.username}
                style={{
                  opacity: rowsVisible[idx] === true ? 1 : 0,
                  paddingTop: "10px",
                }}
              >
                <div className="HStack">
                  <Typography variant="body1" style={{ fontSize: 30 }}>
                    {user.username}
                  </Typography>
                  {idx === 0 ? (
                    <EmojiEventsIcon
                      style={{ fontSize: 35, color: "#dea357" }}
                    />
                  ) : null}
                  {idx === 1 ? (
                    <WorkspacePremiumIcon
                      style={{ fontSize: 35, color: "#b3b3b3" }}
                    />
                  ) : null}
                  {idx === 2 ? (
                    <WorkspacePremiumIcon
                      style={{ fontSize: 35, color: "#9c641c" }}
                    />
                  ) : null}
                  <div className="Spacer" />
                  <Typography
                    variant="body1"
                    style={{ fontSize: 30, marginRight: 10 }}
                  >
                    {gameState.scores[user.socketId]}
                  </Typography>
                </div>
                {idx !== gameState.users.length - 1 ? <hr /> : null}
              </div>
            );
          })}
      </div>
      {isHost ? (
        <Button
          variant="contained"
          style={{ marginTop: 30 }}
          onClick={nextRound}
        >
          {gameState.currentRound.toString() === gameState.rounds
            ? "Finish"
            : "Continue"}
        </Button>
      ) : null}
      <Modal open={showWinner} onClose={() => setShowWinner(false)}>
        <div
          className="VStack"
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: "#e0e0e0",
            boxShadow: 24,
            padding: 15,
            borderRadius: 10,
          }}
        >
          <Typography variant="h4">Winner winner chicken dinner!</Typography>
          <img
            src={ChickenImage}
            alt="Chicken Image"
            style={{ height: "auto", maxWidth: "30vw" }}
          />
        </div>
      </Modal>
    </div>
  );
}

export default LeaderBoard;
