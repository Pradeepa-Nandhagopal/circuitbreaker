import axios from "axios";

const API = axios.create({
    baseURL: "http://localhost:8080",
    timeout: 5000,
});

export const getProducts = () => API.get("/products");

export const triggerLatency = () =>
    API.post("/recommendations/trigger-latency");

export const disableLatency = () =>
    API.post("/recommendations/disable-latency");

export const getLatencyStatus = () =>
    API.get("/recommendations/latency-status");

export const getCircuitBreakerStatus = () =>
    API.get("/api/circuit-breaker/status");

export const getProductHealth = () =>
    axios.get("http://localhost:8081/actuator/health", { timeout: 3000 });

export const getInventoryHealth = () =>
    axios.get("http://localhost:8082/actuator/health", { timeout: 3000 });

export const getRecommendationHealth = () =>
    axios.get("http://localhost:8083/actuator/health", { timeout: 3000 });
