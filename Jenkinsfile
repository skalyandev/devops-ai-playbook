@Library('devops-shared-library') _

import com.build.boutique.Constants

def CHANGED_SERVICES = []
def IMAGES = [:]

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

        /*
         * =========================================================
         * CHECKOUT
         * =========================================================
         */

        stage("Checkout") {

            steps {

                checkout scm
            }
        }


        /*
         * =========================================================
         * DETECT CHANGES
         * =========================================================
         */

        stage("Detect Changes") {

            steps {

                script {

                    CHANGED_SERVICES = detectChanges()

                    echo "Detected Services: ${CHANGED_SERVICES}"


                    /*
                     * If no microservice changes are detected,
                     * ask the user whether to build everything
                     * or skip the build.
                     */

                    if (CHANGED_SERVICES.isEmpty()) {

                        def buildDecision = input(
                            message: "No microservice changes detected. What do you want to do?",
                            parameters: [
                                choice(
                                    name: "BUILD_ACTION",
                                    choices: [
                                        "SKIP",
                                        "BUILD_ALL"
                                    ],
                                    description: "Choose whether to skip the build or build all microservices"
                                )
                            ]
                        )


                        /*
                         * =================================================
                         * BUILD ALL
                         * =================================================
                         */

                        if (buildDecision == "BUILD_ALL") {

                            CHANGED_SERVICES = []

                            /*
                             * Add all backend microservices
                             */
                            CHANGED_SERVICES.addAll(
                                Constants.BACKEND_SERVICES
                            )

                            /*
                             * Add frontend
                             */
                            CHANGED_SERVICES.add("frontend")


                            echo """
==========================================
Build Decision
==========================================
No microservice changes detected.

User Selection : BUILD_ALL

Services to Build:
${CHANGED_SERVICES}
==========================================
"""
                        }


                        /*
                         * =================================================
                         * SKIP BUILD
                         * =================================================
                         */

                        else {

                            echo """
==========================================
Build Decision
==========================================
No microservice changes detected.

User Selection : SKIP

Docker Build, Trivy Scan and Docker Push
will be skipped.
==========================================
"""
                        }
                    }


                    /*
                     * Changes were detected normally.
                     */

                    else {

                        echo """
==========================================
Build Decision
==========================================
Changed microservices detected.

Services to Build:
${CHANGED_SERVICES}
==========================================
"""
                    }
                }
            }
        }


        /*
         * =========================================================
         * SONARQUBE
         * =========================================================
         */

        stage("SonarQube Scan") {

            steps {

                script {

                    sonarScan()
                }
            }
        }


        /*
         * =========================================================
         * REGISTRY LOGIN
         * =========================================================
         */

        stage("Registry Login") {

            when {

                expression {

                    CHANGED_SERVICES &&
                    !CHANGED_SERVICES.isEmpty()
                }
            }

            steps {

                script {

                    if (params.REGISTRY_TYPE == "docker") {

                        echo "Selected registry: Docker Hub"

                        dockerLogin("dockerhub-creds")
                    }

                    else if (params.REGISTRY_TYPE == "ecr") {

                        echo "Selected registry: AWS ECR"

                        echo "ECR authentication will use the EC2 IAM Role"
                    }

                    else {

                        error(
                            "Unsupported registry type: ${params.REGISTRY_TYPE}"
                        )
                    }
                }
            }
        }


        /*
         * =========================================================
         * DOCKER BUILD
         * =========================================================
         */

        stage("Docker Build") {

            when {

                expression {

                    CHANGED_SERVICES &&
                    !CHANGED_SERVICES.isEmpty()
                }
            }

            steps {

                script {

                    CHANGED_SERVICES.each { service ->

                        echo """
==========================================
Building Service
==========================================
Service : ${service}
==========================================
"""


                        def image = dockerBuild(
                            service: service,
                            registryType: params.REGISTRY_TYPE
                        )


                        /*
                         * Store image against service name.
                         *
                         * Example:
                         *
                         * auth     -> boutique-auth:e3aa3cf
                         * cart     -> boutique-cart:e3aa3cf
                         * frontend -> boutique-frontend:e3aa3cf
                         */

                        IMAGES[service] = image


                        echo "Built Image: ${image}"
                    }
                }
            }
        }


        /*
         * =========================================================
         * TRIVY SCAN
         * =========================================================
         */

        stage("Trivy Scan") {

            when {

                expression {

                    IMAGES &&
                    !IMAGES.isEmpty()
                }
            }

            steps {

                script {

                    IMAGES.each { service, image ->

                        echo """
==========================================
Trivy Scan
==========================================
Service : ${service}
Image   : ${image}
==========================================
"""


                        trivyScan(
                            image: image,
                            severity: "CRITICAL,HIGH"
                        )
                    }
                }
            }
        }


        /*
         * =========================================================
         * DOCKER PUSH
         * =========================================================
         */

        stage("Docker Push") {

            when {

                expression {

                    IMAGES &&
                    !IMAGES.isEmpty()
                }
            }

            steps {

                script {

                    IMAGES.each { service, image ->

                        echo """
==========================================
Docker Push
==========================================
Service : ${service}
Image   : ${image}
Registry: ${params.REGISTRY_TYPE}
==========================================
"""


                        dockerPush(
                            image: image,
                            registryType: params.REGISTRY_TYPE
                        )
                    }
                }
            }
        }
    }


    /*
     * =============================================================
     * POST ACTIONS
     * =============================================================
     */

    post {

        success {

            echo """
==========================================
Pipeline Completed Successfully
==========================================
Registry        : ${params.REGISTRY_TYPE}
Services        : ${CHANGED_SERVICES}
Images          : ${IMAGES}
==========================================
"""
        }

        failure {

            echo """
==========================================
Pipeline Failed
==========================================
"""
        }

        unstable {

            echo """
==========================================
Pipeline Unstable
==========================================
"""
        }

        aborted {

            echo """
==========================================
Pipeline Aborted
==========================================
"""
        }

        always {

            cleanWs()
        }
    }
}


