import axios from "axios";
import { useAuth } from "./AuthContext";

const useAxios = () => {
  const { token, logout } = useAuth();

  const instance = axios.create({
    baseURL: "https://backend.codewithsathya.info", // change to your Spring Boot backend URL
  });
  console.log(token)

  // Attach JWT in headers
  instance.interceptors.request.use((config) => {
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // Handle expired/invalid token
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response && error.response.status === 401) {
        logout();
      }
      return Promise.reject(error);
    }
  );

  return instance;
};

export default useAxios;
