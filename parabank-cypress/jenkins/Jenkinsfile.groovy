pipeline {
    agent any
    stages {
        stage('Checkout') {
            steps {
                git url: 'https://github.com/izzatty/Project.git', branch: 'main'
            }
        }
        stage('Install Dependencies') {
            steps { sh 'npm ci' }
        }
        stage('Run Tests') {
            steps { sh 'npx jest' }
        }
        stage('Publish Reports') {
            steps {
                publishHTML([
                    allowMissing: false,
                    alwaysLinkToLastBuild: true,
                    keepAll: true,
                    reportDir: 'reports',
                    reportFiles: 'index.html',
                    reportName: 'Test Report'
                ])
            }
        }
    }
    post {
        always { archiveArtifacts artifacts: 'reports/**' }
    }
}