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
            choices: ['chrome', 'firefox', 'edge', 'all'],
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
                echo 'Installing dependencies...'
                sh 'npm ci || npm install'
            }
        }

        stage('Run Tests') {
            steps {
                script {
                    if (params.BROWSER == 'all') {
                        parallel(
                            chrome: { runCypress('chrome', params.TEST_SUITE, params.BASE_URL) },
                            firefox: { runCypress('firefox', params.TEST_SUITE, params.BASE_URL) },
                            edge: { runCypress('edge', params.TEST_SUITE, params.BASE_URL) }
                        )
                    } else {
                        runCypress(params.BROWSER, params.TEST_SUITE, params.BASE_URL)
                    }
                }
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

//
// Helper function to run Cypress with proper args
//
def runCypress(browser, suite, baseUrl) {
    echo "Running ${suite} tests on ${browser} at ${baseUrl}"
    sh """
        npx cypress run \
          --browser ${browser} \
          --env suite=${suite},baseUrl=${baseUrl} \
          --reporter junit \
          --reporter-options "mochaFile=cypress/results/${browser}-results.xml"
    """
}