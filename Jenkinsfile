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

        stage("SonarQube Scan") {
            steps {
                script {
                    sonarScan()
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

stage("Test Teams Webhook") {
    steps {
        withCredentials([
            string(
                credentialsId: 'microsoft-teams-webhook',
                variable: 'TEAMS_WEBHOOK'
            )
        ]) {

            sh '''
                curl -X POST \
                -H "Content-Type: application/json" \
                -d '{
                    "type":"message",
                    "attachments":[
                      {
                        "contentType":"application/vnd.microsoft.card.adaptive",
                        "content":{
                          "$schema":"http://adaptivecards.io/schemas/adaptive-card.json",
                          "type":"AdaptiveCard",
                          "version":"1.4",
                          "body":[
                            {
                              "type":"TextBlock",
                              "text":"Jenkins Webhook Test",
                              "weight":"Bolder"
                            }
                          ]
                        }
                      }
                    ]
                }' \
                "$TEAMS_WEBHOOK"
            '''
        }
    }
}


    post {

        success {
            script {
                teamsNotify(
                    status: "SUCCESS",
                    image: IMAGE ?: "N/A"
                )
            }
        }

        failure {
            script {
                teamsNotify(
                    status: "FAILURE",
                    image: IMAGE ?: "N/A"
                )
            }
        }

        unstable {
            script {
                teamsNotify(
                    status: "UNSTABLE",
                    image: IMAGE ?: "N/A"
                )
            }
        }

        aborted {
            script {
                teamsNotify(
                    status: "ABORTED",
                    image: IMAGE ?: "N/A"
                )
            }
        }

        always {
            cleanWs()
        }
    }
}
