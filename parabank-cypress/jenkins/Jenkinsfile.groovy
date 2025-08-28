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
            steps { publishHTML(...) }
        }
    }
    post { always { archiveArtifacts artifacts: 'reports/**' } }
}