import { io } from "socket.io-client";

//Testing: http://localhost:3001
//Prod: https://scattergories-backend.onrender.com

class Socket {
  static instance = new Socket();
  static baseURL = "https://scattergories-backend.onrender.com";

  constructor() {
    this.socket = io("http://localhost:3001");
  }
}

export default Socket;
