pipeline {
    agent any

    // Build Triggers
    triggers {
        // Poll SCM (simulates webhook) - checks repo every 5 minutes
        pollSCM('H/5 * * * *')

        // Scheduled build:
        cron('H 2 * * *')
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
            retry(1) {
                echo "Running ${params.TEST_SUITE} tests on ${params.BROWSER}..."
                sh """
mkdir -p ${REPORT_DIR} ${SCREENSHOT_DIR}

# dummy junit report
cat > ${REPORT_DIR}/test-results.xml <<EOF
<testsuite tests="1" failures="0" time="0.123">
  <testcase classname="dummy" name="test_pass" time="0.001"/>
</testsuite>
EOF

# dummy HTML report
cat > ${REPORT_DIR}/index.html <<EOF
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
