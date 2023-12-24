import "./App.css";
import Welcome from "./screens/Welcome";
import Lobby from "./screens/Lobby";
import GameScreen from "./screens/GameScreen";
import { Routes, Route } from "react-router-dom";
import Socket from "./logic/Socket";
import { useEffect, useState } from "react";
import GameContext from "./logic/GameContext";
import { Snackbar } from "@mui/material";
import MuiAlert from "@mui/material/Alert";

function App() {
  const [gameState, setGameState] = useState({});
  const [connectionLost, setConnectionLost] = useState(false);

  Socket.instance.socket.on("connect", () => {
    setConnectionLost(false);
    const sid = localStorage.getItem("sid");
    setTimeout(() => {
      Socket.instance.socket.emit("Connected", sid);
      localStorage.setItem("sid", Socket.instance.socket.id);
    }, 350);
  });

  Socket.instance.socket.on("disconnect", () => {
    setGameState({ connected: false });
    setConnectionLost(true);
  });

  Socket.instance.socket.on("UserPacket", (game) => {
    setGameState(Object.assign({}, { connected: true }, game));
  });

  return (
    <div
      className="App"
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
      }}
    >
      <GameContext.Provider value={[gameState, setGameState]}>
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/lobby/:lobbyId" element={<Lobby />} />
          <Route path="/game/:lobbyId" element={<GameScreen />} />
        </Routes>
        <Snackbar
          open={connectionLost}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <MuiAlert variant="filled" severity="error">
            Connection Lost.
          </MuiAlert>
        </Snackbar>
      </GameContext.Provider>
    </div>
  );
}

export default App;
