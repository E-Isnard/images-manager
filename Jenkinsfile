pipeline {
    agent any
    
    tools {nodejs "node"}
    
    stages {
        stage('Build') {
            steps {
                slackSend (color: '#FFFF00', message: "STARTED: Job '${env.JOB_NAME} [${env.BUILD_NUMBER}]' (${env.BUILD_URL})")
                script {
                    echo 'Building...'
                    app = docker.build("${env.JOB_NAME}:${env.BUILD_ID}")
                }
            }
        }
        stage('Publish nexus') {
            steps {
                script {
                    echo 'Publish nexus...'
                    docker.withRegistry('http://nexus-docker.admin.traveljuice.fr', 'nexus') {
                        app.push("${env.BUILD_NUMBER}")
                        app.push("latest")
                    }
                }
            }
        }
        stage('Deploy') {
            steps {
                script {
                    echo 'Deploy...'
                    sshPublisher(publishers: [sshPublisherDesc(configName: 'node-ssh.traveljuice.fr', transfers: [sshTransfer(cleanRemote: false, excludes: '', execCommand: '''cd /mnt/docker-scripts-app/scripts_git/app-templates/traveljuice-images-manager/
    sh stop.sh
    sleep 5s
    sh start.sh''', execTimeout: 120000, flatten: false, makeEmptyDirs: false, noDefaultExcludes: false, patternSeparator: '[, ]+', remoteDirectory: '', remoteDirectorySDF: false, removePrefix: '', sourceFiles: '')], usePromotionTimestamp: false, useWorkspaceInPromotion: false, verbose: false)])
                }
            }
        }
        stage('Slack') {
            steps {
                script {
                    echo 'Slack....'
                }
            }
        }
    }
    post {
        success {
            slackSend (color: '#00FF00', message: "SUCCESSFUL: Job '${env.JOB_NAME} [${env.BUILD_NUMBER}]' (${env.BUILD_URL})")
        }

        failure {
            slackSend (color: '#FF0000', message: "FAILED: Job '${env.JOB_NAME} [${env.BUILD_NUMBER}]' (${env.BUILD_URL})")
        }
    }
}