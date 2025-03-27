import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https://lostandfound-backend-loxq.onrender.com/api",
  headers: { "Content-Type": "application/json" },
});


axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem("refresh_token");

      if (refreshToken) {
        try {
          const response = await axios.post(
            "https://lostandfound-backend-loxq.onrender.com/api/auth/refresh/",
            { refresh: refreshToken }
          );

          if (response.status === 200) {
            localStorage.setItem("access_token", response.data.access);
            originalRequest.headers["Authorization"] = `Bearer ${response.data.access}`;
            return axiosInstance(originalRequest);
          }
        } catch (refreshError) {
          console.error("Token refresh failed. Logging out...");
          logoutUser(); 
        }
      }
    }
    return Promise.reject(error);
  }
);

const logoutUser = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  window.location.href = "/login"; 
};

export default axiosInstance;
