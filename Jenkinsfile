pipeline {
    agent any

    // Build Triggers
    triggers {
        // Poll SCM (simulates webhook) - checks repo every 5 minutes
        pollSCM('H/5 * * * *')

        // (Optional) Scheduled build example:
        // cron('H 2 * * *')
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
                echo "Preparing environment for ${params.BASE_URL}"
                sh "mkdir -p ${env.REPORT_DIR}"
            }
        }

        stage('Test Execution') {
            steps {
                script {
                    retry(2) { // Retry flaky tests
                        echo "Running ${params.TEST_SUITE} tests on ${params.BROWSER}..."
                        
                        // Simulated test + screenshot
                        sh """
                        sleep 2
                        echo '<testsuite><testcase classname="dummy" name="test1"/></testsuite>' > ${env.REPORT_DIR}/dummy_${params.TEST_SUITE}.xml
                        echo '<html><body><h1>${params.TEST_SUITE} Report</h1><p>Executed on ${params.BROWSER}</p></body></html>' > ${env.REPORT_DIR}/report_${params.TEST_SUITE}.html
                        echo 'screenshot binary data' > ${env.SCREENSHOT_DIR}/failure.png
                        """
                    }
                }
            }
        }

        stage('Report Generation') {
            steps {
                echo 'Publishing JUnit results...'
                junit allowEmptyResults: true, testResults: "${env.REPORT_DIR}/*.xml"

                echo 'Publishing HTML reports...'
                publishHTML([
                    allowMissing: true,
                    keepAll: true,
                    alwaysLinkToLastBuild: true,
                    reportDir: "${env.REPORT_DIR}",
                    reportFiles: "report_${params.TEST_SUITE}.html",
                    reportName: "Test Report"
                ])

                echo 'Archiving screenshots...'
                archiveArtifacts artifacts: "${env.SCREENSHOT_DIR}/*.png", allowEmptyArchive: true
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
    }
}
