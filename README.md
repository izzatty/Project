# Jenkins CI/CD Documentation

## 1️⃣ Jenkins Setup Guide

### Step 1: Install Jenkins

#### Using Docker

Create a persistent volume:

docker volume create jenkins_home


Run the Jenkins container:

docker run -d -p 8080:8080 -p 50000:50000 --name jenkins \
  -v jenkins_home:/var/jenkins_home jenkins/jenkins:lts

Using Native Installation

Download Jenkins from the official site
.

Ensure Java JDK 11+ is installed:

java -version


Follow the installation instructions.

Access Jenkins at: http://localhost:8080

Step 2: Initial Setup

Unlock Jenkins using the administrator password shown in the console.

Install suggested plugins.

Configure global tools:

Git (e.g., name: Git-Windows, path: C:\Program Files\Git\bin\git.exe)

NodeJS (e.g., name: Node24)

Step 3: Create Users and Credentials

Create separate Jenkins users with appropriate roles.

Use the Credentials Manager to store:

GitHub tokens

Docker credentials

SSH keys or secret texts

Step 4: Configure Agents

Static Agents:

Set up manually on physical or virtual machines.

Must have all required tools installed.

Dynamic Agents:

Provisioned on-demand via Kubernetes or Docker.

Scales automatically based on pipeline load.

Use labels (e.g., chrome, linux) to control job routing.

2️⃣ Pipeline Architecture Document
Pipeline Design Decisions

Multibranch Pipeline detects and builds all branches automatically.

Each branch runs its own Jenkinsfile.

Stages are used to ensure modular and testable steps.

Stages Overview

Cleanup Workspace – Ensures a clean environment.

Checkout Code – Pulls the relevant branch from Git.

Test – Installs dependencies and runs automated tests.

Publish Reports – Archives HTML/Allure reports.

Tools and Resources

Git – Version control

NodeJS – Script execution

Agent Labels – chrome-node, firefox-node, etc.

Lockable resources – Prevent job collisions

Disable concurrent builds for job stability

Error Handling and Monitoring

Use try/finally blocks to ensure reports are always published.

Use post blocks to:

Notify success, failure, or unstable

Enable parallel execution for independent steps.

Use Blue Ocean for pipeline visualization.

3️⃣ Troubleshooting Guide
Common Pipeline Issues & Fixes

SCM Checkout Failures:

Cause: Missing Git or wrong pipeline type.

Fix: Install Git and use Multibranch Pipeline.

npm Install Errors:

Cause: NodeJS not configured.

Fix: Add NodeJS in Global Tool Config.

Test Report Failures:

Cause: Wrong report path.

Fix: Check directory name/path in Jenkinsfile.

Skipped Stages:

Cause: Failure in earlier stage.

Fix: Use error handling with try/catch.

Offline Agents:

Cause: Disconnected agent or label mismatch.

Fix: Restart and check label config.

CreateProcess Error=2:

Cause: Missing executable in PATH.

Fix: Update Jenkins Global Tool Configuration.

4️⃣ Scaling Strategy
Horizontal Scaling

Add more Jenkins agents for parallel builds.

Use meaningful labels like:

linux, windows, chrome, etc.

Dynamic Scaling

Use Docker or Kubernetes for auto-scaling agents.

Reduces idle time and adapts to workload size.

Resource Management

Throttle concurrent builds to prevent overload.

Use lockable resources for exclusive access.

Run parallel stages where possible to improve speed.

Monitoring and Dashboards

Use:

Blue Ocean

Build Monitor View

Integrate notifications via:

Slack

Microsoft Teams

Email

Archiving and Maintenance

Configure build discarder to clean up old builds.

Auto-remove orphaned branches in Multibranch settings.

Use shared libraries to reduce code duplication.
