import "./App.css";
import { useEffect, useState } from "react";
import {
    getProducts,
    triggerLatency,
    getHealth,
} from "./services/api";

function App() {

    const [data, setData] = useState(null);

    const [cbState, setCbState] = useState("UNKNOWN");
    const [productStatus, setProductStatus] = useState("DOWN");
    const [inventoryStatus, setInventoryStatus] = useState("UNKNOWN");
    const [recommendationStatus, setRecommendationStatus] = useState("UNKNOWN");

    const loadHealth = async () => {

        try {

            const res = await getHealth();

            const health = res.data;

            setProductStatus(health.status);

            const cb =
                health.components.circuitBreakers.details
                    .inventoryCircuitBreaker.details.state;

            setCbState(cb);

        } catch (e) {
            console.log(e);
        }
    };

    useEffect(() => {

        loadHealth();

        const timer = setInterval(loadHealth, 2000);

        return () => clearInterval(timer);

    }, []);

    const loadProducts = async () => {

        try {

            const response = await getProducts();

            setData(response.data);

            // Inventory Status
            if (typeof response.data.inventory === "string") {
                setInventoryStatus("DOWN");
            } else {
                setInventoryStatus("UP");
            }

            // Recommendation Status
            if (
                typeof response.data.recommendations === "string"
            ) {
                setRecommendationStatus("DOWN");
            } else {
                setRecommendationStatus("UP");
            }

            loadHealth();

        } catch (error) {

            console.log(error);

            setInventoryStatus("DOWN");
            setRecommendationStatus("DOWN");

            loadHealth();
        }
    };



    const enableLatency = async () => {

        try {

            const response = await triggerLatency();

            alert(response.data);

        } catch {

            alert("Unable to trigger latency");

        }

    };

    return (

        <div className="container">

            <h1>🚀 Spring Cloud Resilience Dashboard</h1>

            <div className="status-container">

                <div className="card">
                    <h2>Circuit Breaker</h2>

                    <p
                        className={
                            cbState === "OPEN"
                                ? "red"
                                : cbState === "HALF_OPEN"
                                    ? "orange"
                                    : "green"
                        }
                    >
                        {cbState === "OPEN"
                            ? "🔴 OPEN"
                            : cbState === "HALF_OPEN"
                                ? "🟡 HALF_OPEN"
                                : "🟢 CLOSED"}
                    </p>
                </div>

                <div className="card">
                    <h2>Product Service</h2>

                    <p
                        className={
                            productStatus === "UP"
                                ? "green"
                                : "red"
                        }
                    >
                        {productStatus === "UP"
                            ? "🟢 UP"
                            : "🔴 DOWN"}
                    </p>
                </div>

                <div className="card">
                    <h2>Inventory Service</h2>

                    <p
                        className={
                            inventoryStatus === "UP"
                                ? "green"
                                : "red"
                        }
                    >
                        {inventoryStatus === "UP"
                            ? "🟢 UP"
                            : "🔴 DOWN"}
                    </p>
                </div>

                <div className="card">
                    <h2>Recommendation Service</h2>

                    <p
                        className={
                            recommendationStatus === "UP"
                                ? "green"
                                : "red"
                        }
                    >
                        {recommendationStatus === "UP"
                            ? "🟢 UP"
                            : "🔴 DOWN"}
                    </p>
                </div>

            </div>

            <div className="buttons">

                <button onClick={loadProducts}>
                    Get Products
                </button>

                <button onClick={enableLatency}>
                    Trigger Latency
                </button>

            </div>

            {data && (

                <div className="products">

                    <h2>Products</h2>

                    {data.products.map((product) => (

                        <div
                            className="product-card"
                            key={product}
                        >

                            <h3>{product}</h3>

                            <p>
                                Inventory :
                                {
                                    typeof data.inventory === "object"
                                        ? data.inventory[product]
                                        : data.inventory
                                }
                            </p>

                        </div>

                    ))}

                    <h2>Recommendations</h2>

                    {Array.isArray(data.recommendations) ? (

                        <ul>

                            {data.recommendations.map(
                                (item, index) => (
                                    <li key={index}>
                                        {item}
                                    </li>
                                )
                            )}

                        </ul>

                    ) : (

                        <p>{data.recommendations}</p>

                    )}

                </div>

            )}

        </div>

    );
}

export default App;