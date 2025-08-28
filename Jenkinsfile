pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/izzatty/Project',
                    credentialsId: 'a2b5c49d-38be-4cff-a536-2b2e6a6f01d3'
            }
        }
        stage('Build') {
            steps {
                echo 'Building the project...'
                // e.g., sh './scripts/build.sh'
            }
        }
        stage('Test') {
            steps {
                echo 'Running tests...'
                // e.g., sh './scripts/test.sh'
            }
        }
        stage('Deploy') {
            steps {
                echo 'Deploying...'
                // e.g., sh './scripts/deploy.sh'
            }
        }
    }
}