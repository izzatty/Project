pipeline {
    agent {
        docker {
            image 'cypress/browsers:node20.5.0-chrome112-ff112'
            args '-u root:root'
        }
    }

    parameters {
        choice(name: 'TEST_SUITE', choices: ['smoke','regression','full'], description: 'Test Suite')
        choice(name: 'BROWSER', choices: ['chrome','firefox','edge','all'], description: 'Browser Selection')
        string(name: 'BASE_URL', defaultValue: 'https://parabank.parasoft.com', description: 'Base URL')
    }

    stages {
        stage('Checkout') {
            steps { git branch: 'main', url: 'https://github.com/izzatty/Project.git' }
        }

        stage('Install Dependencies') {
            steps { sh 'npm ci || npm install' }
        }

        stage('Run Tests') {
            steps {
                script {
                    if (params.BROWSER == 'all') {
                        parallel(
                            chrome: { runCypress('chrome') },
                            firefox: { runCypress('firefox') },
                            edge: { runCypress('edge') }
                        )
                    } else {
                        runCypress(params.BROWSER)
                    }
                }
            }
        }
    }

    post {
        always { cleanWs() }
    }
}

def runCypress(browser) {
    sh "npx cypress run --browser ${browser} --reporter junit --reporter-options 'mochaFile=results/${browser}-results.xml'"
}
