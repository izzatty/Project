@Library('runBrowserTests') _

pipeline {
    agent none // globally none; agents are defined per stage

    triggers {
        pollSCM('H/5 * * * *')
        cron('H 2 * * *')
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
        PERF_DIR = 'performance'
        MAX_BUILD_TIME_MIN = 30
    }

    options {
        timeout(time: 45, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '15'))
        timestamps()
    }

    stages {
        stage('Checkout') {
            agent { label 'chrome-node' }
            steps {
                script {
                    // Force Git to use system default to avoid tool mismatch errors
                    checkout([
                        $class: 'GitSCM',
                        branches: [[name: "*/main"]],
                        userRemoteConfigs: [[url: "https://github.com/izzatty/Project.git"]],
                        extensions: []
                    ])
                }
            }
        }

        //stage('Debug') {
           // agent { label 'chrome-node' }
          //  steps {
             //   script {
              //      echo "isUnix() = ${isUnix()}"
                //    if (isUnix()) {
                //        sh 'uname -a'
                //        sh 'which git'
                //    } else {
                //        bat 'ver'
                //        bat 'where git'
                //    }
               // }
            }
        }

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
                bat """
                    if not exist ${REPORT_DIR} mkdir ${REPORT_DIR}
                    if not exist ${SCREENSHOT_DIR} mkdir ${SCREENSHOT_DIR}
                    if not exist ${PERF_DIR} mkdir ${PERF_DIR}
                """
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
                    env.TEST_SUITE = selectedTest ?: 'smoke'
                    echo "Selected test suite: ${env.TEST_SUITE}"
                }
            }
        }

        stage('Browser Tests') {
            agent { label 'chrome-node' }
            steps {
                retry(2) {
                    timeout(time: env.MAX_BUILD_TIME_MIN.toInteger(), unit: 'MINUTES') {
                        script {
                            runBrowserTests(
                                params.BROWSER,
                                env.TEST_SUITE,
                                env.REPORT_DIR,
                                env.SCREENSHOT_DIR,
                                env.MAX_BUILD_TIME_MIN,
                                params.BASE_URL
                            )
                        }
                    }
                }
            }
        }

         stage('Non-Critical Tests') {
            agent { label 'chrome-node' }
            steps {
                script {
                    def elapsedMinutes = (System.currentTimeMillis() - currentBuild.startTimeInMillis) / 60000
                    if (elapsedMinutes < env.MAX_BUILD_TIME_MIN.toInteger()) {
                        echo "Running non-critical tests..."
                        try {
                            bat 'run-noncritical-tests.bat'
                        } catch (org.jenkinsci.plugins.workflow.steps.FlowInterruptedException e) {
                            echo "⏱️ Skipping non-critical tests (timeout)."
                        }
                    } else {
                        echo "⏱️ Skipping non-critical tests as build time exceeded ${env.MAX_BUILD_TIME_MIN} minutes."
                    }
                }
            }
        }

       stage('Performance Metrics') {
            agent { label 'chrome-node' }
            steps {
                script {
                    echo "Simulating performance log..."
                    writeFile file: "${PERF_DIR}/perf.log", text: "ResponseTime(ms)=${new Random().nextInt(500)}"
                }
                archiveArtifacts artifacts: "${PERF_DIR}/*.log", allowEmptyArchive: true
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
            node('chrome-node') {
                echo 'Cleaning workspace...'
                deleteDir()
            }
        }
        success {
            echo "Pipeline completed successfully!"
            // Slack simulation
            echo "SLACK: Build SUCCESS for ${env.JOB_NAME} #${env.BUILD_NUMBER}"
            emailext(
                to: 'izzattysuaidii@gmail.com',
                subject: "SUCCESS: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                body: "Pipeline completed successfully. Details: ${env.BUILD_URL}",
                attachLog: true
            )
        }
        unstable {
            echo "Pipeline completed with test failures (UNSTABLE)."
            echo "SLACK: Build UNSTABLE for ${env.JOB_NAME} #${env.BUILD_NUMBER}"
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
            echo "SLACK: Build FAILURE for ${env.JOB_NAME} #${env.BUILD_NUMBER}"
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
