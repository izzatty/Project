pipeline {
    agent any

    // Build triggers: poll SCM (simulates webhook) + cron
    triggers {
        pollSCM('H/5 * * * *')   // polling every 5 minutes (simulates webhook)
        // cron('H 2 * * *')     // example scheduled run at ~2AM daily 
    }

    // Parameters (parameterized manual triggers)
    parameters {
        choice(name: 'TEST_SUITE', choices: ['smoke', 'regression', 'full'], description: 'Test suite to execute')
        choice(name: 'BROWSER', choices: ['all', 'chrome', 'firefox', 'edge'], description: 'Browser Selection (use "all" to run parallel across browsers)')
        string(name: 'BASE_URL', defaultValue: 'https://parabank.parasoft.com', description: 'Environment URL')
    }

    environment {
        REPORT_DIR      = 'reports'
        SCREENSHOT_DIR  = 'screenshots'
    }

    stages {
        stage('Environment Preparation') {
            steps {
                script {
                    echo "Preparing environment for ${params.BASE_URL}"
                    // Environment-specific configuration
                    if (params.BASE_URL.contains('staging')) {
                        echo "Applying staging-specific setup..."
                        // staging-specific commands 
                    } else if (params.BASE_URL.contains('prod')) {
                        echo "Applying production-specific setup (be careful!)"
                        // production-specific commands 
                    } else {
                        echo "Default/dev setup"
                    }

                    sh """
                        mkdir -p ${env.REPORT_DIR}
                        mkdir -p ${env.SCREENSHOT_DIR}
                    """
                }
            }
        }

        stage('Test Execution (parallel browsers)') {
            steps {
                script {
                    // pick browsers
                    def browsers = []
                    if (params.BROWSER == 'all') {
                        browsers = ['chrome', 'firefox', 'edge']
                    } else {
                        browsers = [params.BROWSER]
                    }

                    // build parallel map
                    def branches = [:]
                    for (b in browsers) {
                        def browser = b  // important: bind to a new var for closure
                        branches[browser] = {
                            // Isolate each browser run so failures don't kill other branches
                            catchError(buildResult: 'UNSTABLE', stageResult: 'FAILURE') {
                                retry(2) { // retry flaky tests per browser
                                    echo "Starting tests for ${browser} (suite=${params.TEST_SUITE})"
                                    sh """
                                        mkdir -p ${env.REPORT_DIR}/${browser}
                                        mkdir -p ${env.SCREENSHOT_DIR}/${browser}

                                        # ---------- Replace these simulated steps with real test commands ----------
                                        # Example: npx cypress run --browser ${browser} --env baseUrl=${params.BASE_URL},suite=${params.TEST_SUITE} \
                                        #   --reporter junit --reporter-options mochaFile=${env.REPORT_DIR}/${browser}/results.xml

                                        # Simulated tests: write a junit xml and an example HTML and screenshot file
                                        cat > ${env.REPORT_DIR}/${browser}/results.xml <<EOF
                                        <testsuite tests="2" failures="1" time="0.123">
                                          <testcase classname="dummy" name="test_pass" time="0.001"/>
                                          <testcase classname="dummy" name="test_fail" time="0.002">
                                            <failure message="Assertion failed">Expected X but got Y</failure>
                                          </testcase>
                                        </testsuite>
                                        EOF

                                        echo "<html><body><h1>${params.TEST_SUITE} on ${browser}</h1></body></html>" > ${env.REPORT_DIR}/${browser}/report_${browser}.html
                                        # Create a placeholder screenshot for failures (in real runs you'll collect real images)
                                        echo "fake-binary-data" > ${env.SCREENSHOT_DIR}/${browser}/failure.png
                                        # ---------------------------------------------------------------------------------
                                    """
                                } // retry
                            } // catchError
                        } // closure
                    } // for

                    // Execute parallel
                    parallel branches
                } // script
            } // steps
        } // stage

        // Example: Run more extensive tests only for regression/full
        stage('Extended Tests (optional)') {
            when {
                anyOf {
                    expression { params.TEST_SUITE == 'regression' }
                    expression { params.TEST_SUITE == 'full' }
                }
            }
            steps {
                script {
                    echo "Running extended tests because TEST_SUITE=${params.TEST_SUITE}"
                    // place additional/regression tasks here
                    // e.g. run load tests, integration suites, etc.
                }
            }
        }

        stage('Report Generation & Archival') {
            steps {
                script {
                    echo "Collecting and publishing test results (JUnit)..."
                    
                    junit allowEmptyResults: true, testResults: "${env.REPORT_DIR}/**/*.xml"

                    echo "Publishing HTML reports..."
                    publishHTML(target: [
                        allowMissing: true,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: "${env.REPORT_DIR}",
                        reportFiles: "report_*.html",
                        reportName: "Automated Test Reports"
                    ])

                    echo "Archiving screenshots..."
                    archiveArtifacts artifacts: "${env.SCREENSHOT_DIR}/**/*.png", allowEmptyArchive: true
                }
            }
        }

        stage('Cleanup (preserve build artifacts)') {
            steps {
                echo "Workspace cleanup will run in post-cleanup step to preserve archived artifacts for Jenkins UI."
            }
        }
    } 

    post {
        post {
            always {
                junit 'reports/**/*.xml'
            }
        }

        success {
            echo "Post: success — sending success email and triggering downstream job (if configured)."

            // Email to configured recipients (requires email-ext plugin + global SMTP configured)
            emailext (
                to: 'izzattysuaidii@gmail.com',
                subject: "SUCCESS: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                body: """<p>Build succeeded.</p>
                         <p>Build: <a href='${env.BUILD_URL}'>${env.BUILD_URL}</a></p>
                         <p>Reports: see the 'Test Result Trend' and 'HTML Report' links on this build.</p>""",
                attachLog: true
            )

            // Trigger downstream job, pass upstream build info; create the downstream job in Jenkins as 'DownstreamJob'
            build job: 'DownstreamJob', wait: false, parameters: [string(name: 'UPSTREAM_BUILD', value: "${env.JOB_NAME} #${env.BUILD_NUMBER}")]
        }

        unstable {
            echo "Post: unstable — send an email with attachments (screenshots) and keep history for trend analysis."
            emailext (
                to: 'izzattysuaidii@gmail.com',
                subject: "UNSTABLE: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                body: "Build is UNSTABLE. Check ${env.BUILD_URL}. Screenshots and logs archived.",
                attachmentsPattern: "${env.SCREENSHOT_DIR}/**/*.png",
                attachLog: true
            )
        }

        failure {
            echo "Post: failure — sending failure email & cleanup."
            emailext (
                to: 'izzattysuaidii@gmail.com',
                subject: "FAILURE: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                body: "Build FAILED. See ${env.BUILD_URL} for console output. Artifacts/screenshots archived if available.",
                attachmentsPattern: "${env.SCREENSHOT_DIR}/**/*.png",
                attachLog: true
            )
        }

        cleanup {
            // final workspace cleanup after all reporting/archival steps completed
            echo "Post: cleanup — cleaning workspace to free space (reports and artifacts remain available via Jenkins UI)."
            cleanWs()
        }
    }
}
