import axios from "axios";
import { useAuth } from "./AuthContext";

const useAxios = () => {
  const { token, logout } = useAuth();

  const instance = axios.create({
    baseURL: "http://ec2-43-205-233-195.ap-south-1.compute.amazonaws.com:8080", // change to your Spring Boot backend URL
  });

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
