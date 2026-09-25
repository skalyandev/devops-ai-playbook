@Library('devops-shared-library') _

def IMAGE = ""

pipeline {

    agent any

    stages {

        stage("Checkout") {
            steps {
                checkout scm
            }
        }

        stage("Detect Changes") {
            steps {
                script {
                    def services = detectChanges()

                    echo "Services = ${services}"

                    hello()
                }
            }
        }

        stage("SonarQube Scan") {
            steps {
                script {
                    sonarScan()
                }
            }
        }

        stage("Docker Login") {
            steps {
                script {
                    dockerLogin("dockerhub-creds")
                }
            }
        }

        stage("Docker Build") {
            steps {
                script {
                    IMAGE = dockerBuild(
                        service: "auth"
                    )

                    echo "Built Image: ${IMAGE}"
                }
            }
        }

        stage("Trivy Scan") {
            steps {
                script {
                    trivyScan(
                        image: IMAGE,
                        severity: "CRITICAL,HIGH"
                    )
                }
            }
        }

        stage("Docker Push") {
            steps {
                script {
                    dockerPush(IMAGE)
                }
            }
        }
    }

    post {

        success {
            echo "Build completed successfully."
        }

        failure {
            echo "Build failed."
        }

        unstable {
            echo "Build is unstable."
        }

        aborted {
            echo "Build was aborted."
        }

        always {
            cleanWs()
        }
    }
}


