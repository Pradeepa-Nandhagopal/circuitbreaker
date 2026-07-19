# Cloud-Native E-Commerce Microservices

A cloud-native e-commerce backend developed using Spring Boot Microservices. The project demonstrates service discovery, API Gateway routing, circuit breaker patterns, and centralized monitoring using Spring Boot Admin.

## Tech Stack

- Java 17
- Spring Boot 3.4.7
- Spring Cloud 2024.0.2
- Maven
- Eureka Server
- Spring Cloud Gateway
- Resilience4j
- Spring Boot Actuator
- Spring Boot Admin
- REST APIs

## Microservices

- Service Registry (Eureka)
- API Gateway
- Product Service
- Inventory Service
- Recommendation Service
- Admin Server

## Features

- Service Discovery using Eureka
- API Gateway Routing
- Dynamic Routing
- Circuit Breaker with Resilience4j
- Fallback APIs
- Health Monitoring
- Centralized Dashboard
- Actuator Metrics

## Services

| Service | Port |
|----------|------|
| Eureka Server | 8761 |
| API Gateway | 8080 |
| Product Service | 8081 |
| Inventory Service | 8082 |
| Recommendation Service | 8083 |
| Admin Server | 9090 |

## APIs

GET /products

GET /inventory

GET /recommendations

## Monitoring

Spring Boot Admin Dashboard

http://localhost:9090

## Eureka Dashboard

http://localhost:8761
