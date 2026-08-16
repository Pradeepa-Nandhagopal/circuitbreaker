import "./App.css";
import { useCallback, useEffect, useState } from "react";
import {
    disableLatency,
    getCircuitBreakerStatus,
    getInventoryHealth,
    getLatencyStatus,
    getProductHealth,
    getProducts,
    getRecommendationHealth,
    triggerLatency,
} from "./services/api";

const initialCircuit = {
    name: "recommendationCircuitBreaker",
    state: "UNKNOWN",
    failureRate: -1,
    bufferedCalls: 0,
    failedCalls: 0,
};

function App() {
    const [data, setData] = useState(null);
    const [circuit, setCircuit] = useState(initialCircuit);
    const [services, setServices] = useState({
        product: "UNKNOWN",
        inventory: "UNKNOWN",
        recommendation: "UNKNOWN",
    });
    const [latencyEnabled, setLatencyEnabled] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const loadCircuitStatus = useCallback(async () => {
        try {
            const response = await getCircuitBreakerStatus();
            setCircuit(response.data);
        } catch (error) {
            console.error("Circuit breaker status error:", error);
            setCircuit((current) => ({ ...current, state: "UNKNOWN" }));
        }
    }, []);

    const loadLatencyStatus = useCallback(async () => {
        try {
            const response = await getLatencyStatus();
            const value = response.data;
            setLatencyEnabled(
                value === true ||
                value === "true" ||
                value?.enabled === true ||
                value?.latencyEnabled === true
            );
        } catch (error) {
            console.error("Latency status error:", error);
        }
    }, []);

    const loadServiceHealth = useCallback(async () => {
        const readHealth = async (request) => {
            try {
                const response = await request();
                return response.data?.status === "UP" ? "UP" : "DOWN";
            } catch {
                return "DOWN";
            }
        };

        const [product, inventory, recommendation] = await Promise.all([
            readHealth(getProductHealth),
            readHealth(getInventoryHealth),
            readHealth(getRecommendationHealth),
        ]);

        setServices({ product, inventory, recommendation });
    }, []);

    const refreshDashboard = useCallback(async () => {
        await Promise.all([
            loadCircuitStatus(),
            loadLatencyStatus(),
            loadServiceHealth(),
        ]);
    }, [loadCircuitStatus, loadLatencyStatus, loadServiceHealth]);

    useEffect(() => {
        refreshDashboard();
        const timer = setInterval(refreshDashboard, 2000);
        return () => clearInterval(timer);
    }, [refreshDashboard]);

    const loadProducts = async () => {
        try {
            const response = await getProducts();
            setData(response.data);
            setMessage("Product data loaded successfully.");
            await refreshDashboard();
        } catch (error) {
            console.error(error);
            setMessage("Unable to load product data. Check the Gateway and services.");
            await refreshDashboard();
        }
    };

    const enableLatency = async () => {
        setLoading(true);
        setMessage("");
        try {
            const response = await triggerLatency();
            setLatencyEnabled(true);
            setMessage(response.data || "Latency simulation enabled.");
            await refreshDashboard();
        } catch (error) {
            console.error(error);
            setMessage("Unable to trigger latency. Make sure Recommendation Service is running.");
        } finally {
            setLoading(false);
        }
    };

    const disableLatencySimulation = async () => {
        setLoading(true);
        setMessage("");
        try {
            const response = await disableLatency();
            setLatencyEnabled(false);
            setMessage(response.data || "Latency simulation disabled.");
            await refreshDashboard();
        } catch (error) {
            console.error(error);
            setMessage("Unable to disable latency.");
        } finally {
            setLoading(false);
        }
    };

    const state = circuit.state;
    const stateClass =
        state === "OPEN"
            ? "state-open"
            : state === "HALF_OPEN" || state === "HALF-OPEN"
                ? "state-half"
                : state === "CLOSED"
                    ? "state-closed"
                    : "state-unknown";

    const stateLabel =
        state === "OPEN"
            ? "OPEN"
            : state === "HALF_OPEN" || state === "HALF-OPEN"
                ? "HALF-OPEN"
                : state === "CLOSED"
                    ? "CLOSED"
                    : "UNKNOWN";

    const statusClass = (value) =>
        value === "UP" ? "service-up" : value === "DOWN" ? "service-down" : "service-unknown";

    return (
        <div className="app-shell">
            <header className="hero">
                <div>
                    <span className="eyebrow">CLOUD-NATIVE E-COMMERCE</span>
                    <h1>Resilience Control Center</h1>
                    <p>
                        Monitor services and demonstrate Circuit Breaker, Rate Limiting,
                        Retry, Timeout and fallback behavior in real time.
                    </p>
                </div>
                <div className="live-badge">
                    <span className="pulse-dot" />
                    LIVE MONITORING
                </div>
            </header>

            <main>
                <section className="service-grid">
                    <ServiceCard title="Product Service" status={services.product} />
                    <ServiceCard title="Inventory Service" status={services.inventory} />
                    <ServiceCard title="Recommendation Service" status={services.recommendation} />
                </section>

                <section className={`circuit-panel ${stateClass}`}>
                    <div className="panel-heading">
                        <div>
                            <span className="section-label">RESILIENCE4J</span>
                            <h2>Recommendation Circuit Breaker</h2>
                            <p>{circuit.name}</p>
                        </div>
                        <div className={`circuit-state ${stateClass}`}>
                            <span>{state === "OPEN" ? "🔴" : stateLabel === "HALF-OPEN" ? "🟡" : state === "CLOSED" ? "🟢" : "⚪"}</span>
                            {stateLabel}
                        </div>
                    </div>

                    <div className="metrics-grid">
                        <Metric label="Failure Rate" value={circuit.failureRate >= 0 ? `${Number(circuit.failureRate).toFixed(1)}%` : "—"} />
                        <Metric label="Failed Calls" value={circuit.failedCalls ?? 0} />
                        <Metric label="Buffered Calls" value={circuit.bufferedCalls ?? 0} />
                        <Metric label="Latency Simulation" value={latencyEnabled ? "ENABLED" : "OFF"} />
                    </div>
                </section>

                <section className="control-panel">
                    <div>
                        <span className="section-label">CHAOS SIMULATION</span>
                        <h2>Test resilience safely</h2>
                        <p>
                            Deliberately slow the Recommendation Service and observe the
                            Gateway timeout, retries, Circuit Breaker and cached fallback.
                        </p>
                    </div>

                    <div className="controls">
                        <button className="btn danger" onClick={enableLatency} disabled={loading || latencyEnabled}>
                            🔥 Trigger Latency
                        </button>
                        <button className="btn secondary" onClick={disableLatencySimulation} disabled={loading || !latencyEnabled}>
                            🔄 Reset Latency
                        </button>
                        <button className="btn primary" onClick={loadProducts} disabled={loading}>
                            ▶ Test Gateway
                        </button>
                    </div>

                    {message && <div className="message">{message}</div>}
                </section>

                {data && (
                    <section className="data-panel">
                        <div className="panel-heading compact">
                            <div>
                                <span className="section-label">LIVE DATA</span>
                                <h2>Products & Recommendations</h2>
                            </div>
                        </div>

                        <div className="product-grid">
                            {(data.products || []).map((product) => (
                                <div className="product-card" key={product}>
                                    <h3>{product}</h3>
                                    <p>
                                        Inventory:{" "}
                                        <strong>
                                            {typeof data.inventory === "object"
                                                ? data.inventory?.[product]
                                                : data.inventory}
                                        </strong>
                                    </p>
                                </div>
                            ))}
                        </div>

                        <div className="recommendations">
                            <h3>Recommendations</h3>
                            {Array.isArray(data.recommendations) ? (
                                <ul>
                                    {data.recommendations.map((item, index) => (
                                        <li key={index}>{item}</li>
                                    ))}
                                </ul>
                            ) : (
                                <p>{data.recommendations}</p>
                            )}
                        </div>
                    </section>
                )}
            </main>

            <footer>
                Spring Cloud Gateway · Eureka · Resilience4j · Redis · Zipkin
            </footer>
        </div>
    );
}

function ServiceCard({ title, status }) {
    return (
        <div className="service-card">
            <div className={`service-icon ${statusClass(status)}`}>
                {status === "UP" ? "✓" : status === "DOWN" ? "!" : "?"}
            </div>
            <div>
                <span className="service-label">SERVICE</span>
                <h3>{title}</h3>
                <span className={`service-status ${statusClass(status)}`}>
                    {status === "UP" ? "● UP" : status === "DOWN" ? "● DOWN" : "● UNKNOWN"}
                </span>
            </div>
        </div>
    );
}

function statusClass(status) {
    return status === "UP" ? "service-up" : status === "DOWN" ? "service-down" : "service-unknown";
}

function Metric({ label, value }) {
    return (
        <div className="metric">
            <span>{label}</span>
            <strong>{value}</strong>
        </div>
    );
}

export default App;
