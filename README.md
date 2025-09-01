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

---

### ⚙️ Step 2: Initial Setup

- Unlock Jenkins using the administrator password shown in the console:
  - Located at: `/var/jenkins_home/secrets/initialAdminPassword` (Docker)
- Install **Suggested Plugins** when prompted
- Configure required system tools via **Manage Jenkins > Global Tool Configuration**:
  - Git (e.g., Name: `Git-Windows`, Path: `C:\Program Files\Git\bin\git.exe`)
  - NodeJS (e.g., Name: `Node24`, Path to Node binary)

---

### 👥 Step 3: Create Users and Credentials

- For security:
  - Go to **Manage Jenkins > Manage Users** to add new users with roles
- Store credentials under:
  - **Manage Jenkins > Credentials > System > Global credentials**
- Add types such as:
  - **Username and Password**
  - **Secret Text** (e.g., API keys)
  - **SSH Username with Private Key**
- Use credentials securely in pipelines using the `credentials()` helper function

---

### 🤖 Step 4: Configure Agents

#### 🧱 Static Agents

- Physical or virtual machines (manually configured)
- Must:
  - Have Java installed
  - Be connected via JNLP or SSH
  - Use matching **agent labels**

#### ⚡ Dynamic Agents

- Provisioned using:
  - **Kubernetes plugin**
  - **Docker plugin**
- Advantages:
  - Auto-scalable
  - Lightweight and efficient
- Use different labels for different purposes:
  - `chrome-node`, `ubuntu-agent`, `firefox-runner`, etc.

---

## 🚀 Pipeline Architecture Document

### 📐 Pipeline Design Decisions

- Uses **Multibranch Pipeline**
  - Detects all branches automatically
  - Each branch runs its own `Jenkinsfile`
- Promotes modular and isolated pipeline executions per branch

---

### 📊 Stages Overview

1. **Cleanup Workspace** – Deletes any leftover files from previous runs
2. **Checkout Code** – Pulls the specific branch using Git
3. **Test** – Installs dependencies (e.g., via npm) and runs tests
4. **Publish Reports** – Archives reports like:
   - HTML test reports
   - Allure results
   - JUnit XML results

---

### 🛠️ Tools and Resources

- **Git** – Handles SCM operations
- **NodeJS** – Required for frontend/backend JavaScript projects
- **Labels** – Direct builds to specific environments:
  - e.g., `chrome`, `firefox`, `ubuntu`
- **Lockable Resources Plugin** – Prevents race conditions
- **Concurrency Control** – Disable concurrent builds for fragile jobs

---

### 🚨 Error Handling and Monitoring

- Use `try/finally` blocks to ensure essential steps are always executed
  ```groovy```
  try {
    stage('Test') {
      // Run tests
    }
  } finally {
    stage('Publish Reports') {
      // Archive test results
    }
  }
```groovy```
post {
  success {
    echo 'Build passed!'
  }
  failure {
    echo 'Build failed.'
  }
}
- **Use Blue Ocean plugin for:**
- Visual pipeline stages
- Real-time monitoring
- Clickable logs and UI

---

## 🧩 Troubleshooting Guide

### 🔍 Common Pipeline Issues & Fixes

#### ❌ SCM Checkout Failures
- **Cause**: Git is missing on the agent or you're using a standard pipeline instead of a Multibranch Pipeline.
- **Fix**:
  - Install Git on the agent.
  - Use Multibranch Pipeline in Jenkins.

#### ❌ npm Install Errors
- **Cause**: NodeJS is not configured properly in Jenkins.
- **Fix**:
  - Go to **Manage Jenkins > Global Tool Configuration** and add NodeJS.
  - Ensure the right version is used in the pipeline.

#### ❌ Test Report Publishing Failures
- **Cause**: Wrong path to report directory or files not generated.
- **Fix**:
  - Double-check the directory path in the `Jenkinsfile`.
  - Use absolute or environment-specific paths if necessary.

#### ❌ Skipped Stages
- **Cause**: A previous stage failed, and `post`/`finally` blocks weren’t used.
- **Fix**:
  - Implement error handling using `try/finally` or `catchError` blocks.

#### ❌ Offline Agents
- **Cause**: Jenkins agent is not running or label mismatch.
- **Fix**:
  - Restart the agent machine or container.
  - Ensure the label used in the `Jenkinsfile` matches the actual agent label.

#### ❌ CreateProcess Error=2
- **Cause**: An executable required by the pipeline is missing in the agent’s system PATH.
- **Fix**:
  - Configure the correct path using **Global Tool Configuration**.
  - Make sure the tool is installed on the agent machine.

---

## 📈 Scaling Strategy

### 🧱 Horizontal Scaling

- Add more agents to execute multiple pipelines in parallel.
- Use **agent labels** such as:
  - `windows`, `linux`, `chrome`, `firefox`, `high-memory`
- Distribute jobs efficiently based on labels.

**Benefits:**
- Reduce waiting time in the build queue.
- Faster execution for teams running many builds.

---

### ⚡ Dynamic Scaling

- Use dynamic provisioning tools like:
  - **Kubernetes Plugin**
  - **Docker Plugin**
- Automatically provision agents when pipeline starts.
- Automatically destroy agents after job completion.

**Benefits:**
- Cost-efficient
- Scales with workload
- No idle agents when not in use

---

### 📉 Resource Management

- **Throttle concurrent builds** using plugin or agent executor limits.
- **Lock critical resources** to avoid conflicts between jobs:
  ```groovy```
  lock('shared-database') {
    // Steps that require exclusive access
  }
 ```groovy```
parallel {
  stage('Frontend Tests') {
    steps {
      sh 'npm run test:frontend'
    }
  }
  stage('Backend Tests') {
    steps {
      sh 'npm run test:backend'
    }
  }
}

