import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // In-memory Redis mock initialized like RedisCacheInitializer.java
  const redisStore = new Map<string, string>();
  redisStore.set(
    "top-sellers",
    "Top Seller - Laptop|Top Seller - Smartphone|Top Seller - Wireless Mouse"
  );

  function getFallbackRecommendations(): string[] {
    const cachedData = redisStore.get("top-sellers");
    if (cachedData && cachedData.trim()) {
      return cachedData.split("|");
    }
    return [
      "Top Seller - Laptop",
      "Top Seller - Smartphone",
      "Top Seller - Wireless Mouse",
    ];
  }

  // Latency simulation flag
  let latencyEnabled = false;

  // Resilience4j Circuit Breaker Simulation
  // Config: slidingWindowSize = 5, minCalls = 5, failureRateThreshold = 50%, waitDurationInOpenState = 10s
  const SLIDING_WINDOW_SIZE = 5;
  const MINIMUM_CALLS = 5;
  const FAILURE_RATE_THRESHOLD = 50; // percent
  const WAIT_DURATION_OPEN_MS = 10000; // 10s

  type CircuitState = "CLOSED" | "OPEN" | "HALF_OPEN";
  let circuitState: CircuitState = "CLOSED";
  let openStateTimestamp = 0;
  let callWindow: boolean[] = []; // true = success, false = failure

  function checkStateTransition() {
    if (circuitState === "OPEN") {
      const elapsed = Date.now() - openStateTimestamp;
      if (elapsed >= WAIT_DURATION_OPEN_MS) {
        circuitState = "HALF_OPEN";
      }
    }
  }

  function recordCall(success: boolean) {
    checkStateTransition();

    if (circuitState === "HALF_OPEN") {
      if (success) {
        circuitState = "CLOSED";
        callWindow = [true];
      } else {
        circuitState = "OPEN";
        openStateTimestamp = Date.now();
        callWindow.push(false);
        if (callWindow.length > SLIDING_WINDOW_SIZE) {
          callWindow.shift();
        }
      }
      return;
    }

    callWindow.push(success);
    if (callWindow.length > SLIDING_WINDOW_SIZE) {
      callWindow.shift();
    }

    if (callWindow.length >= MINIMUM_CALLS) {
      const failedCalls = callWindow.filter((res) => !res).length;
      const rate = (failedCalls / callWindow.length) * 100;
      if (rate >= FAILURE_RATE_THRESHOLD) {
        circuitState = "OPEN";
        openStateTimestamp = Date.now();
      }
    }
  }

  function getCircuitBreakerMetrics() {
    checkStateTransition();
    const failedCalls = callWindow.filter((res) => !res).length;
    const failureRate =
      callWindow.length > 0 ? (failedCalls / callWindow.length) * 100 : -1;

    return {
      name: "recommendationCircuitBreaker",
      state: circuitState,
      failureRate: failureRate >= 0 ? failureRate : -1,
      bufferedCalls: callWindow.length,
      failedCalls: failedCalls,
    };
  }

  // --- API Endpoints ---

  // Circuit Breaker Status
  app.get("/api/circuit-breaker/status", (req, res) => {
    res.json(getCircuitBreakerMetrics());
  });

  // Latency Status
  app.get("/recommendations/latency-status", (req, res) => {
    res.json({
      enabled: latencyEnabled,
      latencyEnabled: latencyEnabled,
      status: latencyEnabled ? "Latency Enabled" : "Latency Disabled",
    });
  });

  // Trigger Latency
  app.post("/recommendations/trigger-latency", (req, res) => {
    latencyEnabled = true;
    res.send("Latency Enabled Successfully");
  });

  // Disable Latency
  app.post("/recommendations/disable-latency", (req, res) => {
    latencyEnabled = false;
    res.send("Latency Disabled Successfully");
  });

  // Fallback endpoint
  app.get("/fallback/recommendations", (req, res) => {
    res.json(getFallbackRecommendations());
  });

  // Recommendation service direct endpoint
  app.get("/recommendations", async (req, res) => {
    if (latencyEnabled) {
      // Simulate timeout and return fallback
      recordCall(false);
      return res.json(getFallbackRecommendations());
    }
    recordCall(true);
    res.json([
      "Wireless Mouse",
      "Laptop Bag",
      "Mechanical Keyboard",
      "USB-C Hub",
      "Gaming Headset",
    ]);
  });

  // Gateway Aggregated Products endpoint
  app.get("/products", async (req, res) => {
    checkStateTransition();

    let recommendations: string[];

    if (circuitState === "OPEN") {
      // Circuit is open -> Gateway immediately redirects to Fallback without calling downstream
      recommendations = getFallbackRecommendations();
    } else {
      // Circuit is CLOSED or HALF_OPEN -> attempt recommendation call
      if (latencyEnabled) {
        // Simulates recommendation delay exceeding 2s timeout -> gateway routes to fallback and registers failure
        recordCall(false);
        recommendations = getFallbackRecommendations();
      } else {
        // Successful call
        recordCall(true);
        recommendations = [
          "Wireless Mouse",
          "Laptop Bag",
          "Mechanical Keyboard",
          "USB-C Hub",
          "Gaming Headset",
        ];
      }
    }

    res.json({
      products: ["Laptop", "Smartphone", "Headphones", "Tablet"],
      inventory: {
        Laptop: 14,
        Smartphone: 32,
        Headphones: 8,
        Tablet: 21,
      },
      recommendations,
    });
  });

  // Actuator health endpoints
  app.get("/actuator/product/health", (req, res) => {
    res.json({ status: "UP" });
  });

  app.get("/actuator/inventory/health", (req, res) => {
    res.json({ status: "UP" });
  });

  app.get("/actuator/recommendation/health", (req, res) => {
    res.json({ status: "UP" });
  });

  app.get("/actuator/health", (req, res) => {
    res.json({ status: "UP" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
