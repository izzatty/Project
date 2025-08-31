// Load global trusted library
@Library('runBrowserTests') _

pipeline {
    agent none  // Keep agent none to control per-stage agents

    triggers {
        pollSCM('H/5 * * * *') // Poll repo every 5 minutes
        cron('H 2 * * *')      // Scheduled build at 2am
    }

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
                        bat "mkdir ${REPORT_DIR} ${SCREENSHOT_DIR}"
                    }
                }
            }
        }

        stage('Select Test Suite') {
            agent { label 'chrome-node' }
            steps {
                script {
                    def dayOfWeek = new Date().format('u', TimeZone.getTimeZone('Asia/Kuala_Lumpur')) as int
                    def selectedTest = (dayOfWeek >= 1 && dayOfWeek <= 5) ? 'smoke' : 'full'
                    echo "Selected test suite based on day: ${selectedTest}"

                    if (params.TEST_SUITE) {
                        selectedTest = params.TEST_SUITE
                        echo "Overriding with parameter: ${selectedTest}"
                    }

                    env.TEST_SUITE = selectedTest
                }
            }
        }

        stage('Browser Tests') {
            parallel {
                stage('Chrome') {
                    when { anyOf { expression { params.BROWSER == 'chrome' }; expression { params.BROWSER == 'all' } } }
                    agent { label 'chrome-node' }
                    steps {
                        lock(resource: 'browser-chrome', quantity: 1) {
                            retry(2) {
                                timeout(time: env.MAX_BUILD_TIME_MIN.toInteger(), unit: 'MINUTES') {
                                    runBrowserTests("chrome", env.TEST_SUITE, env.REPORT_DIR, env.SCREENSHOT_DIR, env.MAX_BUILD_TIME_MIN, params.BASE_URL)
                                }
                            }
                        }
                    }
                }

                stage('Firefox') {
                    when { anyOf { expression { params.BROWSER == 'firefox' }; expression { params.BROWSER == 'all' } } }
                    agent { label 'firefox-node' }
                    steps {
                        lock(resource: 'browser-firefox', quantity: 1) {
                            retry(2) {
                                timeout(time: env.MAX_BUILD_TIME_MIN.toInteger(), unit: 'MINUTES') {
                                    runBrowserTests("firefox", env.TEST_SUITE, env.REPORT_DIR, env.SCREENSHOT_DIR, env.MAX_BUILD_TIME_MIN, params.BASE_URL)
                                }
                            }
                        }
                    }
                }

                stage('Edge') {
                    when { anyOf { expression { params.BROWSER == 'edge' }; expression { params.BROWSER == 'all' } } }
                    agent { label 'edge-node' }
                    steps {
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
                        echo "⏱️ Skipping non-critical tests because build exceeded 30 minutes."
                    }
                }
            }
        }

        stage('Report Generation') {
            agent { label 'chrome-node' }
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
    }

    post {
        always {
            node {
                echo 'Cleaning workspace...'
                deleteDir()
            }
        }
        success {
            node {
                echo "Pipeline completed successfully!"
                emailext(
                    to: 'izzattysuaidii@gmail.com',
                    subject: "Jenkins Pipeline SUCCESS: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                    body: "Pipeline completed successfully! View details: ${env.BUILD_URL}",
                    attachLog: true
                )

                // Trigger downstream job
                build job: 'DownstreamJob', wait: false, parameters: [
                    string(name: 'UPSTREAM_BUILD', value: "${env.JOB_NAME} #${env.BUILD_NUMBER}")
                ]
            }
        }
        unstable {
            node {
                echo "Pipeline completed with test failures (UNSTABLE)."
                emailext(
                    to: 'izzattysuaidii@gmail.com',
                    subject: "Jenkins Pipeline UNSTABLE: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                    body: "Pipeline completed with test failures. View details: ${env.BUILD_URL}",
                    attachmentsPattern: "${SCREENSHOT_DIR}/**/*.png",
                    attachLog: true
                )
            }
        }
        failure {
            node {
                echo "Pipeline failed."
                emailext(
                    to: 'izzattysuaidii@gmail.com',
                    subject: "Jenkins Pipeline FAILURE: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                    body: "Pipeline failed. View details: ${env.BUILD_URL}",
                    attachmentsPattern: "${SCREENSHOT_DIR}/**/*.png",
                    attachLog: true
                )
            }
        }
    }
}
