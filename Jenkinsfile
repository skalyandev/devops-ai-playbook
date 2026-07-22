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
           //def services = detectChanges()
          //echo "Services = ${services}"
           hello()
         }
       }
     }

   }
}
