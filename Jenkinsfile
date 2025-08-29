pipeline {
    agent any

    // Build Triggers
    triggers {
        pollSCM('H/5 * * * *') // Simulated webhook
        cron('H 2 * * *') // Scheduled build
    }

    //  Parameterized Manual Trigger
    parameters {
        choice(
            name: 'TEST_SUITE',
            choices: ['smoke', 'regression', 'full'],
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
                        lock(resource: "browser-${browser}", inversePrecedence: true) { // queue builds for same browser
                            node(browserAgentMap[browser]) {
                                echo "Running ${selectedTest} tests on ${browser}..."

                                def startTime = System.currentTimeMillis()

                                retry(2) {
                                    sh """
mkdir -p ${REPORT_DIR}/${browser} ${SCREENSHOT_DIR}/${browser}

# dummy junit report
cat > ${REPORT_DIR}/${browser}/test-results.xml <<EOF
<testsuite tests="1" failures="0" time="0.123">
  <testcase classname="dummy" name="test_pass" time="0.001"/>
</testsuite>
EOF

# dummy HTML report
cat > ${REPORT_DIR}/${browser}/index.html <<EOF
<html>
  <body>
    <h1>Test Report</h1>
    <p>Executed: ${params.TEST_SUITE} on ${params.BROWSER}</p>
    <p>Base URL: ${params.BASE_URL}</p>
  </body>
</html>
EOF

# dummy screenshot
echo "fake image" > ${SCREENSHOT_DIR}/screenshot1.png
"""
                    }
                    // Skip non-critical tests if elapsed time > MAX_BUILD_TIME_MIN
                    def elapsedMin = (System.currentTimeMillis() - startTime) / 60000
                    if (elapsedMin > MAX_BUILD_TIME_MIN.toInteger()) {
                        echo "Build exceeded ${MAX_BUILD_TIME_MIN} minutes. Skipping non-critical tests."
                    } else {
                        echo "Running non-critical tests..."
                        sh """
# Simulate non-critical tests
echo "Executing non-critical tests..."
cat > ${REPORT_DIR}/non_critical.xml <<EOF
<testsuite tests="1" failures="0" time="0.045">
  <testcase classname="dummy" name="non_critical_test" time="0.001"/>
</testsuite>
EOF
"""
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
                    allowMissing: true,              // don’t fail build if report folder is missing
                    alwaysLinkToLastBuild: true,     // keeps link always pointing to latest build
                    keepAll: true,                   // keep past reports
                    reportDir: "${REPORT_DIR}",      // directory where the report lives
                    reportFiles: 'index.html',       // the actual file(s) to publish
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
            // Trigger downstream job only if success
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
            // cleanup moved here so reports + artifacts are still available
            echo 'Cleaning up workspace after pipeline completes...'
            deleteDir()
        }
    }
}
