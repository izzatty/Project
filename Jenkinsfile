pipeline {
    agent {
        // Use a Node image with Cypress pre-installed
        docker { 
            image 'cypress/base:20.5.0' // Node + npm
            args '-u root:root'         // run as root to avoid permission issues
        }
    }

    environment {
        BASE_URL = 'https://parabank.parasoft.com'
    }

    stages {
        stage('Checkout Code') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                echo 'Installing dependencies...'
                sh 'npm ci || npm install'
            }
        }

        stage('Run Cypress Tests') {
            steps {
                echo 'Running Cypress tests...'
                script {
                    // Run Cypress for multiple browsers if needed
                    def browsers = ['chrome', 'firefox', 'edge']
                    parallel browsers.collectEntries { browser ->
                        ["${browser}": {
                            sh """
                                npx cypress run \
                                  --browser ${browser} \
                                  --env baseUrl=${BASE_URL} \
                                  --reporter junit \
                                  --reporter-options "mochaFile=cypress/results/${browser}-results.xml"
                            """
                        }]
                    }
                }
            }
        }

        stage('Archive Test Results') {
            steps {
                junit 'cypress/results/*.xml'
            }
        }
    }

    post {
        always {
            echo 'Cleaning workspace...'
            cleanWs()
        }
        success {
            echo 'Pipeline completed successfully!'
        }
        failure {
            echo 'Pipeline failed!'
        }
    }
}
