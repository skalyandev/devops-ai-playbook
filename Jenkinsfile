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
        scripts {
          dockerBuild()
       }
      }
    }

    stage("Code Quality") {
      steps {
        script {
          sonarScan()
        }
      }
    }
   }
}
