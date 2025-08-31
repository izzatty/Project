pipeline {
    agent any
    stages {
        stage('Test Git') {
            steps {
                git branch: 'main', url: 'https://github.com/your-repo.git'
            }
        }
    }
}
