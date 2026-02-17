import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  withCredentials: true
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  const csrfToken = localStorage.getItem("csrfToken");
  if (csrfToken) {
    config.headers["X-CSRF-Token"] = csrfToken;
  }
  return config;
});

export const fetchCsrfToken = async () => {
  const res = await axios.get("/api/csrf-token", { withCredentials: true });
  localStorage.setItem("csrfToken", res.data.csrfToken);
};

export default api;


