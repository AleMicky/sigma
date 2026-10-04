import axios from "axios";

import { API_CONFIG } from "@/config/api.config";

export const api = axios.create({
  baseURL: API_CONFIG.API_URL,
  timeout: API_CONFIG.TIMEOUT,

  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});