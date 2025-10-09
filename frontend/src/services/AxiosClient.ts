import axios from "axios";
import useSettingStore from "@/stores/setting-store";

const appAxios = axios.create();

appAxios.interceptors.request.use((config) => {
  const { backendUrl, accessToken } = useSettingStore.getState();

  config.baseURL = backendUrl;

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

export default appAxios;
