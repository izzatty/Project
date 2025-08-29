pipeline {
    agent any

    // Build Triggers
    triggers {
        // Poll SCM (simulates webhook) - checks repo every 5 minutes
        pollSCM('H/5 * * * *')

        // Scheduled build example:
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
            choices: ['chrome', 'firefox', 'edge'],
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
                echo "Preparing environment for https://parabank.parasoft.com"
                sh '''
                    mkdir -p ${REPORT_DIR}
                    mkdir -p ${SCREENSHOT_DIR}
                '''
            }
        }

        stage('Test Execution') {
            steps {
                script {
                    retry(1) {
                        echo "Running smoke tests on chrome..."
                        sh '''
                        mkdir -p reports
                        mkdir -p screenshots

                        # dummy junit report
                        cat > reports/test-results.xml <<EOF
                        <testsuite tests="2" failures="1" time="0.123">
                          <testcase classname="dummy" name="test_pass" time="0.001"/>
                          <testcase classname="dummy" name="test_fail" time="0.002">
                            <failure message="Assertion failed">Expected X but got Y</failure>
                          </testcase>
                        </testsuite>
                        EOF

                        # dummy HTML report
                        cat > ${REPORT_DIR}/index.html <<EOF
                        <html>
                          <body>
                            <h1>Test Report</h1>
                            <p>All tests completed.</p>
                          </body>
                        </html>
                        EOF

                        # dummy screenshot
                        echo "fake image" > ${SCREENSHOT_DIR}/screenshot1.png
                        ls -l screenshots
                        '''
                    }
                }
            }
        }

        stage('Report Generation') {
            steps {
                echo "Publishing JUnit test results"
                // This is what drives the "Test Result Trend" graph
                junit allowEmptyResults: true, testResults: "${REPORT_DIR}/*.xml"

                echo "Publishing HTML report"
                publishHTML([
                    allowMissing: true,              // don’t fail build if report folder is missing
                    alwaysLinkToLastBuild: true,     // keeps link always pointing to latest build
                    keepAll: true,                   // keep past reports
                    reportDir: 'reports',            // directory where the report lives
                    reportFiles: 'index.html',       // the actual file(s) to publish
                    reportName: 'HTML Report'
                ])

                echo "Archiving screenshots"
                archiveArtifacts artifacts: "${SCREENSHOT_DIR}/*.png", allowEmptyArchive: true
            }
        }

        stage('Cleanup') {
            steps {
                echo 'Cleaning up workspace...'
                deleteDir()
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
                body: """<p>Pipeline completed successfully!</p>
                         <p>View details: <a href='${env.BUILD_URL}'>Build ${env.BUILD_NUMBER}</a></p>
                         <p><b>Reports:</b> available in Jenkins build page.</p>""",
                attachLog: true
            )
            // Trigger downstream job only if success
            build job: 'DownstreamJob', wait: false, parameters: [
                string(name: 'UPSTREAM_BUILD', value: "${env.JOB_NAME} #${env.BUILD_NUMBER}")
            ]
        }
        failure {
            echo "Pipeline failed. Please check logs."
            emailext(
                to: 'izzattysuaidii@gmail.com',
                subject: "Jenkins Pipeline FAILURE: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                body: """<p>Pipeline failed.</p>
                         <p>View logs: <a href='${env.BUILD_URL}'>Build ${env.BUILD_NUMBER}</a></p>
                         <p>Screenshots archived in artifacts section.</p>""",
                attachmentsPattern: "${env.SCREENSHOT_DIR}/*.png",
                attachLog: true
            )
        }
        cleanup {
            // cleanup moved here so reports + artifacts are still available
            echo 'Cleaning up workspace after pipeline completes...'
            cleanWs()
        }
    }
}
