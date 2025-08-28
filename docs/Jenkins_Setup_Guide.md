# Jenkins Setup Guide

This guide explains how to install and configure Jenkins for the ParaBank automation project.

## 1. Prerequisites
- Windows 11
- Java 20.0.2 installed
- Node.js installed (for Cypress)
- Git installed

## 2. Jenkins Installation
### Using Docker
```bash
docker pull jenkins/jenkins:lts
docker run -p 8080:8080 -p 50000:50000 jenkins/jenkins:lts

Local Installation
1. Download Jenkins LTS: https://www.jenkins.io/download/
2. Run the installer and follow setup instructions.
3. Access Jenkins dashboard at http://localhost:8080.

3. Plugin Installation
Install the following Jenkins plugins:
- Pipeline (workflow-aggregator)
- Git (for GitHub integration)
- Docker Plugin (for agent provisioning)
- HTML Publisher (report publishing)
- Build Monitor View (dashboard monitoring)
- JUnit Plugin (test results)

4. Creating a Pipeline
1. Go to New Item → Pipeline.
2. Enter a name: MyProject-Pipeline.
3. Choose Pipeline and click OK.
4. Under Pipeline section, select Pipeline script from SCM.
5. Configure:
    -SCM: Git
    -Repository URL: https://github.com/izzatty/Project
    -Branch: master
    Script Path: jenkins/Jenkinsfile

5. Agent Configuration
- Use Docker-based agents for isolation:
    - Chrome Agent
    - Firefox Agent
    - Edge Agent
- Configure JNLP-based inbound communication if using separate machines.

6. Workspace Setup
- Ensure workspace folder is writable
- Node.js and npm available in PATH
- Reports and screenshots folder created in workspace (reports/, screenshots/)