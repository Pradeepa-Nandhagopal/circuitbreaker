# CircuitBreaker:Cloud-Native E-Commerce Microservices

A **cloud-native e-commerce backend** developed using **Spring Boot Microservices**. The project demonstrates modern microservice architecture concepts including **service discovery, API Gateway routing, fault tolerance with Resilience4j Circuit Breaker, Redis caching, distributed tracing using Zipkin, health monitoring, and centralized application monitoring using Spring Boot Admin**.

---

# Architecture

                           ┌─────────────────────┐
                           │       Client        │
                           │   Postman / Browser │
                           └──────────┬──────────┘
                                      │
                                      ▼
                           ┌─────────────────────┐
                           │     API Gateway     │
                           │       :8080         │
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
                   │
          ┌────────┴─────────┐
          │                  │
          ▼                  ▼
   ┌──────────────┐   ┌───────────────┐
   │  Resilience4j│   │     Redis     │
   │ CircuitBreaker│   │    Cache      │
   └──────────────┘   └───────────────┘


             ┌──────────────────────────┐
             │      Eureka Server       │
             │    Service Registry      │
             │          :8761           │
             └──────────────────────────┘


             ┌──────────────────────────┐
             │    Spring Boot Admin     │
             │   Centralized Monitoring  │
             │          :9090           │
             └──────────────────────────┘


             ┌──────────────────────────┐
             │          Zipkin          │
             │   Distributed Tracing    │
             │          :9411           │
             └──────────────────────────┘
```

---

# Tech Stack

| Technology           | Version / Purpose                 |
| -------------------- | --------------------------------- |
| Java                 | 17                                |
| Spring Boot          | 3.4.7                             |
| Spring Cloud         | 2024.0.2                          |
| Maven                | Build & Dependency Management     |
| Eureka Server        | Service Discovery                 |
| Spring Cloud Gateway | API Gateway                       |
| Resilience4j         | Circuit Breaker & Fault Tolerance |
| Redis                | Caching                           |
| Spring Data Redis    | Redis Integration                 |
| Spring Boot Actuator | Health & Metrics                  |
| Spring Boot Admin    | Centralized Monitoring            |
| Zipkin               | Distributed Tracing               |
| REST APIs            | Inter-Service Communication       |
| Microservices        | Application Architecture          |
| Postman              | API Testing                       |

---

#Project Structure

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

# Features

## Service Discovery using Eureka

The project uses **Netflix Eureka Server** as a service registry.

Each microservice registers itself with Eureka, allowing services to discover and communicate with each other dynamically.

## API Gateway

**Spring Cloud Gateway** acts as the single entry point for client requests.

Features include:

* API routing
* Dynamic routing
* Service discovery-based routing
* Centralized entry point
* Load-balanced communication

---

## Circuit Breaker with Resilience4j

The Product Service uses **Resilience4j Circuit Breaker** to handle failures when communicating with dependent services.

If a dependent service becomes unavailable, the Circuit Breaker prevents repeated failed requests and executes a fallback method.

```text
Product Service
      │
      ▼
Inventory Service
      │
      ✕
Service Unavailable
      │
      ▼
Resilience4j Circuit Breaker
      │
      ▼
Fallback Response
```

---

## Fallback APIs

Fallback responses are returned when dependent services are unavailable.

This improves:

* Fault tolerance
* System reliability
* Service availability
* Failure isolation

---

# Redis Caching

The project uses **Redis** as an in-memory caching layer.

Caching frequently requested data reduces unnecessary calls to backend services and improves application response time.

```text
Client
  │
  ▼
Product Service
  │
  ▼
Redis Cache
  │
  ├── Cache Hit ──────► Return Cached Data
  │
  └── Cache Miss
          │
          ▼
      Backend Service
          │
          ▼
      Store in Redis
          │
          ▼
      Return Response
```

### Benefits of Redis

* Faster response time
* Reduced database/service calls
* Improved application performance
* Efficient in-memory data access
* Reduced load on backend services

# Distributed Tracing with Zipkin

The project uses **Zipkin** to trace requests across multiple microservices.

A single request can travel through several services:

```text
Client
  │
  ▼
API Gateway
  │
  ▼
Product Service
  │
  ├──────────────► Inventory Service
  │
  └──────────────► Recommendation Service
```

Zipkin helps track:

* Request flow
* Trace IDs
* Span IDs
* Service-to-service communication
* Request latency
* Failed requests
* Distributed transactions

### Zipkin Dashboard

```text
http://localhost:9411
```

The Zipkin dashboard can be used to search and visualize traces generated by the microservices.

---

# Health Monitoring

**Spring Boot Actuator** provides health and monitoring endpoints.

Example:

```text
/actuator/health
/actuator/info
/actuator/metrics
```

These endpoints provide information about:

* Application health
* Runtime metrics
* Application information
* Service status

---

#  Spring Boot Admin

**Spring Boot Admin** provides a centralized dashboard for monitoring Spring Boot applications.

Dashboard:

```text
http://localhost:9090
```

It can be used to monitor:

* Application health
* Service status
* Metrics
* Environment
* Actuator endpoints
* JVM information

---

#  Services

| Service                |   Port | Description             |
| ---------------------- | -----: | ----------------------- |
| Eureka Server          | `8761` | Service Registry        |
| API Gateway            | `8080` | API Routing             |
| Product Service        | `8081` | Product Management      |
| Inventory Service      | `8082` | Inventory Management    |
| Recommendation Service | `8083` | Product Recommendations |
| Admin Server           | `9090` | Centralized Monitoring  |
| Zipkin                 | `9411` | Distributed Tracing     |
| Redis                  | `6379` | In-Memory Cache         |

---

# APIs

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

---

# How to Run

## Prerequisites

Install the following:

* Java 17
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

# Start Redis

Redis should be running before testing the caching functionality.

Default Redis port:

```text
6379
```

If Redis is running locally, the application can connect to:

```text
localhost:6379

#  Start Eureka Server

Run the `service-registry` application first.

Eureka Dashboard:

```text
http://localhost:8761
```

---

#  Start Microservices

Start the services in the following order:

```text
1. service-registry
2. inventory-service
3. recommendation-service
4. product-service
5. api-gateway
6. admin-server
```

---

#  Start API Gateway

The API Gateway runs on:

```text
http://localhost:8080
```

Client requests can be routed through the Gateway to the appropriate microservice.

---

#  Start Spring Boot Admin

The Admin Server runs on:

```text
http://localhost:9090
```

Open the dashboard to monitor the registered Spring Boot applications.

---

# Start Zipkin

Zipkin can be started using Docker:

```bash
docker run -d -p 9411:9411 openzipkin/zipkin
```

Open the Zipkin dashboard:

```text
http://localhost:9411
```

---

# Circuit Breaker Testing

The Circuit Breaker can be tested by stopping the **Inventory Service** while the Product Service is running.

### Normal Flow

```text
Client
  ↓
Product Service
  ↓
Inventory Service
  ↓
Successful Response
```

### Failure Flow

```text
Client
  ↓
Product Service
  ↓
Inventory Service
  ✕
Service Unavailable
  ↓
Resilience4j Circuit Breaker
  ↓
Fallback Response
```

After restarting the Inventory Service, the Circuit Breaker can transition through its recovery state and return to normal operation.

---

# Redis Cache Testing

Redis caching can be verified by requesting the same data multiple times.

### First Request

```text
Client
  ↓
Product Service
  ↓
Redis Cache
  ↓
Cache Miss
  ↓
Backend Service
  ↓
Store Data in Redis
  ↓
Response
```

### Subsequent Request

```text
Client
  ↓
Product Service
  ↓
Redis Cache
  ↓
Cache Hit
  ↓
Response
```

The second request can be served directly from Redis, reducing unnecessary backend calls.

---

# Distributed Tracing Testing

After sending API requests through the system:

```text
API Gateway
      ↓
Product Service
      ↓
Inventory Service
      ↓
Recommendation Service
```

Open:

```text
http://localhost:9411
```

Search for the service traces and inspect the request flow, spans, and latency between services.

---

# Monitoring

### Eureka Dashboard

```text
http://localhost:8761
```

Used to view registered microservices.

### Spring Boot Admin

```text
http://localhost:9090
```

Used to monitor application health and metrics.

### Zipkin

```text
http://localhost:9411
```

Used for distributed request tracing.

### Redis

```text
localhost:6379
```

Used as the application's in-memory caching layer.

---

# Key Concepts Demonstrated

* Microservices Architecture
* Service Discovery
* Eureka Server
* API Gateway
* Dynamic Routing
* Inter-Service Communication
* Circuit Breaker Pattern
* Resilience4j
* Fallback Mechanism
* Redis Caching
* Cache Hit / Cache Miss
* Spring Boot Actuator
* Spring Boot Admin
* Health Monitoring
* Distributed Tracing
* Zipkin
* Fault Tolerance
* REST APIs
* Service Monitoring

---

# 🔮 Future Enhancements

* Add centralized configuration using Spring Cloud Config
* Add authentication using Spring Security and JWT
* Add Docker Compose for all services
* Add centralized logging
* Add Prometheus and Grafana
* Add database persistence
* Add automated unit and integration testing
* Add Kafka for event-driven communication
* Add Kubernetes deployment
* Deploy microservices to AWS
* Replace `RestTemplate` with `WebClient`

---

# Author

**Pradeepa N**
CSE 

---

## Project Summary

> A cloud-native e-commerce backend demonstrating **Spring Boot Microservices, Eureka Service Discovery, API Gateway, Resilience4j Circuit Breaker, Redis Caching, Zipkin Distributed Tracing, Spring Boot Admin, fallback mechanisms, and centralized application monitoring**.

