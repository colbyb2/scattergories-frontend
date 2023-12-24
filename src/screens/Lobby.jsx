import React, { useContext, useEffect } from "react";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Typography,
  Button,
  Snackbar,
  SnackbarContent,
  Modal,
  TextField,
} from "@mui/material";
import AccountBoxIcon from "@mui/icons-material/AccountBox";
import PersonRemoveIcon from "@mui/icons-material/PersonRemove";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import GameContext from "../logic/GameContext";
import Socket from "../logic/Socket";

function Lobby() {
  const navigate = useNavigate();

  const [gameState, setGameState] = useContext(GameContext);

  const [showCopyNotification, setShowCopyNotification] = useState(false);
  const [isGameCreator, setIsGameCreator] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [showUsernameModal, setShowUsernameModal] = useState(false);

  const location = useLocation();
  const gameCode = new URLSearchParams(location.search).get("code");

  useEffect(() => {
    if (gameState.connected && gameState.code === undefined) {
      pageLoaded();
    } else if (gameState.code) {
      setJoinHandler();
    }
  }, [gameState.connected]);

  const pageLoaded = () => {
    if (!gameState.username) setShowUsernameModal(true);
    else joinLobby();
  };

  const joinLobby = () => {
    Socket.instance.socket.emit("JoinGame", gameCode, gameState.username);
    setJoinHandler();
  };

  const setJoinHandler = () => {
    //New User Joined Game
    Socket.instance.socket.on("UserJoined", (game) => {
      if (game.code === gameCode) {
        setGameState((prevState) => ({
          ...prevState,
          ...game,
        }));
      }
    });
    //A user has left game
    Socket.instance.socket.on("UserLeft", (leftSocketId, game) => {
      if (game.code === gameCode) {
        setGameState((prevState) => Object.assign({}, prevState, game));
        if (Socket.instance.socket.id === leftSocketId) {
          setGameState((prevState) =>
            Object.assign({}, prevState, { code: undefined })
          );
          navigate("/");
        }
      }
    });
    //Some update to game state
    Socket.instance.socket.on("GameStateUpdated", (game) => {
      if (game.code === gameCode) {
        setGameState((prevState) => Object.assign({}, prevState, game));
      }
    });
    //Game Starting
    Socket.instance.socket.on("GameStarted", (game) => {
      if (game.code === gameCode) {
        navigate(`/game/${game.id}`);
      }
    });
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    setShowCopyNotification(true);
  };

  const startGame = () => {
    Socket.instance.socket.emit("StartGame");
  };

  const setReady = () => {
    setIsReady(!isReady);
    Socket.instance.socket.emit("ToggleReady");
  };

  const removeUser = (socketId) => {
    Socket.instance.socket.emit("KickUser", socketId);
  };

  useEffect(() => {
    if (gameState.code) {
      setIsGameCreator(gameState.host.socketId === Socket.instance.socket.id);
    }
  }, [gameState]);

  //Loading View
  if (gameState.code === null || gameState.code === undefined) {
    return (
      <div className="VStack">
        <div>Loading</div>
        <Modal open={showUsernameModal}>
          <div>
            <UsernameModal
              gameState={gameState}
              setShowUsernameModal={setShowUsernameModal}
              joinLobby={joinLobby}
            />
          </div>
        </Modal>
      </div>
    );
  }

  return (
    <div className="VStack">
      <Typography
        variant="h3"
        sx={{ fontWeight: "bold", marginTop: "10vh", marginBottom: "20px" }}
      >
        {`${gameState.host.username}'s Lobby`}
      </Typography>
      <Typography variant="h5">{`Code: ${gameState.code}`}</Typography>
      <div
        className="VStack"
        style={{
          width: "45vw",
          minWidth: "300px",
          maxWidth: "600px",
          padding: "5px",
          border: "0.5px solid gray",
          borderRadius: "5px",
          marginTop: "25px",
        }}
      >
        {gameState.users.map((user) => (
          <User
            key={user.socketId}
            user={user}
            isGameCreator={isGameCreator}
            removeUser={removeUser}
          />
        ))}
      </div>
      <Button
        variant="contained"
        style={{ marginTop: "20px" }}
        onClick={copyToClipboard}
      >
        Share
      </Button>
      {isGameCreator ? (
        <Button
          variant="contained"
          style={{ marginTop: "30px", backgroundColor: "green" }}
          onClick={startGame}
        >
          Start Game
        </Button>
      ) : (
        <Button
          variant="contained"
          style={{
            marginTop: "30px",
            backgroundColor: isReady ? "red" : "green",
            minWidth: "150px",
          }}
          onClick={setReady}
        >
          {isReady ? "Unready" : "Ready"}
        </Button>
      )}
      <Snackbar
        open={showCopyNotification}
        message="Copied to Clipboard"
        autoHideDuration={3000}
        onClose={() => {
          setShowCopyNotification(false);
        }}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />
    </div>
  );
}

function User(props) {
  const [showRemoveNotification, setShowRemoveNotification] = useState(false);

  return (
    <div className="HStack" style={{ padding: "10px 0", width: "100%" }}>
      <AccountBoxIcon sx={{ fontSize: "50px" }} />
      <Typography variant="h6">{props.user.username}</Typography>
      {props.user.isReady ? (
        <CheckCircleIcon style={{ color: "green", paddingLeft: 10 }} />
      ) : null}
      <div className="Spacer"></div>
      {props.isGameCreator &&
      props.user.socketId !== Socket.instance.socket.id ? (
        <Button
          variant="outlined"
          color="error"
          style={{ height: "70%" }}
          onClick={() => {
            setShowRemoveNotification(true);
            props.removeUser(props.user.socketId);
          }}
        >
          <PersonRemoveIcon />
        </Button>
      ) : null}
      <Snackbar
        open={showRemoveNotification}
        autoHideDuration={3000}
        onClose={() => {
          setShowRemoveNotification(false);
        }}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <SnackbarContent
          message="Removed Player."
          style={{ backgroundColor: "darkred" }}
        />
      </Snackbar>
    </div>
  );
}

function UsernameModal({ gameState, setShowUsernameModal, joinLobby }) {
  const [username, setUsername] = useState("");

  return (
    <div
      className="VStack"
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        minWidth: 200,
        minHeight: 100,
        padding: 20,
        backgroundColor: "#e0e0e0",
        border: "2px solid #5c5c5c",
        borderRadius: "20px",
        boxShadow: 24,
      }}
    >
      <Typography variant="h6">Set Username</Typography>
      <TextField
        label="Username"
        style={{ margin: "25px 0", width: "25vw" }}
        value={username}
        onChange={(e) => {
          setUsername(e.target.value);
        }}
        error={username.includes(" ")}
        helperText={username.includes(" ") ? "Invalid Username" : ""}
      />
      <Button
        variant="contained"
        style={{ marginTop: "15px" }}
        disabled={username === "" || username.includes(" ")}
        onClick={() => {
          gameState.username = username;
          setShowUsernameModal(false);
          joinLobby();
        }}
      >
        Join
      </Button>
    </div>
  );
}

export default Lobby;
