# Jenkins QA Automation Project

This repository contains the Jenkins CI/CD pipeline, automation tests, and documentation for the QA Automation Assessment.

---

## 📂 Repository Contents
- **docs/** → Jenkins documentation (setup, architecture, scaling, troubleshooting)
- **jenkins/** → Jenkins pipeline (`Jenkinsfile`), config, and scripts
- **docker/** → Docker setup for Jenkins controller and agents
- **tests/** → End-to-end automation tests
- **reports/** → Generated reports (JUnit/HTML)

---

## ⚙️ Setup Instructions

### 1. Clone the repository

git clone https://github.com/izzatty/Project

cd Project 

### 2. Jenkins Setup

- Install Jenkins via Docker: docker-compose -f docker/docker-compose.yml up -d

- Access Jenkins at: http://localhost:8080

- Install recommended plugins and configure credentials.

### 3. Run Pipeline

- Open Jenkins dashboard

- Create a pipeline job pointing to this repository

- Configure job to use the jenkins/Jenkinsfile

### 4. Run Tests

- Trigger pipeline manually or via webhook

- Reports will be stored in /reports

## 🐳 Docker Setup

- docker/Dockerfile → Custom Jenkins image (with required plugins)

- docker-compose.yml → Launch Jenkins + agents quickly

- Data persisted in a Docker volume for Jenkins home

## 🧪 Jenkinsfile Features

- Multi-stage pipeline (setup → test → report → cleanup)

- Parallel execution across Chrome, Firefox, Edge

- Parameterized builds (suite, browser, env)

- Retry + error handling for flaky tests

- Reporting with JUnit + HTMLPublisher

- Notifications (Slack/Email)

## 🚀 Scaling Strategy

- Add more agents (via docker-compose scale agent=n)

- Use labels (chrome-node, firefox-node) for targeted execution

- Queue management for 50+ executions/day

- Monitoring via Blue Ocean/Build Monitor
