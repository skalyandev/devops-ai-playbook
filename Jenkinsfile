@Library('devops-shared-library') _

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
                serverity: "CRITICAL, HIGH",
                exitCode: 0
            )
        }
      }
    }

   }
}
