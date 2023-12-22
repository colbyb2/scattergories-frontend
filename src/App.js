import "./App.css";
import Welcome from "./screens/Welcome";
import Lobby from "./screens/Lobby";
import GameScreen from "./screens/GameScreen";
import { Routes, Route } from "react-router-dom";
import Socket from "./logic/Socket";
import { useState } from "react";
import GameContext from "./logic/GameContext";

function App() {
  const [gameState, setGameState] = useState({});

  Socket.instance.socket.on("connect", () => {
    const sid = sessionStorage.getItem("sid");
    setTimeout(() => {
      Socket.instance.socket.emit("Connected", sid);
      sessionStorage.setItem("sid", Socket.instance.socket.id);
      setGameState({ connected: true });
    }, 350);
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
      </GameContext.Provider>
    </div>
  );
}

export default App;
