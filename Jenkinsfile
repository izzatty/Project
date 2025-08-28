pipeline {
    agent any

    parameters {
        choice(choices: ['smoke', 'regression', 'full'], description: 'Test Suite to Execute', name: 'TEST_SUITE')
        choice(choices: ['chrome', 'firefox', 'edge'], description: 'Browser Selection', name: 'BROWSER')
        string(defaultValue: 'https://parabank.parasoft.com', description: 'Environment URL', name: 'BASE_URL')
    }

    environment {
        NODE_HOME = 'C:\\Program Files\\nodejs'
        PATH = "${env.NODE_HOME}:${env.PATH}"
        REPORT_DIR = "reports"
    }

    options {
        timeout(time: 60, unit: 'MINUTES')   // overall pipeline timeout
        buildDiscarder(logRotator(numToKeepStr: '10')) // keep last 10 builds
    }

    stages {

        stage('Environment Setup') {
            steps {
                echo "Preparing environment for ${params.BASE_URL}"
                script {
                    if (params.BASE_URL.contains('staging')) {
                        echo "Staging environment setup"
                    } else if (params.BASE_URL.contains('prod')) {
                        echo "Production environment setup"
                    } else {
                        echo "Default environment setup"
                    }
                }
            }
        }

        stage('Checkout Code') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/izzatty/Project',
                    credentialsId: 'a2b5c49d-38be-4cff-a536-2b2e6a6f01d3'
            }
        }

        stage('Install Dependencies') {
            steps {
                echo 'Installing Node.js dependencies...'
            sh 'npm install'
            }
        }


        stage('Run Cypress Tests') {
            parallel {
                stage('Chrome Tests') {
                    when { expression { params.BROWSER == 'chrome' || params.BROWSER == 'all' } }
                    steps {
                        script {
                            retry(2) {  // retry flaky tests up to 2 times
                                echo "Running ${params.TEST_SUITE} tests on Chrome"
                                bat "npx cypress run --browser chrome --env BASE_URL=${params.BASE_URL} --spec \"cypress/e2e/**/*.cy.js\""
                            }
                        }
                    }
                }
                stage('Firefox Tests') {
                    when { expression { params.BROWSER == 'firefox' || params.BROWSER == 'all' } }
                    steps {
                        script {
                            retry(2) {
                                echo "Running ${params.TEST_SUITE} tests on Firefox"
                                bat "npx cypress run --browser firefox --env BASE_URL=${params.BASE_URL} --spec \"cypress/e2e/**/*.cy.js\""
                            }
                        }
                    }
                }
                stage('Edge Tests') {
                    when { expression { params.BROWSER == 'edge' || params.BROWSER == 'all' } }
                    steps {
                        script {
                            retry(2) {
                                echo "Running ${params.TEST_SUITE} tests on Edge"
                                bat "npx cypress run --browser edge --env BASE_URL=${params.BASE_URL} --spec \"cypress/e2e/**/*.cy.js\""
                            }
                        }
                    }
                }
            }
        }

        stage('Build') {
            steps {
                echo "Building the project..."
                // bat 'npm run build'  // add your real build script if needed
            }
        }

        stage('Deploy') {
            steps {
                echo "Deploying the application..."
                // bat 'npm run deploy' // add your real deploy script
            }
        }

        stage('Archive & Reports') {
            steps {
                echo "Publishing test reports and screenshots"
                // Archive Cypress screenshots and videos
                archiveArtifacts artifacts: 'cypress/screenshots/**/*.*', allowEmptyArchive: true
                archiveArtifacts artifacts: 'cypress/videos/**/*.*', allowEmptyArchive: true

                // Publish HTML report (requires HTML Publisher plugin)
                publishHTML(target: [
                    allowMissing: true,
                    alwaysLinkToLastBuild: true,
                    keepAll: true,
                    reportDir: "${REPORT_DIR}",
                    reportFiles: 'index.html',
                    reportName: 'Cypress Test Report'
                ])
            }
        }

    }

    post {
        always {
            echo "Cleaning up workspace..."
            cleanWs() // remove temp files after each build
        }
        success {
            echo "Pipeline succeeded!"
            // slackSend or email notifications can go here
        }
        failure {
            echo "Pipeline failed!"
            // send failure notifications with details
        }
    }
}
