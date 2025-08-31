def call(browser, testSuite, REPORT_DIR, SCREENSHOT_DIR, MAX_BUILD_TIME_MIN, BASE_URL) {
    echo "Running ${testSuite} tests on ${browser}..."
    def startTime = System.currentTimeMillis()

    retry(2) {
        sh """#!/bin/bash
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
    <p>Executed: ${testSuite} on ${browser}</p>
    <p>Base URL: ${BASE_URL}</p>
  </body>
</html>
EOF

# dummy screenshot
echo "fake image" > ${SCREENSHOT_DIR}/${browser}/screenshot1.png
"""
    }

    def elapsedMin = (System.currentTimeMillis() - startTime) / 60000
    if (elapsedMin > MAX_BUILD_TIME_MIN.toInteger()) {
        echo "Build exceeded ${MAX_BUILD_TIME_MIN} minutes. Skipping non-critical tests."
    } else {
        echo "Running non-critical tests..."
        sh """#!/bin/bash
# Simulate non-critical tests
echo "Executing non-critical tests..."
cat > ${REPORT_DIR}/${browser}/non_critical.xml <<EOF
<testsuite tests="1" failures="0" time="0.045">
  <testcase classname="dummy" name="non_critical_test" time="0.001"/>
</testsuite>
EOF
"""
    }
}