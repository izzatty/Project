pipeline {
    agent {
        docker {
            image 'cypress/included:15.0.0'   // Cypress with Node + Chrome + Firefox preinstalled
            args '-u root:root'               // run as root to avoid permission issues
        }
    }
    
    // Build triggers: poll SCM (simulates webhook) + cron
    triggers {
        pollSCM('H/5 * * * *')   // polling every 5 minutes (simulates webhook)
        // cron('H 2 * * *')     // example scheduled run at ~2AM daily 
    }

    // Parameters (parameterized manual triggers)
    parameters {
        choice(name: 'TEST_SUITE', choices: ['smoke', 'regression', 'full'], description: 'Test suite to execute')
        choice(name: 'BROWSER', choices: ['all', 'chrome', 'firefox', 'edge'], description: 'Browser Selection')
        string(name: 'BASE_URL', defaultValue: 'https://parabank.parasoft.com', description: 'Environment URL')
    }

    environment {
        REPORT_DIR      = 'reports'
        SCREENSHOT_DIR  = 'screenshots'
    }

    stages {
        stage('Environment Preparation') {
            steps {
                script {
                    echo "Preparing environment for ${params.BASE_URL}"
                    if (params.BASE_URL.contains('staging')) {
                        echo "Applying staging-specific setup..."
                    } else if (params.BASE_URL.contains('prod')) {
                        echo "Applying production-specific setup (be careful!)"
                    } else {
                        echo "Default/dev setup"
                    }

                    sh """
                        mkdir -p ${env.REPORT_DIR}
                        mkdir -p ${env.SCREENSHOT_DIR}
                    """
                }
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm ci'
            }
        }

        stage('Test Execution (parallel browsers)') {
            steps {
                script {
                    def browsers = []
                    if (params.BROWSER == 'all') {
                        browsers = ['chrome', 'firefox', 'edge']
                    } else {
                        browsers = [params.BROWSER]
                    }

                    def branches = [:]
                    for (b in browsers) {
                        def browser = b
                        branches[browser] = {
                            catchError(buildResult: 'UNSTABLE', stageResult: 'FAILURE') {
                                retry(2) {
                                    echo "Starting Cypress tests for ${browser} (suite=${params.TEST_SUITE})"
                                    sh """
                                        mkdir -p ${env.REPORT_DIR}/${browser}
                                        mkdir -p ${env.SCREENSHOT_DIR}/${browser}

                                        npx cypress run \
                                          --browser ${browser} \
                                          --env baseUrl=${params.BASE_URL},suite=${params.TEST_SUITE} \
                                          --reporter mocha-junit-reporter \
                                          --reporter-options mochaFile=${env.REPORT_DIR}/${browser}/results.xml,attachments=true \
                                          --config screenshotsFolder=${env.SCREENSHOT_DIR}/${browser},videosFolder=${env.SCREENSHOT_DIR}/${browser}
                                    """
                                }
                            }
                        }
                    }
                    parallel branches
                }
            }
        }

        stage('Extended Tests (optional)') {
            when {
                anyOf {
                    expression { params.TEST_SUITE == 'regression' }
                    expression { params.TEST_SUITE == 'full' }
                }
            }
            steps {
                script {
                    echo "Running extended tests because TEST_SUITE=${params.TEST_SUITE}"
                }
            }
        }

        stage('Report Generation & Archival') {
            steps {
                script {
                    echo "Collecting and publishing test results (JUnit)..."
                    junit allowEmptyResults: true, testResults: "${env.REPORT_DIR}/**/*.xml"

                    echo "Publishing HTML reports..."
                    publishHTML(target: [
                        allowMissing: true,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: "${env.REPORT_DIR}",
                        reportFiles: "report_*.html",
                        reportName: "Automated Test Reports"
                    ])

                    echo "Archiving screenshots..."
                    archiveArtifacts artifacts: "${env.SCREENSHOT_DIR}/**/*.*", allowEmptyArchive: true
                }
            }
        }

        stage('Cleanup (preserve build artifacts)') {
            steps {
                echo "Workspace cleanup will run in post-cleanup step to preserve archived artifacts for Jenkins UI."
            }
        }
    } 

    post {
            always {
                junit 'reports/**/*.xml'
            }

        success {
            echo "Post: success — sending success email and triggering downstream job."

            // Email to configured recipients (requires email-ext plugin + global SMTP configured)
            emailext (
                to: 'izzattysuaidii@gmail.com',
                subject: "SUCCESS: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                body: """<p>Build succeeded.</p>
                         <p>Build: <a href='${env.BUILD_URL}'>${env.BUILD_URL}</a></p>
                         <p>Reports: see the 'Test Result Trend' and 'HTML Report' links on this build.</p>""",
                attachLog: true
            )

            build job: 'DownstreamJob', wait: false, 
                parameters: [string(name: 'UPSTREAM_BUILD', value: "${env.JOB_NAME} #${env.BUILD_NUMBER}")]
        }

        unstable {
            echo "Post: unstable — send an email with attachments (screenshots) and keep history for trend analysis."
            emailext (
                to: 'izzattysuaidii@gmail.com',
                subject: "UNSTABLE: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                body: "Build is UNSTABLE. Check ${env.BUILD_URL}. Screenshots and logs archived.",
                attachmentsPattern: "${env.SCREENSHOT_DIR}/**/*.*",
                attachLog: true
            )
        }

        failure {
            echo "Post: failure — sending failure email & cleanup."
            emailext (
                to: 'izzattysuaidii@gmail.com',
                subject: "FAILURE: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                body: "Build FAILED. See ${env.BUILD_URL} for console output. Artifacts/screenshots archived if available.",
                attachmentsPattern: "${env.SCREENSHOT_DIR}/**/*.*",
                attachLog: true
            )
        }

        cleanup {
            echo "Post: cleanup — cleaning workspace to free space (reports and artifacts remain available via Jenkins UI)."
            cleanWs()
        }
    }
}
