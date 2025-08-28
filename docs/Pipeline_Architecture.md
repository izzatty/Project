### **2. Pipeline_Architecture.md**
```markdown
# Pipeline Architecture Document

This document explains the architecture and design decisions of the Jenkins pipeline for ParaBank automation.

## 1. Pipeline Overview
The pipeline follows a **declarative multi-stage structure**:
- **Environment Setup**
- **Checkout Code**
- **Install Dependencies**
- **Run Cypress Tests** (Parallel: Chrome, Firefox, Edge)
- **Build**
- **Deploy**
- **Archive & Reports**

## 2. Parameters
- `TEST_SUITE` → smoke, regression, full
- `BROWSER` → chrome, firefox, edge
- `BASE_URL` → environment URL (dev/staging/prod)

## 3. Parallel Execution
- Cypress tests run simultaneously across multiple browsers.
- Locking mechanism ensures isolated resource usage per agent.

## 4. Error Handling
- Retry flaky tests up to 2 times
- Conditional logic skips non-critical tests if build exceeds 30 minutes
- Workspace cleaned up post-build

## 5. Reporting
- Cypress screenshots and videos archived
- HTML reports generated with `publishHTML`
- Performance metrics and build badges generated

## 6. Scalability
- Modular folder-based structure in Jenkins for multiple projects
- Easy to add new agents and pipelines for additional teams or features