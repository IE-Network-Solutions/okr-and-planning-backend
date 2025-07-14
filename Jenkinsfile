pipeline {
    agent any

    options {
        timeout(time: 5, unit: 'MINUTES')
     }

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
                        env.BRANCH_NAME = branchName

                        if (branchName.contains('develop')) {
                            env.SSH_CREDENTIALS_ID_1 = 'peptest'
                            env.REMOTE_SERVER_1 = REMOTE_SERVER_TEST
                            env.REMOTE_SERVER_2 = REMOTE_SERVER_PROD2
                            env.SECRETS_PATH = '/home/ubuntu/secrets/.okr-env'
                            env.BACKEND_ENV_PATH = '/home/ubuntu/backend-env'
                        } else if (branchName.contains('production')) {
                            env.SSH_CREDENTIALS_ID_1 = 'pepproduction'
                            env.REMOTE_SERVER_1 = REMOTE_SERVER_PROD
                            env.SECRETS_PATH = '/home/ubuntu/secrets/.okr-env'
                            env.BACKEND_ENV_PATH = '/home/ubuntu/backend-env'
                        } else if (branchName.contains('staging')) {
                            env.SSH_CREDENTIALS_ID_1 = 'pepproduction'
                            env.REMOTE_SERVER_1 = REMOTE_SERVER_PROD
                            env.SECRETS_PATH = '/home/ubuntu/staging-secrets/.okr-env'
                            env.BACKEND_ENV_PATH = '/home/ubuntu/backend-env/staging-env'
                        } else if (branchName.contains('preview')) {
                            env.REMOTE_SERVER_2 = REMOTE_SERVER_PROD2
                            env.SECRETS_PATH = '/home/ubuntu/preview-secrets/.okr-env'
                            env.BACKEND_ENV_PATH = '/home/ubuntu/backend-env/preview-env'
                        }
                    }
                }
            }
        }

        stage('Fetch Environment Variables') {
            parallel {
                stage('Fetch Variables from Server 1') {
                    when {
                        expression { env.REMOTE_SERVER_1 != null }
                    }
                    steps {
                        script {
                            sshagent([env.SSH_CREDENTIALS_ID_1]) {
                                def secretsPath = env.SECRETS_PATH
                                env.REPO_URL = sh(script: "ssh -o StrictHostKeyChecking=no ${env.REMOTE_SERVER_1} 'grep REPO_URL ${secretsPath} | cut -d= -f2'", returnStdout: true).trim()
                                env.BRANCH_NAME = sh(script: "ssh -o StrictHostKeyChecking=no ${env.REMOTE_SERVER_1} 'grep BRANCH_NAME ${secretsPath} | cut -d= -f2'", returnStdout: true).trim()
                                env.REPO_DIR = sh(script: "ssh -o StrictHostKeyChecking=no ${env.REMOTE_SERVER_1} 'grep REPO_DIR ${secretsPath} | cut -d= -f2'", returnStdout: true).trim()
                            }
                        }
                    }
                }
                stage('Fetch Variables from Server 2') {
                    when {
                        expression { env.REMOTE_SERVER_2 != null }
                    }
                    steps {
                        script {
                            withCredentials([string(credentialsId: 'pepproduction2', variable: 'SERVER_PASSWORD')]) {
                                def secretsPath = env.SECRETS_PATH
                                env.REPO_URL = sh(script: "sshpass -p '$SERVER_PASSWORD' ssh -o StrictHostKeyChecking=no ${env.REMOTE_SERVER_2} 'grep REPO_URL ${secretsPath} | cut -d= -f2'", returnStdout: true).trim()
                                env.BRANCH_NAME = sh(script: "sshpass -p '$SERVER_PASSWORD' ssh -o StrictHostKeyChecking=no ${env.REMOTE_SERVER_2} 'grep BRANCH_NAME ${secretsPath} | cut -d= -f2'", returnStdout: true).trim()
                                env.REPO_DIR = sh(script: "sshpass -p '$SERVER_PASSWORD' ssh -o StrictHostKeyChecking=no ${env.REMOTE_SERVER_2} 'grep REPO_DIR ${secretsPath} | cut -d= -f2'", returnStdout: true).trim()
                            }
                        }
                    }
                }
            }
        }

        stage('Prepare Repository') {
            parallel {
                stage('Prepare Repository on Server 1') {
                    when {
                        expression { env.REMOTE_SERVER_1 != null }
                    }
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
                    when {
                        expression { env.REMOTE_SERVER_2 != null }
                    }
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
                stage('Pull Latest Changes to Server 1') {
                    when {
                        expression { env.REMOTE_SERVER_1 != null }
                    }
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
                stage('Pull Latest Changes to Server 2') {
                    when {
                        expression { env.REMOTE_SERVER_2 != null }
                    }
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
                    when {
                        expression { env.REMOTE_SERVER_1 != null }
                    }
                    steps {
                        script {
                            def envPath = env.BACKEND_ENV_PATH
                            sshagent([env.SSH_CREDENTIALS_ID_1]) {
                                sh """
                                    ssh -o StrictHostKeyChecking=no ${env.REMOTE_SERVER_1} 'cp ${envPath}/.okr-env ~/$REPO_DIR/.env'
                                    ssh -o StrictHostKeyChecking=no ${env.REMOTE_SERVER_1} 'cd ~/$REPO_DIR && npm install'
                                """
                            }
                        }
                    }
                }
                stage('Install Dependencies on Server 2') {
                    when {
                        expression { env.REMOTE_SERVER_2 != null }
                    }
                    steps {
                        script {
                            def envPath = env.BACKEND_ENV_PATH
                            withCredentials([string(credentialsId: 'pepproduction2', variable: 'SERVER_PASSWORD')]) {
                                sh """
                                    sshpass -p '$SERVER_PASSWORD' ssh -o StrictHostKeyChecking=no ${env.REMOTE_SERVER_2} 'cp ${envPath}/.okr-env ~/$REPO_DIR/.env'
                                    sshpass -p '$SERVER_PASSWORD' ssh -o StrictHostKeyChecking=no ${env.REMOTE_SERVER_2} 'cd ~/$REPO_DIR && npm install'
                                """
                            }
                        }
                    }
                }
            }
        }

        stage('Run migrations') {
            parallel {
                stage('Run migrations on Server 1') {
                    when {
                        expression { env.REMOTE_SERVER_1 != null }
                    }
                    steps {
sshagent (credentials: [SSH_CREDENTIALS_ID_1]) {
                        script {
                            def output = sh(
                                script: """
                                    ssh -o StrictHostKeyChecking=no $REMOTE_SERVER_1 '
                                    cd $REPO_DIR && npm run migration:generate-run || true'
                                """,
                                returnStdout: true
                            ).trim()
                            echo "Migration Output on Server 1: ${output}"
                            if (output.contains('No changes in database schema were found')) {
                                echo 'No database schema changes found, skipping migration.'
                            } else {
                                sh """
                                    ssh -o StrictHostKeyChecking=no $REMOTE_SERVER_1 '
                                    cd $REPO_DIR && npm run migration:run'
                                """
                            }
                        }
                    }
                }
}

                stage('Run migrations on Server 2') {
                    when {
                        expression { env.REMOTE_SERVER_2 != null && env.BRANCH_NAME == "'preview'" }
                    }
                    steps {
 withCredentials([string(credentialsId: 'pepproduction2', variable: 'SERVER_PASSWORD')]) {
                        script {
                            withCredentials([string(credentialsId: 'pepproduction2', variable: 'SERVER_PASSWORD')]) {
                                def output = sh(
                                    script: """
                                        sshpass -p "$SERVER_PASSWORD" ssh -o StrictHostKeyChecking=no $REMOTE_SERVER_2 '
                                        cd $REPO_DIR && npm run migration:generate-run || true'
                                    """,
                                    returnStdout: true
                                ).trim()
                                echo "Migration Output on Server 2: ${output}"
                                if (output.contains('No changes in database schema were found')) {
                                    echo 'No database schema changes found, skipping migration.'
                                } else {
                                    sh """
                                        sshpass -p "$SERVER_PASSWORD" ssh -o StrictHostKeyChecking=no $REMOTE_SERVER_2 '
                                        cd $REPO_DIR && npm run migration:run'
                                    """
                                }
                            }
                        }
                    }
                }
            }
        }
}

        stage('Run Nest.js App') {
            parallel {
                stage('Start App on Server 1-test/prod') {
                    when {
                        expression { env.BRANCH_NAME == "'develop'" || env.BRANCH_NAME == "'production'" }
                    }
                    steps {
                        sshagent([env.SSH_CREDENTIALS_ID_1]) {
                            sh """
                                ssh -o StrictHostKeyChecking=no ${env.REMOTE_SERVER_1} '
                                    cd $REPO_DIR &&
                                    npm run build &&
                                    sudo pm2 delete okr-backend || true &&
                                    sudo npm run start:prod
                                '
                            """
                        }
                    }
                }

                stage('Start App on Server 1-staging') {
                    when {
                        expression { env.BRANCH_NAME == "'staging'" }
                    }
                    steps {
                        sshagent([env.SSH_CREDENTIALS_ID_1]) {
                            sh """
                                ssh -o StrictHostKeyChecking=no ${env.REMOTE_SERVER_1} '
                                    cd $REPO_DIR &&
                                    npm run build &&
                                    sudo pm2 delete okr-backend-staging || true &&
                                    sudo npm run start:stage
                                '
                            """
                        }
                    }
                }

                stage('Start App on Server 2-balancer') {
                    when {
                        expression { env.REMOTE_SERVER_2 != null && env.BRANCH_NAME == "'develop'" }
                    }
                    steps {
                        withCredentials([string(credentialsId: 'pepproduction2', variable: 'SERVER_PASSWORD')]) {
                            sh """
                                sshpass -p '$SERVER_PASSWORD' ssh -o StrictHostKeyChecking=no ${env.REMOTE_SERVER_2} '
                                    cd $REPO_DIR &&
                                    npm run build &&
                                    sudo pm2 delete okr-backend || true &&
                                    sudo npm run start:prod
                                '
                            """
                        }
                    }
                }

                stage('Start App on Server 2-preview') {
                    when {
                        expression { env.REMOTE_SERVER_2 != null && env.BRANCH_NAME == "'preview'" }
                    }
                    steps {
                        withCredentials([string(credentialsId: 'pepproduction2', variable: 'SERVER_PASSWORD')]) {
                            sh """
                                sshpass -p '$SERVER_PASSWORD' ssh -o StrictHostKeyChecking=no ${env.REMOTE_SERVER_2} '
                                    cd $REPO_DIR &&
                                    npm run build &&
                                    sudo pm2 delete okr-backend-preview || true &&
                                    sudo npm run start:preview
                                '
                            """
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
