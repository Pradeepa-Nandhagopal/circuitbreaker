# 🛡️ CircuitBreaker: Cloud-Native E-Commerce Microservices

A **cloud-native e-commerce backend** developed using **Spring Boot Microservices**. The project demonstrates modern distributed-system concepts including **service discovery, API Gateway routing, fault tolerance with Resilience4j, Redis caching, distributed tracing with Zipkin, health monitoring, and centralized application monitoring with Spring Boot Admin**.

The system is designed to prevent **cascading failures** by isolating unhealthy services and providing fallback responses.

---

# 📑 Table of Contents

* [Architecture](#architecture)
* [Tech Stack](#tech-stack)
* [Project Structure](#project-structure)
* [Services](#services)
* [Key Features](#key-features)
* [Resilience Patterns](#resilience-patterns)
* [Redis Caching](#redis-caching)
* [Monitoring & Tracing](#monitoring--tracing)
* [APIs](#apis)
* [How to Run](#how-to-run)
* [Testing](#testing)
* [Future Enhancements](#future-enhancements)

---

# 🏗️ Architecture

```text
                           ┌─────────────────────┐
                           │       Client        │
                           │   Postman / Browser │
                           └──────────┬──────────┘
                                      │
                                      ▼
                           ┌─────────────────────┐
                           │     API Gateway     │
                           │       :8080         │
                           │                     │
                           │ Routing              │
                           │ Circuit Breaker     │
                           │ Rate Limiter        │
                           │ Bulkhead            │
                           │ Timeout / Retry      │
                           └──────────┬──────────┘
                                      │
                    ┌─────────────────┼─────────────────┐
                    │                 │                 │
                    ▼                 ▼                 ▼
             ┌────────────┐    ┌────────────┐   ┌────────────────┐
             │  Product   │    │ Inventory  │   │ Recommendation │
             │  Service   │    │  Service   │   │    Service     │
             │   :8081    │    │   :8082    │   │     :8083      │
             └─────┬──────┘    └────────────┘   └────────────────┘
                   │
          ┌────────┴─────────┐
          ▼                  ▼
   ┌──────────────┐   ┌───────────────┐
   │ Resilience4j │   │     Redis     │
   │ Resilience   │   │     Cache     │
   └──────────────┘   └───────────────┘


             ┌──────────────────────────┐
             │      Eureka Server       │
             │    Service Registry      │
             │          :8761           │
             └──────────────────────────┘

             ┌──────────────────────────┐
             │    Spring Boot Admin     │
             │   Centralized Monitoring │
             │          :9090           │
             └──────────────────────────┘

             ┌──────────────────────────┐
             │          Zipkin          │
             │   Distributed Tracing    │
             │          :9411           │
             └──────────────────────────┘
```

---

# 🧰 Tech Stack

| Technology                | Purpose                       |
| ------------------------- | ----------------------------- |
| **Java 17**               | Programming Language          |
| **Spring Boot 3.4.7**     | Microservices Framework       |
| **Spring Cloud 2024.0.2** | Cloud-Native Infrastructure   |
| **Spring Cloud Gateway**  | API Gateway                   |
| **Netflix Eureka**        | Service Discovery             |
| **Resilience4j**          | Fault Tolerance               |
| **Redis**                 | In-Memory Caching             |
| **Spring Data Redis**     | Redis Integration             |
| **Spring Boot Actuator**  | Health & Metrics              |
| **Spring Boot Admin**     | Centralized Monitoring        |
| **Micrometer Tracing**    | Distributed Tracing           |
| **Zipkin**                | Trace Visualization           |
| **Maven**                 | Build & Dependency Management |
| **Postman**               | API Testing                   |

---

# 📁 Project Structure

```text
cloud-native-ecommerce/
│
├── service-registry/
│   └── Eureka Server
│
├── api-gateway/
│   └── Spring Cloud Gateway
│
├── product-service/
│   └── Product Microservice
│
├── inventory-service/
│   └── Inventory Microservice
│
├── recommendation-service/
│   └── Recommendation Microservice
│
├── admin-server/
│   └── Spring Boot Admin
│
├── postman/
│   └── API Testing Collection
│
└── README.md
```

---

# 🔧 Services

| Service                    |   Port | Responsibility         |
| -------------------------- | -----: | ---------------------- |
| **Eureka Server**          | `8761` | Service Registry       |
| **API Gateway**            | `8080` | Routing & Resilience   |
| **Product Service**        | `8081` | Product Management     |
| **Inventory Service**      | `8082` | Inventory Management   |
| **Recommendation Service** | `8083` | Recommendations        |
| **Admin Server**           | `9090` | Application Monitoring |
| **Zipkin**                 | `9411` | Distributed Tracing    |
| **Redis**                  | `6379` | In-Memory Cache        |

---

# ✨ Key Features

## 🔎 Service Discovery — Eureka

Netflix Eureka acts as the central service registry.

Each microservice registers with Eureka, allowing services to discover each other dynamically instead of relying on fixed service addresses.

```text
Product Service
       │
       ▼
Eureka Server
       │
       ▼
Discover Inventory / Recommendation
```

---

## 🌐 API Gateway

Spring Cloud Gateway provides a **single entry point** for client requests.

### Responsibilities

* Dynamic request routing
* Service discovery integration
* Load-balanced communication
* Circuit Breaker
* Rate Limiting
* Bulkhead
* Timeout
* Retry
* Fallback

```text
Client
  ↓
API Gateway
  ↓
Required Microservice
```

---

# 🛡️ Resilience4j Fault Tolerance

The project uses Resilience4j to protect services from failures and prevent cascading failures.

### Supported resilience patterns

| Pattern             | Purpose                           |
| ------------------- | --------------------------------- |
| **Circuit Breaker** | Stops calls to unhealthy services |
| **Retry**           | Handles temporary failures        |
| **Timeout**         | Prevents indefinite waiting       |
| **Rate Limiter**    | Controls excessive traffic        |
| **Bulkhead**        | Limits concurrent requests        |
| **Fallback**        | Provides an alternative response  |

---

# ⚡ Circuit Breaker

The Circuit Breaker protects the application when a dependent service becomes unavailable.

### Normal Flow

```text
Product Service
      ↓
Inventory Service
      ↓
Successful Response
```

### Failure Flow

```text
Product Service
      ↓
Inventory Service
      ✕
Service Unavailable
      ↓
Circuit Breaker
      ↓
Fallback Response
```

### Circuit Breaker States

```text
🟢 CLOSED
Normal requests
     ↓
Failures exceed threshold
     ↓
🔴 OPEN
Requests blocked + Fallback
     ↓
Wait Duration
     ↓
🟡 HALF-OPEN
Recovery test
     ↓
Success
     ↓
🟢 CLOSED
```

This prevents repeated calls to a failing service and helps protect the application from cascading failures.

---

# 🔄 Fallback

When a dependent service is unavailable, the application returns a fallback response instead of allowing the request to fail or hang indefinitely.

Example:

```json
{
  "status": "fallback",
  "message": "Service temporarily unavailable"
}
```

Fallback provides **graceful degradation** and keeps unaffected parts of the application available.

---

# 🚦 Rate Limiter

The Rate Limiter controls the number of requests allowed through the Gateway.

```text
Request 1 → ✅
Request 2 → ✅
Request 3 → ✅
Request 4 → ❌ 429 Too Many Requests
```

This helps protect backend services from excessive traffic and abuse.

---

# 🧱 Bulkhead

Bulkhead isolation limits the number of concurrent requests handled by a protected service.

```text
Recommendation Route

Concurrent Requests
        ↓
     Bulkhead
        ↓
 Limited Capacity
```

This prevents an overloaded service from consuming all available resources and affecting other services.

---

# ⏱️ Timeout & Retry

### Timeout

Prevents requests from waiting indefinitely for a slow service.

```text
Request
  ↓
Slow Service
  ↓
Timeout
  ↓
Fallback / Circuit Breaker
```

### Retry

Handles temporary failures by attempting the request again according to the configured retry policy.

```text
Request
  ↓
Failure
  ↓
Retry
  ↓
Success
```

---

# 🗄️ Redis Caching

Redis is used as an in-memory caching layer to reduce repeated service calls and improve response time.

```text
Client
  ↓
Product Service
  ↓
Redis
  │
  ├── Cache Hit ──→ Return Data
  │
  └── Cache Miss
          ↓
      Backend Service
          ↓
      Store in Redis
          ↓
       Response
```

### Benefits

* Faster responses
* Reduced backend calls
* Lower service load
* Efficient in-memory access

---

# 📊 Monitoring & Tracing

## Spring Boot Actuator

Provides health and application metrics through endpoints such as:

```text
/actuator/health
/actuator/info
/actuator/metrics
```

---

## Spring Boot Admin

Provides a centralized dashboard for monitoring registered Spring Boot applications.

```text
http://localhost:9090
```

It provides visibility into:

* Service health
* Application status
* Metrics
* JVM information
* Actuator endpoints

---

## 🔍 Zipkin Distributed Tracing

Zipkin tracks requests as they move across multiple microservices.

```text
Client
  ↓
API Gateway
  ↓
Product Service
  ├──→ Inventory Service
  └──→ Recommendation Service
```

Zipkin helps identify:

* Request flow
* Trace and Span IDs
* Service dependencies
* Latency
* Failed requests

Dashboard:

```text
http://localhost:9411
```

---

# 🌐 APIs

## Product Service

```http
GET /products
```

Returns product information.

## Inventory Service

```http
GET /inventory
```

Returns inventory information.

## Recommendation Service

```http
GET /recommendations
```

Returns product recommendations.

> Requests can be routed through the API Gateway instead of directly accessing backend services.

---

# ▶️ How to Run

## Prerequisites

Install:

* Java 17+
* Maven
* Redis
* IntelliJ IDEA / Eclipse / STS
* Postman
* Docker *(optional for Zipkin)*

Verify Java:

```bash
java -version
```

Verify Maven:

```bash
mvn -version
```

---

## 1. Start Redis

Run Redis on:

```text
localhost:6379
```

---

## 2. Start Eureka Server

Run:

```bash
cd service-registry
mvn spring-boot:run
```

Dashboard:

```text
http://localhost:8761
```

---

## 3. Start Microservices

Start in this order:

```text
1. service-registry
2. inventory-service
3. recommendation-service
4. product-service
5. api-gateway
6. admin-server
```

Each service should appear as registered in Eureka.

---

## 4. Start Zipkin

Using Docker:

```bash
docker run -d -p 9411:9411 openzipkin/zipkin
```

Dashboard:

```text
http://localhost:9411
```

---

# 🧪 Testing

## 1. Circuit Breaker Test

### Normal

```text
Client
  ↓
Product Service
  ↓
Inventory Service
  ↓
Success ✅
```

Circuit:

```text
CLOSED 🟢
```

### Failure

Stop the Inventory Service.

```text
Client
  ↓
Product Service
  ↓
Inventory Service ✕
  ↓
Circuit Breaker
  ↓
Fallback
```

The Circuit Breaker should eventually transition to:

```text
OPEN 🔴
```

### Recovery

Restart Inventory Service.

```text
OPEN 🔴
   ↓
HALF-OPEN 🟡
   ↓
Successful Test
   ↓
CLOSED 🟢
```

---

## 2. Redis Cache Test

### First Request

```text
Request
  ↓
Redis
  ↓
Cache Miss
  ↓
Backend
  ↓
Store Data
```

### Second Request

```text
Request
  ↓
Redis
  ↓
Cache Hit
  ↓
Response
```

---

## 3. Rate Limiter Test

Send multiple requests rapidly:

```text
Request 1 → ✅
Request 2 → ✅
Request 3 → ✅
Request 4 → ❌ 429
```

---

## 4. Chaos / Latency Test

Introduce artificial latency in the Recommendation Service.

```text
Recommendation Service
        ↓
Artificial Delay
        ↓
Timeout
        ↓
Circuit Breaker
        ↓
Fallback
```

This demonstrates how the system remains responsive when a downstream service becomes slow.

---

# 📡 Monitoring Dashboards

| Component             | URL                     | Purpose             |
| --------------------- | ----------------------- | ------------------- |
| **Eureka**            | `http://localhost:8761` | Service Discovery   |
| **Spring Boot Admin** | `http://localhost:9090` | Health & Monitoring |
| **Zipkin**            | `http://localhost:9411` | Distributed Tracing |
| **Redis**             | `localhost:6379`        | Cache               |

---

# 🎯 Key Concepts Demonstrated

* Microservices Architecture
* Service Discovery
* Eureka Server
* API Gateway
* Dynamic Routing
* Inter-Service Communication
* Circuit Breaker
* Resilience4j
* Retry
* Timeout
* Rate Limiting
* Bulkhead Isolation
* Fallback
* Redis Caching
* Spring Boot Actuator
* Spring Boot Admin
* Distributed Tracing
* Zipkin
* Fault Tolerance
* Chaos Testing

---

# 🔮 Future Enhancements

* Docker Compose for complete application setup
* Prometheus & Grafana monitoring
* Centralized logging
* Spring Cloud Config
* JWT / OAuth2 authentication
* Kafka event-driven communication
* Automated unit and integration testing
* Kubernetes deployment
* AWS deployment
* CI/CD using GitHub Actions
* Replace `RestTemplate` with `WebClient`

---

# 👩‍💻 Author

**Pradeepa N**
CSE

---

## ⭐ Project Goal

> **One unhealthy microservice should not make the entire application unhealthy.**

CircuitBreaker demonstrates how **API Gateway + Service Discovery + Resilience Patterns + Caching + Monitoring + Distributed Tracing** can be combined to build a reliable and fault-tolerant cloud-native application.
