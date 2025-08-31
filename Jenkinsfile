pipeline {
    agent { label 'agent-chrome' }

    stages {
        stage('Check Git Version') {
            steps {
                sh 'git --version'   // For Linux agents
                bat 'git --version'  // For Windows agents
            }
        }
    }
}
