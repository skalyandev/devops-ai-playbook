@Library('devops-shared-library') _

def IMAGE = ""

pipeline {

    agent any

    parameters {

        choice(
            name: "REGISTRY_TYPE",
            choices: [
                "docker",
                "ecr"
            ],
            description: "Select the container registry"
        )
    }

    environment {

        PROJECT_NAME = "boutique"

        DOCKER_REGISTRY = "docker.io/skalyan"

        ECR_REGISTRY = "756148746379.dkr.ecr.ap-south-1.amazonaws.com"

        AWS_REGION = "ap-south-1"
    }

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


        stage("Registry Login") {

            steps {

                script {

                    if (params.REGISTRY_TYPE == "docker") {

                        echo "Selected registry: Docker Hub"

                        dockerLogin("dockerhub-creds")

                    } else if (params.REGISTRY_TYPE == "ecr") {

                        echo "Selected registry: AWS ECR"
                        echo "ECR authentication will use the EC2 IAM Role"

                    } else {

                        error "Unsupported registry type: ${params.REGISTRY_TYPE}"
                    }
                }
            }
        }


        stage("Docker Build") {

            steps {

                script {

                    IMAGE = dockerBuild(
                        service: "auth",
                        registryType: params.REGISTRY_TYPE
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

                    dockerPush(
                        image: IMAGE,
                        registryType: params.REGISTRY_TYPE
                    )
                }
            }
        }
    }


    post {

        success {

            echo """
==========================================
Build completed successfully.
==========================================
Registry : ${params.REGISTRY_TYPE}
Image    : ${IMAGE}
==========================================
"""
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
