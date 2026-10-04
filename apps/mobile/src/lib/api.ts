import axios from "axios";

import { APP_CONFIG } from "@/src/config/app.config";
import { serverConfigService } from "@/src/services/server-config.service";

export const api = axios.create({
  timeout: APP_CONFIG.api.timeout,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

api.interceptors.request.use(async (config) => {
  const serverUrl = await serverConfigService.getApiUrl();

  config.baseURL = `${serverUrl}${APP_CONFIG.api.prefix}`;

  return config;
});