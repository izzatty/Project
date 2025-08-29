pipeline {
    agent any

    // Parameters allow conditional execution
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
    }

    stages {

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
                        
                        // Placeholder for real test commands
                        sh """
                        # Simulate test execution
                        sleep 2
                        # Create dummy XML report for archiving
                        echo '<testsuite><testcase classname="dummy" name="test1"/></testsuite>' > ${env.REPORT_DIR}/dummy_${params.TEST_SUITE}.xml
                        """
                    }
                }
            }
        }

        stage('Report Generation') {
            steps {
                echo 'Generating reports...'
                archiveArtifacts artifacts: "${env.REPORT_DIR}/*.xml", allowEmptyArchive: true
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
                body: "Good news! The pipeline completed successfully.\n\nCheck the build details: ${env.BUILD_URL}"
            )
        }
        failure {
            echo "Pipeline failed. Please check logs."
            emailext(
                to: 'izzattysuaidii@gmail.com',
                subject: "Jenkins Pipeline FAILURE: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                body: "Oops! The pipeline failed.\n\nCheck the console output for details: ${env.BUILD_URL}"
            )
        }
    }
}
