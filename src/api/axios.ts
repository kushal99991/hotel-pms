import { ResponsePayload } from "types/apiTypes";
import { appConfig } from "config/app.config";
import axios, { AxiosResponse } from "axios";
import Cookies from "js-cookie";
import { logFrontendError } from "utils/errorLogger";

const apiClient = axios.create({
  baseURL: appConfig.baseUrl, // Make sure to set this in your .env file
  timeout: 10000,
});

apiClient.interceptors.request.use(
  (config) => {
    // Add any request interceptors here (e.g., adding auth tokens)
    const token = Cookies.get(appConfig.tokenName);
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response: AxiosResponse<ResponsePayload>) => {
    return response;
  },
  async (error) => {
    // Handle errors globally here
    const publicUrl = ["/auth/login"];
    if (
      error.response?.status === 401 &&
      !publicUrl.includes(error.response?.config?.url)
    ) {
      localStorage.clear();
      Cookies.remove(appConfig.tokenName);
      setTimeout(() => {
        window.location.href = "/login";
      }, 1000);
    }
    await logFrontendError(
      error.message,
      {
        url: `${error?.config?.baseURL}${error?.config?.url}`,
        method: error?.config?.method,
        status: error?.response?.status,
        params: error?.request?.params,
        data: error?.request?.data,
        additional: error?.request?.responseText || "",
      },
      "API_ERROR"
    );
    return Promise.reject(error);
  }
);

export const getHeaders = () => {
  return {
    "Content-Type": "application/json",
    accept: "*/*",
    "X-Tenant-ID": Cookies.get(appConfig.domainName) || "",
    Authorization: `Bearer ${Cookies.get(appConfig.tokenName)}`,
  };
};

export default apiClient;
