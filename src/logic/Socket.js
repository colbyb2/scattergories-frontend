import { io } from "socket.io-client";

class Socket {
  static instance = new Socket();
  static baseURL = "http://localhost:3001";

  constructor() {
    this.socket = io("http://localhost:3001");
  }
}

export default Socket;
