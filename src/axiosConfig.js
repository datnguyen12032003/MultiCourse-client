// src/axiosConfig.js
import axios from "axios";
const instance = axios.create({
  baseURL: "https://multicourse.onrender.com/", //backend

  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

export default instance;
