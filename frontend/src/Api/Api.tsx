import axios from "axios";

// In development, React runs on 3000, backend on 5000
const API = axios.create({
  baseURL:"http://localhost:8000/api",
});

export default API;
