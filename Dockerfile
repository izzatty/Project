# Base image
FROM jenkins/jenkins:lts

# Switch to root to install Docker CLI
USER root

# Update packages and install Docker CLI
RUN apt-get update && \
    apt-get install -y docker.io && \
    usermod -aG docker jenkins

# Switch back to Jenkins user
USER jenkins