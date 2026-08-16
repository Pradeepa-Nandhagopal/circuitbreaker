import axios from "axios";

const API = axios.create({
    baseURL: "http://localhost:8080"
});

export const getProducts = () => API.get("/products");

export const triggerLatency = () =>
    API.post("/recommendations/trigger-latency");

export const getHealth = () =>
    axios.get("http://localhost:8081/actuator/health");