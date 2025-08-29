pipeline {
    agent any

    // Parameters allow conditional execution
    parameters {
        choice(
            name: 'TEST_SUITE',
            choices: ['smoke', 'regression', 'full'],
            description: 'Select the test suite to execute'
        )
        choice(
            name: 'ENV',
            choices: ['dev', 'staging', 'prod'],
            description: 'Target environment'
        )
    }

    environment {
        REPORT_DIR = 'reports'
        RETRY_COUNT = 2
    }

    stages {

        stage('Environment Preparation') {
            steps {
                echo "Preparing environment for ${params.ENV}"
                sh 'mkdir -p $REPORT_DIR'
                // Add environment-specific setup here
            }
        }

        stage('Test Execution') {
            steps {
                script {
                    // Conditional test suite execution
                    if (params.TEST_SUITE == 'smoke') {
                        retry(env.RETRY_COUNT.toInteger()) {
                            echo 'Running smoke tests...'
                            // sh 'run_smoke_tests.sh'
                        }
                    } else if (params.TEST_SUITE == 'regression') {
                        retry(env.RETRY_COUNT.toInteger()) {
                            echo 'Running regression tests...'
                            // sh 'run_regression_tests.sh'
                        }
                    } else {
                        retry(env.RETRY_COUNT.toInteger()) {
                            echo 'Running full test suite...'
                            // sh 'run_full_tests.sh'
                        }
                    }
                }
            }
        }

        stage('Report Generation') {
            steps {
                echo 'Generating reports...'
                // sh 'generate_reports.sh'
                archiveArtifacts artifacts: "${env.REPORT_DIR}/*.xml", allowEmptyArchive: true
            }
        }

        stage('Cleanup') {
            steps {
                echo 'Cleaning up workspace...'
                deleteDir() // Clean the workspace
            }
        }
    }

    post {
        always {
            echo 'This runs regardless of pipeline success/failure.'
        }
        success {
            echo 'Pipeline completed successfully!'
        }
        failure {
            echo 'Pipeline failed. Sending notifications...'
            // Example: emailext body: 'Pipeline failed!', subject: 'Jenkins Failure', to: 'team@example.com'
        }
    }
}
