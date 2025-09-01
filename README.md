# QA_Automation_Assessment

🧰 Jenkins CI/CD Documentation
1️⃣ Jenkins Setup Guide
Step 1: Install Jenkins

Using Docker:

Pull the Jenkins LTS image.

Create a persistent volume for the Jenkins home directory.

Run the container with:

Ports 8080 (web interface) and 50000 (agent communication) exposed.

Native Installation:

Download Jenkins from the official website
.

Ensure Java JDK 11 or higher is installed.

Follow installation instructions.

Access Jenkins via: http://localhost:8080.

Step 2: Initial Setup

Unlock Jenkins using the administrator password shown in the console.

Install suggested plugins.

Configure tools:

Git (e.g., name: Git-Windows, path to Git binary)

NodeJS (e.g., name: Node24, path to Node binary)

Step 3: Create Users and Credentials

Create separate Jenkins users with appropriate roles for security.

Add credentials for:

GitHub

Docker

Any third-party services

Use Jenkins' Credentials Manager to securely store them for pipelines.

Step 4: Configure Agents

Static Agents:

Pre-configured physical or virtual machines.

Must have required tools installed.

Dynamic Agents:

Provisioned on-demand using Kubernetes or Docker.

Auto-scalable for temporary workloads.

Proper agent configuration improves distribution, reliability, and performance.

2️⃣ Pipeline Architecture Document
Pipeline Design Decisions

Uses a Multibranch Pipeline to detect and build branches automatically.

Each branch runs its own Jenkinsfile.

Pipeline stages promote modularity and isolation.

Stages Overview

Cleanup Workspace – Ensures clean environment.

Checkout Code – Clones the correct branch.

Test – Installs dependencies and runs tests.

Publish Reports – Generates HTML or Allure test reports.

Tools and Resources

Git for version control.

NodeJS to run test scripts.

Agent Labels (e.g., chrome-node, firefox-node) to direct jobs.

Lockable resources prevent concurrency issues.

Concurrent builds are disabled for workspace stability.

Error Handling and Monitoring

Use try/finally blocks to guarantee test report publication.

Use post blocks to:

Send notifications.

Log success/failure/unstable statuses.

Enable parallel stages for independent tasks.

Use Blue Ocean for real-time pipeline visualization.

3️⃣ Troubleshooting Guide
Common Pipeline Issues & Fixes

SCM checkout failures:

Caused by missing Git or using standard pipeline instead of multibranch.

npm install errors:

NodeJS not configured correctly in Jenkins tools.

Test report publishing failure:

Incorrect path to report files or directories.

Skipped stages:

Usually caused by a failed prior stage. Use proper error handling.

Offline agents:

Restart the agent.

Ensure labels in Jenkinsfile match agent configuration.

Executable path errors (e.g., CreateProcess error=2):

Jenkins cannot find the executable.

Fix: Add correct tool paths in Global Tool Configuration.

4️⃣ Scaling Strategy
Horizontal Scaling

Add more Jenkins agents for parallel pipeline executions.

Label agents by capability:

OS type

Browser (e.g., chrome, firefox)

Improves job distribution and execution time.

Dynamic Scaling

Use Kubernetes or Docker to provision agents on-demand.

Reduces idle resources.

Scales up/down automatically based on workload.

Resource Management

Limit concurrent builds to avoid overload.

Use lockable resources to prevent shared resource conflicts.

Enable parallel execution for independent tasks to boost throughput.

Monitoring and Dashboards

Blue Ocean and Build Monitor View plugins provide:

Real-time status

System health

Slack/Teams integration for instant build notifications.

Archiving and Maintenance

Use Build Discarder to limit stored builds.

Automatically remove orphaned branches.

Use Shared Libraries to reuse common pipeline logic and reduce duplication.


