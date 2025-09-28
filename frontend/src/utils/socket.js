// src/utils/socket.js
import { io } from "socket.io-client";

const URL = "http://localhost:5000"; // backend URL
export const socket = io(URL, {
  autoConnect: false,
});
