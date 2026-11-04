import axios from "axios";

const API = axios.create({
    baseURL: "http://localhost:8080",
    headers: {
        "Content-Type": "application/json"
    }
});

export const getDashboard = () => API.get("/products");

export const triggerLatency = () =>
    API.post("/recommendations/trigger-latency");