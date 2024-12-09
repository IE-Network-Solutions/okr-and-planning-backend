pipeline {
    agent any

    environment {
        REMOTE_SERVER = 'ubuntu@139.185.53.18'
        REPO_URL = 'https://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@github.com/IE-Network-Solutions/okr-and-planning-backend.git'
        BRANCH_NAME = 'develop'
        REPO_DIR = 'okr-backend'
        SSH_CREDENTIALS_ID = 'peptest'
    }

    
    stages {
        stage('Prepare Repository') {
            steps {
                sshagent (credentials: [SSH_CREDENTIALS_ID]) {
                    sh """
                        ssh -o StrictHostKeyChecking=no $REMOTE_SERVER '
                        if [ -d "$REPO_DIR" ]; then
                            sudo chown -R \$USER:\$USER $REPO_DIR
                            sudo chmod -R 755 $REPO_DIR
                        fi'
                    """
                }
            }
        }
        stage('Pull Latest Changes') {
            steps {
                sshagent (credentials: [SSH_CREDENTIALS_ID]) {
                    sh """
                        ssh -o StrictHostKeyChecking=no $REMOTE_SERVER '
                        if [ -d "$REPO_DIR" ]; then
                            cd $REPO_DIR && git reset --hard HEAD && git pull origin $BRANCH_NAME
                        else
                            git clone $REPO_URL -b $BRANCH_NAME $REPO_DIR
                        fi'
                    """
                }
            }
        }
        stage('Install Dependencies') {
            steps {
                sshagent (credentials: [SSH_CREDENTIALS_ID]) {
                    sh """
                        ssh -o StrictHostKeyChecking=no $REMOTE_SERVER 'cp ~/backend-env/.okr-env ~/$REPO_DIR/.env'
                        ssh -o StrictHostKeyChecking=no $REMOTE_SERVER 'cd ~/$REPO_DIR && npm install'
                    """
                }
            }
        }
        // stage('Run Migrations') {
        //     steps {
        //         sshagent (credentials: [SSH_CREDENTIALS_ID]) {
        //             script {
        //                 def output = sh(
        //                     script: "ssh -o StrictHostKeyChecking=no $REMOTE_SERVER 'cd ~/$REPO_DIR && npm run migration:generate-run || true'",
        //                     returnStdout: true
        //                 ).trim()
        //                 echo output
        //                 if (output.contains('No changes in database schema were found')) {
        //                     echo 'No database schema changes found, skipping migration.'
        //                 } else {
        //                     sh "ssh -o StrictHostKeyChecking=no $REMOTE_SERVER 'cd ~/$REPO_DIR && npm run migration:run'"
        //                 }
        //             }
        //         }
        //     }
        // }
        stage('Run Nest js App') {
            steps {
                sshagent (credentials: [SSH_CREDENTIALS_ID]) {
                    sh """
                        ssh -o StrictHostKeyChecking=no $REMOTE_SERVER 'cd ~/$REPO_DIR && npm run build && sudo npm run start:prod'
                    """
                }
            }
        }
    }
    
    post {
        success {
            echo 'Nest js application deployed successfully!'
        }
failure {
    echo 'Deployment failed.'
    script {
        // Capture the console output using shell command
        def consoleOutput = sh(script: "tail -n 100 ${env.WORKSPACE}/logs/jenkins-console.log", returnStdout: true).trim()
        

emailext (
                subject: "FAILED: Job '${env.JOB_NAME} [${env.BUILD_NUMBER}]'",
                body: """<p><strong>Deployment failed for job: '${env.JOB_NAME} [${env.BUILD_NUMBER}]'</strong></p>
                <p>For more details, please check the console output by clicking the link below:</p>
                <p><a href='${env.BUILD_URL}'>View Console Output</a></p>
                recipientProviders: [[$class: 'DevelopersRecipientProvider']],
                to: 'yonas.t@ienetworksolutions.com'
            
        )
        echo "Email sent successfully"
    }
}

    }
}
