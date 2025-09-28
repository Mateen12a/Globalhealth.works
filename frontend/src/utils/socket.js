// src/utils/socket.js
import { io } from "socket.io-client";

const API_URL = import.meta.env.VITE_API_URL; // backend URL
export const socket = io(API_URL, {
  autoConnect: false,
});
