pipeline {
    agent {
        docker {
            image 'cypress/browsers:node20.5.0-chrome112-ff112' // Node + Chrome + Firefox
            args '-u root:root' // Run as root inside container to avoid permission issues
        }
    }

    parameters {
        choice(name: 'TEST_SUITE', choices: ['smoke','regression','full'], description: 'Test Suite')
        choice(name: 'BROWSER', choices: ['chrome','firefox','edge','all'], description: 'Browser Selection')
        string(name: 'BASE_URL', defaultValue: 'https://parabank.parasoft.com', description: 'Base URL')
    }

    environment {
        CYPRESS_baseUrl = "${params.BASE_URL}"
        RESULTS_DIR = "cypress/results"
    }

    stages {
        stage('Checkout') {
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

        stage('Run Cypress Tests') {
            steps {
                script {
                    // Ensure results directory exists
                    sh "mkdir -p ${RESULTS_DIR}"

                    if (params.BROWSER == 'all') {
                        parallel(
                            chrome: { runCypress('chrome', params.TEST_SUITE) },
                            firefox: { runCypress('firefox', params.TEST_SUITE) },
                            edge: { runCypress('edge', params.TEST_SUITE) }
                        )
                    } else {
                        runCypress(params.BROWSER, params.TEST_SUITE)
                    }
                }
            }
        }
    }

    post {
        always {
            echo 'Archiving test results and cleaning workspace...'
            junit 'cypress/results/*.xml'
            cleanWs()
        }
        success { echo 'Pipeline completed successfully!' }
        failure { echo 'Pipeline failed!' }
    }
}

// Helper function to run Cypress tests
def runCypress(browser, suite) {
    echo "Running ${suite} tests on ${browser}"
    sh """
        npx cypress run \
          --browser ${browser} \
          --env suite=${suite},baseUrl=${CYPRESS_baseUrl} \
          --reporter junit \
          --reporter-options "mochaFile=${RESULTS_DIR}/${browser}-results.xml"
    """
}
