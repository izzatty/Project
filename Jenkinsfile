@Library('runBrowserTests') _

pipeline {
    agent none

    triggers {
        pollSCM('H/5 * * * *')
        cron('H 2 * * *')
    }

    parameters {
        choice(
            name: 'TEST_SUITE',
            choices: ['smoke', 'regression'],
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
            agent { label 'chrome-node' }
            steps {
                echo "Starting build pipeline..."
            }
        }

        stage('Environment Preparation') {
            agent { label 'chrome-node' }
            steps {
                echo "Preparing environment for ${params.BASE_URL}"
                script {
                    if (isUnix()) {
                        sh "mkdir -p ${REPORT_DIR} ${SCREENSHOT_DIR}"
                    } else {
                        bat "if not exist ${REPORT_DIR} mkdir ${REPORT_DIR}"
                        bat "if not exist ${SCREENSHOT_DIR} mkdir ${SCREENSHOT_DIR}"
                    }
                }
            }
        }

        stage('Determine Test Suite') {
            agent { label 'chrome-node' }
            steps {
                script {
                    def dayOfWeek = new Date().format('u', TimeZone.getTimeZone('Asia/Kuala_Lumpur')) as int
                    def selectedTest = (dayOfWeek >= 1 && dayOfWeek <= 5) ? 'smoke' : 'regression'
                    if (params.TEST_SUITE) {
                        selectedTest = params.TEST_SUITE
                    }
                    echo "Selected test suite: ${selectedTest}"
                    env.TEST_SUITE = selectedTest
                }
            }
        }

        stage('Browser Tests') {
            steps {
                script {
                    def branches = [:]

                    if (params.BROWSER == 'chrome' || params.BROWSER == 'all') {
                        branches['Chrome'] = {
                            node('chrome-node') {
                                lock(resource: 'browser-chrome', quantity: 1) {
                                    retry(2) {
                                        timeout(time: env.MAX_BUILD_TIME_MIN.toInteger(), unit: 'MINUTES') {
                                            runBrowserTests("chrome", env.TEST_SUITE, env.REPORT_DIR, env.SCREENSHOT_DIR, env.MAX_BUILD_TIME_MIN, params.BASE_URL)
                                        }
                                    }
                                }
                            }
                        }
                    }

                    if (params.BROWSER == 'firefox' || params.BROWSER == 'all') {
                        branches['Firefox'] = {
                            node('firefox-node') {
                                lock(resource: 'browser-firefox', quantity: 1) {
                                    retry(2) {
                                        timeout(time: env.MAX_BUILD_TIME_MIN.toInteger(), unit: 'MINUTES') {
                                            runBrowserTests("firefox", env.TEST_SUITE, env.REPORT_DIR, env.SCREENSHOT_DIR, env.MAX_BUILD_TIME_MIN, params.BASE_URL)
                                        }
                                    }
                                }
                            }
                        }
                    }

                    if (params.BROWSER == 'edge' || params.BROWSER == 'all') {
                        branches['Edge'] = {
                            node('edge-node') {
                                lock(resource: 'browser-edge', quantity: 1) {
                                    retry(2) {
                                        timeout(time: env.MAX_BUILD_TIME_MIN.toInteger(), unit: 'MINUTES') {
                                            runBrowserTests("edge", env.TEST_SUITE, env.REPORT_DIR, env.SCREENSHOT_DIR, env.MAX_BUILD_TIME_MIN, params.BASE_URL)
                                        }
                                    }
                                }
                            }
                        }
                    }

                    parallel branches
                }
            }
        }
        stage('Non-Critical Tests') {
            agent { label 'chrome-node' }
            steps {
                script {
                    try {
                        echo "Running non-critical tests..."
                        if (isUnix()) {
                            sh './run-noncritical-tests.sh'
                        } else {
                            bat 'run-noncritical-tests.bat'
                        }
                    } catch (org.jenkinsci.plugins.workflow.steps.FlowInterruptedException e) {
                        echo "⏱️ Skipping non-critical tests (timeout)."
                    }
                }
            }
        }

        stage('Report Generation') {
            agent { label 'chrome-node' }
            steps {
                echo "Publishing JUnit results"
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
    }

    post {
        always {
            echo 'Cleaning workspace...'
            deleteDir()
        }
        success {
            echo "Pipeline completed successfully!"
            emailext(
                to: 'izzattysuaidii@gmail.com',
                subject: "SUCCESS: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                body: "Pipeline completed successfully. Details: ${env.BUILD_URL}",
                attachLog: true
            )
        }
        unstable {
            echo "Pipeline completed with test failures (UNSTABLE)."
            emailext(
                to: 'izzattysuaidii@gmail.com',
                subject: "UNSTABLE: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                body: "Pipeline completed with test failures. Details: ${env.BUILD_URL}",
                attachmentsPattern: "${SCREENSHOT_DIR}/**/*.png",
                attachLog: true
            )
        }
        failure {
            echo "Pipeline failed."
            emailext(
                to: 'izzattysuaidii@gmail.com',
                subject: "FAILURE: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                body: "Pipeline failed. Details: ${env.BUILD_URL}",
                attachmentsPattern: "${SCREENSHOT_DIR}/**/*.png",
                attachLog: true
            )
        }
    }
}
