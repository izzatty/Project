pipeline {
    agent any

    parameters {
        choice(name: 'TEST_SUITE', choices: ['smoke', 'regression', 'full'], description: 'Test Suite to Execute')
        choice(name: 'BROWSER', choices: ['chrome', 'firefox', 'edge', 'all'], description: 'Browser Selection')
        string(name: 'BASE_URL', defaultValue: 'https://parabank.parasoft.com', description: 'Environment URL')
    }

    environment {
        BASE_URL = "${params.BASE_URL}"
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

        stage('Run Tests in Parallel') {
            steps {
                script {
                    // Determine which browsers to run
                    def browsers = []
                    if (params.BROWSER == 'all') {
                        browsers = ['chrome', 'firefox', 'edge']
                    } else {
                        browsers = [params.BROWSER]
                    }

                    // Prepare parallel steps
                    def parallelSteps = [:]
                    for (b in browsers) {
                        parallelSteps[b] = {
                            retry(2) { // Retry flaky tests
                                echo "Running ${params.TEST_SUITE} tests on ${b}"
                                sh """
                                    npx cypress run \
                                      --browser ${b} \
                                      --env baseUrl=${BASE_URL},suite=${params.TEST_SUITE} \
                                      --reporter junit \
                                      --reporter-options "mochaFile=cypress/results/${b}-results.xml"
                                """
                            }
                        }
                    }

                    // Execute all browsers in parallel
                    parallel parallelSteps
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
