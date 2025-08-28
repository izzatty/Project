pipeline {
    agent any

    parameters {
        choice(
            name: 'TEST_SUITE',
            choices: ['smoke', 'regression', 'full'],
            description: 'Test Suite to Execute'
        )
        choice(
            name: 'BROWSER',
            choices: ['chrome', 'firefox', 'edge'],
            description: 'Browser Selection'
        )
        string(
            name: 'BASE_URL',
            defaultValue: 'https://parabank.parasoft.com',
            description: 'Environment URL'
        )
    }

    stages {
        stage('Environment Setup') {
            steps {
                echo "Preparing environment for ${params.BASE_URL}"
                script {
                    if (params.BASE_URL.contains('staging')) {
                        echo "Staging-specific setup"
                    } else if (params.BASE_URL.contains('prod')) {
                        echo "Production-specific setup"
                    } else {
                        echo "Default environment setup"
                    }
                }
            }
        }

        stage('Checkout Code') {
            steps {
                git branch: 'main', url: 'https://github.com/izzatty/Project.git'
            }
        }

        stage('Install Dependencies') {
            steps {
                nodejs(nodeJSInstallationName: 'Node24') {
                sh 'npm install'
            }
        }

        stage('Run Cypress Tests') {
            parallel {
                stage('Chrome Tests') {
                    when { expression { params.BROWSER == 'chrome' || params.BROWSER == 'all' } }
                    steps {
                        sh "npx cypress run --browser chrome --env suite=${params.TEST_SUITE},baseUrl=${params.BASE_URL}"
                    }
                }
                stage('Firefox Tests') {
                    when { expression { params.BROWSER == 'firefox' || params.BROWSER == 'all' } }
                    steps {
                        sh "npx cypress run --browser firefox --env suite=${params.TEST_SUITE},baseUrl=${params.BASE_URL}"
                    }
                }
                stage('Edge Tests') {
                    when { expression { params.BROWSER == 'edge' || params.BROWSER == 'all' } }
                    steps {
                        sh "npx cypress run --browser edge --env suite=${params.TEST_SUITE},baseUrl=${params.BASE_URL}"
                    }
                }
            }
        }

        stage('Archive & Reports') {
            steps {
                echo 'Archiving test reports...'
                publishHTML([
                    allowMissing: true,              // FIXED
                    alwaysLinkToLastBuild: true,
                    keepAll: true,
                    reportDir: 'cypress/reports/html',
                    reportFiles: 'index.html',
                    reportName: 'Cypress Test Report'
                ])
                junit 'cypress/results/*.xml'
                archiveArtifacts artifacts: 'cypress/screenshots/**, cypress/videos/**', allowEmptyArchive: true
            }
        }
    }

    post {
        always {
            echo 'Cleaning up workspace...'
            cleanWs()
        }
        failure {
            echo 'Pipeline failed!'
        }
        success {
            echo 'Pipeline completed successfully!'
        }
    }
}
