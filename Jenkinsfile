pipeline {
    agent any

    stages {
        stage('Select Environment') {
            steps {
                script {
                    withCredentials([
                        string(credentialsId: 'REMOTE_SERVER_TEST', variable: 'REMOTE_SERVER_TEST'),
                        string(credentialsId: 'REMOTE_SERVER_PROD', variable: 'REMOTE_SERVER_PROD'),
                        string(credentialsId: 'REMOTE_SERVER_PROD2', variable: 'REMOTE_SERVER_PROD2')
                    ]) {
                        def branchName = env.GIT_BRANCH ?: sh(script: "git rev-parse --abbrev-ref HEAD", returnStdout: true).trim()

                        if (branchName.contains('develop')) {
                            env.SSH_CREDENTIALS_ID_1 = 'peptest'
                            env.REMOTE_SERVER_1 = REMOTE_SERVER_TEST
                            env.REMOTE_SERVER_2 = REMOTE_SERVER_PROD2
                        } else if (branchName.contains('production')) {
                            env.SSH_CREDENTIALS_ID_1 = 'pepproduction'
                            env.REMOTE_SERVER_1 = REMOTE_SERVER_PROD
                        }
                    }
                }
            }
        }

        stage('Fetch Environment Variables') {
            parallel {
                stage('Fetch Variables from Server 1') {
                    steps {
                        script {
                            sshagent([env.SSH_CREDENTIALS_ID_1]) {
                                env.REPO_URL = sh(script: "ssh -o StrictHostKeyChecking=no ${env.REMOTE_SERVER_1} 'grep REPO_URL /home/ubuntu/secrets/.okr-env | cut -d= -f2'", returnStdout: true).trim()
                                env.BRANCH_NAME = sh(script: "ssh -o StrictHostKeyChecking=no ${env.REMOTE_SERVER_1} 'grep BRANCH_NAME /home/ubuntu/secrets/.okr-env | cut -d= -f2'", returnStdout: true).trim()
                                env.REPO_DIR = sh(script: "ssh -o StrictHostKeyChecking=no ${env.REMOTE_SERVER_1} 'grep REPO_DIR /home/ubuntu/secrets/.okr-env | cut -d= -f2'", returnStdout: true).trim()
                            }
                        }
                    }
                }
                stage('Fetch Variables from Server 2') {
                    steps {
                        script {
                            withCredentials([string(credentialsId: 'pepproduction2', variable: 'SERVER_PASSWORD')]) {
                                env.REPO_URL = sh(script: "sshpass -p '$SERVER_PASSWORD' ssh -o StrictHostKeyChecking=no ${env.REMOTE_SERVER_2} 'grep REPO_URL /home/ubuntu/secrets/.okr-env | cut -d= -f2'", returnStdout: true).trim()
                                env.BRANCH_NAME = sh(script: "sshpass -p '$SERVER_PASSWORD' ssh -o StrictHostKeyChecking=no ${env.REMOTE_SERVER_2} 'grep BRANCH_NAME /home/ubuntu/secrets/.okr-env | cut -d= -f2'", returnStdout: true).trim()
                                env.REPO_DIR = sh(script: "sshpass -p '$SERVER_PASSWORD' ssh -o StrictHostKeyChecking=no ${env.REMOTE_SERVER_2} 'grep REPO_DIR /home/ubuntu/secrets/.okr-env | cut -d= -f2'", returnStdout: true).trim()
                            }
                        }
                    }
                }
            }
        }

        stage('Prepare Repository') {
            parallel {
                stage('Prepare Repository on Server 1') {
                    steps {
                        sshagent([env.SSH_CREDENTIALS_ID_1]) {
                            sh """
                                ssh -o StrictHostKeyChecking=no ${env.REMOTE_SERVER_1} '
                                if [ -d "$REPO_DIR" ]; then
                                    sudo chown -R \$USER:\$USER $REPO_DIR
                                    sudo chmod -R 755 $REPO_DIR
                                fi'
                            """
                        }
                    }
                }
                stage('Prepare Repository on Server 2') {
                    steps {
                        withCredentials([string(credentialsId: 'pepproduction2', variable: 'SERVER_PASSWORD')]) {
                            sh """
                                sshpass -p '$SERVER_PASSWORD' ssh -o StrictHostKeyChecking=no ${env.REMOTE_SERVER_2} '
                                if [ -d "$REPO_DIR" ]; then
                                    sudo chown -R \$USER:\$USER $REPO_DIR
                                    sudo chmod -R 755 $REPO_DIR
                                fi'
                            """
                        }
                    }
                }
            }
        }

        stage('Pull Latest Changes') {
            parallel {
                stage('Pull Latest Changes from Server 1') {
                    steps {
                        sshagent([env.SSH_CREDENTIALS_ID_1]) {
                            sh """
                                ssh -o StrictHostKeyChecking=no ${env.REMOTE_SERVER_1} '
                                if [ ! -d "$REPO_DIR/.git" ]; then
                                    git clone $REPO_URL -b $BRANCH_NAME $REPO_DIR
                                else
                                    cd $REPO_DIR && git reset --hard HEAD && git pull origin $BRANCH_NAME
                                fi'
                            """
                        }
                    }
                }
                stage('Pull Latest Changes from Server 2') {
                    steps {
                        withCredentials([string(credentialsId: 'pepproduction2', variable: 'SERVER_PASSWORD')]) {
                            sh """
                                sshpass -p '$SERVER_PASSWORD' ssh -o StrictHostKeyChecking=no ${env.REMOTE_SERVER_2} '
                                if [ ! -d "$REPO_DIR/.git" ]; then
                                    git clone $REPO_URL -b $BRANCH_NAME $REPO_DIR
                                else
                                    cd $REPO_DIR && git reset --hard HEAD && git pull origin $BRANCH_NAME
                                fi'
                            """
                        }
                    }
                }
            }
        }

        stage('Install Dependencies') {
            parallel {
                stage('Install Dependencies on Server 1') {
                    steps {
                        sshagent([env.SSH_CREDENTIALS_ID_1]) {
                            sh """
                                ssh -o StrictHostKeyChecking=no ${env.REMOTE_SERVER_1} 'cp ~/backend-env/.okr-env ~/$REPO_DIR/.env'
                                ssh -o StrictHostKeyChecking=no ${env.REMOTE_SERVER_1} 'cd ~/$REPO_DIR && npm install'
                            """
                        }
                    }
                }
                stage('Install Dependencies on Server 2') {
                    steps {
                        withCredentials([string(credentialsId: 'pepproduction2', variable: 'SERVER_PASSWORD')]) {
                            sh """
                                sshpass -p '$SERVER_PASSWORD' ssh -o StrictHostKeyChecking=no ${env.REMOTE_SERVER_2} 'cp ~/backend-env/.okr-env ~/$REPO_DIR/.env'
                                sshpass -p '$SERVER_PASSWORD' ssh -o StrictHostKeyChecking=no ${env.REMOTE_SERVER_2} 'cd ~/$REPO_DIR && npm install'
                            """
                        }
                    }
                }
            }
        }

        stage('Run Migrations') {
            steps {
                sshagent([env.SSH_CREDENTIALS_ID_1]) {
                    sh "ssh -o StrictHostKeyChecking=no ${env.REMOTE_SERVER_1} 'cd ~/$REPO_DIR && npm run migration:run'"
                }
            }
        }

        stage('Run Nest.js App') {
            parallel {
                stage('Start App on Server 1') {
                    steps {
                        sshagent([env.SSH_CREDENTIALS_ID_1]) {
                            sh "ssh -o StrictHostKeyChecking=no ${env.REMOTE_SERVER_1} 'cd $REPO_DIR && sudo npm run start:prod'"
                        }
                    }
                }
                stage('Start App on Server 2') {
                    steps {
                        withCredentials([string(credentialsId: 'pepproduction2', variable: 'SERVER_PASSWORD')]) {
                            sh "sshpass -p '$SERVER_PASSWORD' ssh -o StrictHostKeyChecking=no ${env.REMOTE_SERVER_2} 'cd $REPO_DIR && sudo npm run start:prod'"
                        }
                    }
                }
            }
        }
    }

    post {
        success {
            echo 'Nest.js application deployed successfully!'
        }
        failure {
            echo 'Deployment failed.'
            emailext(
                subject: "FAILED: Job '${env.JOB_NAME} [${env.BUILD_NUMBER}]'",
                body: """
                    <html>
                        <head>
                            <style>
                                body {
                                    font-family: Arial, sans-serif;
                                    color: #333333;
                                    line-height: 1.6;
                                }
                                h2 {
                                    color: #e74c3c;
                                }
                                .details {
                                    margin-top: 20px;
                                }
                                .label {
                                    font-weight: bold;
                                }
                                .link {
                                    color: #3498db;
                                    text-decoration: none;
                                }
                                .footer {
                                    margin-top: 30px;
                                    font-size: 0.9em;
                                    color: #7f8c8d;
                                }
                            </style>
                        </head>
                        <body>
                            <h2>Build Failed</h2>
                            <p>The Jenkins job has failed. Please review the details below:</p>
                            <div class="details">
                                <p><span class="label">Job:</span> ${env.JOB_NAME}</p>
                                <p><span class="label">Build Number:</span> ${env.BUILD_NUMBER}</p>
                                <p><span class="label">Console Output:</span> <a href="${env.BUILD_URL}console" class="link">View the console output</a></p>
                            </div>
                        </body>
                    </html>
                """,
                from: 'selamnew@ienetworksolutions.com',
                recipientProviders: [[$class: 'DevelopersRecipientProvider']],
                to: 'yonas.t@ienetworksolutions.com, surafel@ienetworks.co, abeselom.g@ienetworksolutions.com'
            )
        }
    }
}
