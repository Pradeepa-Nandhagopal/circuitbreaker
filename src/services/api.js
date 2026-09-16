import axios from "axios";

const API = axios.create({
    baseURL: "",
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
    API.get("/actuator/product/health", { timeout: 3000 });

export const getInventoryHealth = () =>
    API.get("/actuator/inventory/health", { timeout: 3000 });

export const getRecommendationHealth = () =>
    API.get("/actuator/recommendation/health", { timeout: 3000 });

