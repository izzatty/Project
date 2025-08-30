// Load global trusted library
@Library('runBrowserTests') _ 

pipeline {
    agent any

    // Build Triggers
    triggers {
        pollSCM('H/5 * * * *') // Simulated webhook
        cron('H 2 * * *') // Scheduled build
    }

    // Parameterized Manual Trigger
    parameters {
        choice(
            name: 'TEST_SUITE',
            choices: ['smoke', 'full regression'],
            description: 'Test suite to execute'
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

    environment {
        REPORT_DIR = 'reports'
        SCREENSHOT_DIR = 'screenshots'
        MAX_BUILD_TIME_MIN = 30
    }

    options {
        timeout(time: 45, unit: 'MINUTES') // Auto-abort long builds
        buildDiscarder(logRotator(numToKeepStr: '15')) // Keep last 15 builds
        timestamps() // Add timestamps in console logs
    }

    stages {
        stage('Build') {
            steps {
                echo "Starting build pipeline..."
            }
        }

        stage('Environment Preparation') {
            steps {
                echo "Preparing environment for ${params.BASE_URL}"
                bat "mkdir -p ${REPORT_DIR} ${SCREENSHOT_DIR}"
            }
        }

        stage('Test Execution') {
            failFast true
            parallel {
                stage('Dynamic Browser Tests') {
                    steps {
                        script {
                            // Determine day of week (1=Mon, 7=Sun)
                            def dayOfWeek = new Date().format('u', TimeZone.getTimeZone('Asia/Kuala_Lumpur')).toInteger()
                    
                            // Smart test selection
                            def selectedTest = (dayOfWeek >= 1 && dayOfWeek <= 5) ? 'smoke' : 'full'
                            echo "Selected test suite based on day: ${selectedTest}"

                            // Map browsers to agent labels
                            def browserAgentMap = [
                                chrome: 'agent-chrome',
                                firefox: 'agent-firefox',
                                edge: 'agent-edge'
                            ]

                            // Determine target browsers
                            def targetBrowsers = params.BROWSER == 'all' ? ['chrome', 'firefox', 'edge'] : [params.BROWSER]

                            targetBrowsers.each { browser ->
                                // Lock per browser to avoid simultaneous access
                                 retry(2) { // Retry flaky tests twice
                                    lock(resource: "browser-${browser}", inversePrecedence: true) {
                                        node(browserAgentMap[browser]) {
                                            // Lock global resource for heavy tests
                                            if (selectedTest == 'full') {
                                                lock(resource: 'heavy-test-slot', quantity: 2) { // max 2 full tests at a time
                                                    runBrowserTests(browser, selectedTest, REPORT_DIR, SCREENSHOT_DIR, MAX_BUILD_TIME_MIN, params.BASE_URL)
                                                    }
                                                } else {
                                                    runBrowserTests(browser, selectedTest, REPORT_DIR, SCREENSHOT_DIR, MAX_BUILD_TIME_MIN, params.BASE_URL)
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }

            stage('Report Generation') {
                steps {
                    echo "Publishing JUnit test results"
                    junit allowEmptyResults: true, testResults: "${REPORT_DIR}/*.xml"

                    echo "Publishing HTML report"
                    publishHTML([
                        allowMissing: true,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: "${REPORT_DIR}",
                        reportFiles: 'index.html',
                        reportName: 'HTML Report'
                    ])

                    echo "Archiving screenshots"
                    archiveArtifacts artifacts: "${SCREENSHOT_DIR}/*.png", allowEmptyArchive: true
                }
            }

            stage('Cleanup') {
                steps {
                    echo 'Cleaning workspace will be done in post.cleanup'
                }
            }
        }

        post {
            always {
                echo 'This runs regardless of pipeline success/failure.'
            }
            success {
                echo "Pipeline completed successfully!"
                emailext(
                    to: 'izzattysuaidii@gmail.com',
                    subject: "Jenkins Pipeline SUCCESS: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                    body: "Pipeline completed successfully! View details: ${env.BUILD_URL}",
                    attachLog: true
                )
                build job: 'DownstreamJob', wait: false, parameters: [
                    string(name: 'UPSTREAM_BUILD', value: "${env.JOB_NAME} #${env.BUILD_NUMBER}")
            ]
        }
        unstable {
            echo "Pipeline completed with test failures (UNSTABLE)."
            emailext(
                to: 'izzattysuaidii@gmail.com',
                subject: "Jenkins Pipeline UNSTABLE: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                body: "Pipeline completed with test failures. View details: ${env.BUILD_URL}",
                attachmentsPattern: "${SCREENSHOT_DIR}/*.png",
                attachLog: true
            )
        }
        failure {
            echo "Pipeline failed."
            emailext(
                to: 'izzattysuaidii@gmail.com',
                subject: "Jenkins Pipeline FAILURE: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                body: "Pipeline failed. View details: ${env.BUILD_URL}",
                attachmentsPattern: "${SCREENSHOT_DIR}/*.png",
                attachLog: true
            )
        }
        cleanup {
            echo 'Cleaning up workspace after pipeline completes...'
            deleteDir()
        }
    }
}
