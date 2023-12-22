import React, { useContext, useState } from "react";
import {
  TextField,
  Typography,
  Button,
  Modal,
  RadioGroup,
  FormControlLabel,
  Radio,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import Socket from "../logic/Socket";
import GameContext from "../logic/GameContext";

function Welcome() {
  const navigate = useNavigate();

  const [gameState, setGameState] = useContext(GameContext);

  const [username, setUsername] = useState("");
  const [gameCode, setGameCode] = useState("");
  const [showCreateGame, setShowCreateGame] = useState(false);

  const validateUsername = () => {
    if (username.includes(" ")) return true;
    return false;
  };

  const joinClick = () => {
    setGameState((prevState) => ({
      ...prevState,
      username,
    }));
    fetch(`${Socket.baseURL}/lobbyId/${gameCode}`)
      .then((res) => res.json())
      .then(({ gameId }) => {
        navigate(`/lobby/${gameId}?code=${gameCode}`);
      });
  };

  const startGameClick = () => {
    setShowCreateGame(true);
  };

  return (
    <div className="VStack" style={{ padding: 25, flex: 1 }}>
      <Typography variant="h2" style={{ marginBottom: 50 }}>
        Scattergories
      </Typography>
      <TextField
        label="Username"
        required
        style={{ marginBottom: 25, width: "30vw", minWidth: "200px" }}
        value={username}
        onChange={(e) => {
          setUsername(e.target.value);
        }}
        error={validateUsername()}
        helperText={validateUsername() ? "Invalid Username" : ""}
      />
      <TextField
        label="Game Code"
        required
        style={{ marginBottom: 25, width: "30vw", minWidth: "200px" }}
        value={gameCode}
        onChange={(e) => {
          setGameCode(e.target.value);
        }}
      />
      <Button
        variant="contained"
        style={{ width: "25vw", height: "40px" }}
        onClick={joinClick}
        disabled={username === "" || validateUsername() || gameCode === ""}
      >
        Join
      </Button>
      <Typography variant="body1" style={{ margin: "10px 0" }}>
        Or
      </Typography>
      <Button variant="outlined" onClick={startGameClick}>
        Start a game
      </Button>
      <Modal open={showCreateGame} onClose={() => setShowCreateGame(false)}>
        <div>
          <CreateGameModal setShowCreateGame={setShowCreateGame} />
        </div>
      </Modal>
    </div>
  );
}

function CreateGameModal(props) {
  const [gameState, setGameState] = useContext(GameContext);

  const [username, setUsername] = useState("");
  const [rounds, setRounds] = useState(12);
  const [time, setTime] = useState(180);

  const navigate = useNavigate();

  const createGame = () => {
    Socket.instance.socket.emit("CreateGame", username, rounds, time);
    Socket.instance.socket.on("GameCreated", (user, game) => {
      if (user === Socket.instance.socket.id) {
        setGameState((prevState) => ({
          ...prevState,
          ...game,
        }));
        navigate(`/lobby/${game.id}?code=${game.code}`);
      }
    });
  };

  return (
    <div
      className="VStack"
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: "60vw",
        minWidth: 300,
        minHeight: 500,
        backgroundColor: "#e0e0e0",
        border: "2px solid #5c5c5c",
        borderRadius: "20px",
        boxShadow: 24,
      }}
    >
      <Typography variant="h4">Create a Game</Typography>
      <TextField
        label="Username"
        required
        style={{ margin: "25px 0", width: "25vw", minWidth: 150 }}
        value={username}
        onChange={(e) => {
          setUsername(e.target.value);
        }}
        error={username.includes(" ")}
        helperText={username.includes(" ") ? "Invalid Username" : ""}
      />
      <Typography variant="caption">Number of Rounds</Typography>
      <RadioGroup
        row
        name="radio-rounds"
        value={rounds}
        onChange={(e) => {
          setRounds(e.target.value);
        }}
      >
        <FormControlLabel value={6} control={<Radio />} label="6" />
        <FormControlLabel value={12} control={<Radio />} label="12" />
        <FormControlLabel value={18} control={<Radio />} label="18" />
      </RadioGroup>
      <Typography variant="caption" style={{ marginTop: "20px" }}>
        Time
      </Typography>
      <RadioGroup
        row
        name="radio-time"
        value={time}
        onChange={(e) => {
          setTime(e.target.value);
        }}
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
        }}
      >
        <FormControlLabel value={60} control={<Radio />} label="1 Minute" />
        <FormControlLabel value={120} control={<Radio />} label="2 Minutes" />
        <FormControlLabel value={180} control={<Radio />} label="3 Minutes" />
      </RadioGroup>
      <Button
        variant="contained"
        style={{ marginTop: "30px" }}
        disabled={username === "" || username.includes(" ")}
        onClick={createGame}
      >
        Create
      </Button>
    </div>
  );
}

export default Welcome;
