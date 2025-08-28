# ParaBank Cypress Automation

This repository contains the QA Automation Assessment implementation for ParaBank using **Cypress**.  
All tasks from **2.1 → 2.4** are implemented and mapped to test files below.

---

## 📂 Task Summary

| Task | Requirement | Implementation File(s) |
|------|-------------|--------------------------|
| **2.1 Dynamic Element Handling** | Handle dynamic accounts, transaction IDs, flexible locators, and state-dependent testing | `accountDynamic.cy.js`, `transactionsDynamic.cy.js` |
| **2.2 Data-Driven Test Architecture** | External test data, environment configs, user persona execution | `loginDynamic.cy.js` + `cypress/fixtures/users.json` |
| **2.3 Cross-Browser Desktop Testing** | Run on Chrome, Firefox, Edge with viewport variations and perf tracking | `crossBrowserAdvanced.cy.js` |
| **2.4 Error Recovery & Self-Healing** | Recover from popups, session timeouts, retries, cleanup | Helpers in `cypress/support/commands.js` used across tests |

---

## ✅ Detailed Implementations

### **2.1 Dynamic Element Handling**
- **Files:** `accountDynamic.cy.js`, `transactionsDynamic.cy.js`
- **Highlights:**
  - Dynamic waits using `cy.get('body').then(...)`
  - Flexible locators for dynamic account numbers and transactions
  - State-dependent testing (handles empty vs. populated accounts)

---

### **2.2 Data-Driven Test Architecture**
- **File:** `loginDynamic.cy.js`  
- **Data Source:** `cypress/fixtures/users.json`
- **Highlights:**
  - Fixture-driven login for multiple personas (valid, invalid, edge cases)
  - Automatic logout/reset between test sessions
  - Easily extendable for environment-specific test data

---

### **2.3 Cross-Browser Desktop Testing**
- **File:** `crossBrowserAdvanced.cy.js`
- **Highlights:**
  - Same test suite validated on **Chrome, Firefox, Edge**
  - Tests adapt to multiple viewport sizes (1920x1080, 1366x768, 1280x720)
  - Performance timing metrics collected
  - Handles minor browser-specific behavior

---

### **2.4 Error Recovery & Self-Healing Tests**
- **File(s):** `errorRecovery.cy.js` + helpers in `cypress/support/commands.js`
- **Highlights:**
  - **Self-healing login** (`cy.ensureLoggedIn`)
  - **Retry helpers** (`cy.retryClick`, `cy.submitWithRetry`)
  - Handles unexpected popup dialogs (alerts/confirm)
  - Graceful session timeout handling
  - Cleanup after failures (`cy.cleanupSession`)

---

## 🛠 How to Run

1. Clone the repo:
   ```bash
   git clone https://github.com/<your-username>/parabank-cypress.git
   cd parabank-cypress
   ```

2. Install dependencies 
    ```bash
   npm install
   ```

3. Run Cypress tests
    ```bash
    npx cypress open   # Interactive mode
    npx cypress run    # Headless mode
    ```

4. Cross-browser execution example
    ```bash
    npx cypress run --browser chrome
    npx cypress run --browser firefox
    npx cypress run --browser edge 
    ```