// Load global trusted library
@Library('runBrowserTests') _

pipeline {
    // Dynamic resource management: allocate agent based on TEST_SUITE
    agent {
        label { 
            return params.TEST_SUITE == 'full' ? 'high-memory' : 'lightweight'
        }
    }

    triggers {
        pollSCM('H/5 * * * *') // Simulated webhook
        cron('H 2 * * *')      // Scheduled build
    }

    parameters {
        choice(
            name: 'TEST_SUITE',
            choices: ['smoke', 'full'],
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
        timeout(time: 45, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '15'))
        timestamps()
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
                sh "mkdir -p ${REPORT_DIR} ${SCREENSHOT_DIR}"
            }
        }

        stage('Test Execution') {
            steps {
                script {
                    // Challenge 1: Smart test selection (Mon–Fri smoke, Sat–Sun full)
                    def dayOfWeek = new Date().format('u', TimeZone.getTimeZone('Asia/Kuala_Lumpur')).toInteger()
                    def selectedTest = (dayOfWeek >= 1 && dayOfWeek <= 5) ? 'smoke' : 'full'
                    echo "Selected test suite based on day: ${selectedTest}"

                    // Override with parameter if user manually selected
                    if (params.TEST_SUITE) {
                        selectedTest = params.TEST_SUITE
                        echo "Overriding with parameter: ${selectedTest}"
                    }

                    // Choose browsers
                    def targetBrowsers = params.BROWSER == 'all' ? ['chrome', 'firefox', 'edge'] : [params.BROWSER]

                    // Run tests in parallel with retries + timeout
                    def branches = targetBrowsers.collectEntries { browser ->
                        ["${browser}": {
                            retry(2) {  // Retry failed tests up to 2 times
                                timeout(time: env.MAX_BUILD_TIME_MIN.toInteger(), unit: 'MINUTES') {
                                    runBrowserTests(
                                        browser,
                                        selectedTest,
                                        env.REPORT_DIR,
                                        env.SCREENSHOT_DIR,
                                        env.MAX_BUILD_TIME_MIN,
                                        params.BASE_URL
                                    )
                                }
                            }
                        }]
                    }

                    parallel branches
                }
            }
        }

        stage('Report Generation') {
            steps {
                echo "Publishing JUnit test results"
                junit allowEmptyResults: true, testResults: "${REPORT_DIR}/**/*.xml"

                echo "Publishing HTML reports"
                publishHTML(target: [
                    allowMissing: true,
                    alwaysLinkToLastBuild: true,
                    keepAll: true,
                    reportDir: "${REPORT_DIR}",
                    reportFiles: 'index.html',
                    reportName: 'Browser Test Report'
                ])

                echo "Archiving screenshots"
                archiveArtifacts artifacts: "${SCREENSHOT_DIR}/**/*.png", allowEmptyArchive: true
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
                attachmentsPattern: "${SCREENSHOT_DIR}/**/*.png",
                attachLog: true
            )
        }
        failure {
            echo "Pipeline failed."
            emailext(
                to: 'izzattysuaidii@gmail.com',
                subject: "Jenkins Pipeline FAILURE: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                body: "Pipeline failed. View details: ${env.BUILD_URL}",
                attachmentsPattern: "${SCREENSHOT_DIR}/**/*.png",
                attachLog: true
            )
        }
        cleanup {
            echo 'Cleaning up workspace after pipeline completes...'
            deleteDir()
        }
    }
}
