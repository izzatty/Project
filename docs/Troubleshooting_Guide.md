# Troubleshooting Guide

This guide covers common issues and solutions during Jenkins pipeline execution.

## 1. Git Checkout Issues
**Problem:** `Unable to find Jenkinsfile from git`
**Solution:** Ensure `Jenkinsfile` exists in the branch and path specified in pipeline configuration.

## 2. Report Publishing
**Problem:** Workspace issues
**Solution:**
- Use "cleanWs()" before build

## 3. Flaky test
**Problem:** Timing issues
**Solution:**
- Implement dynamic waits + retry

## 4. Agent Connection Problems
**Problem:** Docker agent cannot connect to master.
**Solution:** 
- Verify JNLP inbound connection
- Ensure Docker network allows communication
- Check firewall settings

## 5. Node.js / Cypress Issues
**Problem:** `npm install` or `npx cypress run` fails
**Solution:**
- Ensure Node.js installed and PATH configured
- Run `npm install` locally to verify dependencies
- Use `bat` or `sh` commands correctly for your OS

## 6. Parallel Execution Errors
**Problem:** Tests fail due to resource conflicts
**Solution:**
- Configure proper agent labels
- Use `lock` to avoid concurrent resource usage