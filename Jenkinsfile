
pipeline {
    agent any

    options {
        timeout(time: 15, unit: 'MINUTES')
    }

    stages {

        stage('Select Environment') {
            steps {
                script {
                    withCredentials([
                        string(credentialsId: 'REMOTE_SERVER_TEST_LAB', variable: 'REMOTE_SERVER_TEST'),
                        string(credentialsId: 'REMOTE_SERVER_PROD', variable: 'REMOTE_SERVER_PROD')
                    ]) {
                        def branchName = env.GIT_BRANCH ?: sh(
                            script: "git rev-parse --abbrev-ref HEAD",
                            returnStdout: true
                        ).trim()

                        if (branchName.contains('yonas')) {
                            env.REMOTE_SERVER = REMOTE_SERVER_TEST
                            env.SECRETS_PATH = '/home/ubuntu/secrets/.okr-env'
                        }
                    }
                }
            }
        }

        stage('Fetch Application Variables') {
            steps {
                script {
                    withCredentials([string(credentialsId: 'sshpassword', variable: 'SERVER_PASSWORD')]) {
                        def secretsFile = env.SECRETS_PATH

                        env.REPO_URL = sh(
                            script: "sshpass -p '${SERVER_PASSWORD}' ssh -o StrictHostKeyChecking=no ${env.REMOTE_SERVER} 'grep REPO_URL ${secretsFile} | cut -d= -f2'",
                            returnStdout: true
                        ).trim()

                        env.BRANCH_NAME = sh(
                            script: "sshpass -p '${SERVER_PASSWORD}' ssh -o StrictHostKeyChecking=no ${env.REMOTE_SERVER} 'grep BRANCH_NAME ${secretsFile} | cut -d= -f2'",
                            returnStdout: true
                        ).trim()

                        env.REPO_DIR = sh(
                            script: "sshpass -p '${SERVER_PASSWORD}' ssh -o StrictHostKeyChecking=no ${env.REMOTE_SERVER} 'grep REPO_DIR ${secretsFile} | cut -d= -f2'",
                            returnStdout: true
                        ).trim()

                        env.DOCKERHUB_REPO = sh(
                            script: "sshpass -p '${SERVER_PASSWORD}' ssh -o StrictHostKeyChecking=no ${env.REMOTE_SERVER} 'grep DOCKERHUB_REPO ${secretsFile} | cut -d= -f2'",
                            returnStdout: true
                        ).trim()

                        env.SERVICE_NAME = sh(
                            script: "sshpass -p '${SERVER_PASSWORD}' ssh -o StrictHostKeyChecking=no ${env.REMOTE_SERVER} 'grep SERVICE_NAME ${secretsFile} | cut -d= -f2'",
                            returnStdout: true
                        ).trim()
                    }
                }
            }
        }

        stage('Prepare Repository') {
            steps {
                withCredentials([string(credentialsId: 'sshpassword', variable: 'SERVER_PASSWORD')]) {
                    sh """
                        sshpass -p '${SERVER_PASSWORD}' ssh -o StrictHostKeyChecking=no ${env.REMOTE_SERVER} '
                            if [ -d "${env.REPO_DIR}" ]; then
                                sudo chown -R \$USER:\$USER ${env.REPO_DIR}
                                sudo chmod -R 755 ${env.REPO_DIR}
                            fi
                        '
                    """
                }
            }
        }

        stage('Pull Latest Changes') {
            steps {
                withCredentials([string(credentialsId: 'sshpassword', variable: 'SERVER_PASSWORD')]) {
                    sh """
                        sshpass -p '${SERVER_PASSWORD}' ssh -o StrictHostKeyChecking=no ${env.REMOTE_SERVER} '
                            if [ ! -d "${env.REPO_DIR}/.git" ]; then
                                git clone ${env.REPO_URL} -b ${env.BRANCH_NAME} ${env.REPO_DIR}
                            else
                                cd ${env.REPO_DIR} && git reset --hard HEAD && git pull origin ${env.BRANCH_NAME}
                            fi
                        '
                    """
                }
            }
        }

        stage('Clean Old Migrations') {
            steps {
                withCredentials([string(credentialsId: 'sshpassword', variable: 'SERVER_PASSWORD')]) {
                    sh """
                        sshpass -p '${SERVER_PASSWORD}' ssh -o StrictHostKeyChecking=no ${env.REMOTE_SERVER} '
                            if [ -d "${env.REPO_DIR}/src/app/migrations" ]; then
                                echo "Removing old migration files..."
                                rm -f ${env.REPO_DIR}/src/app/migrations/*.ts
                            else
                                echo "No migrations folder found, skipping cleanup."
                            fi
                        '
                    """
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                withCredentials([
                    usernamePassword(credentialsId: 'dockerhub', usernameVariable: 'DOCKERHUB_USERNAME', passwordVariable: 'DOCKERHUB_PASSWORD'),
                    string(credentialsId: 'sshpassword', variable: 'SERVER_PASSWORD')
                ]) {
                    sh """
                        sshpass -p '${SERVER_PASSWORD}' ssh -o StrictHostKeyChecking=no ${env.REMOTE_SERVER} '
                            cd ${env.REPO_DIR} &&
                            docker build -t ${env.DOCKERHUB_REPO}:${env.BRANCH_NAME} . &&
                            echo "$DOCKERHUB_PASSWORD" | docker login -u "$DOCKERHUB_USERNAME" --password-stdin &&
                            docker push ${env.DOCKERHUB_REPO}:${env.BRANCH_NAME} &&
                            docker image prune -f
                        '
                    """
                }
            }
        }

        stage('Deploy Service') {
            steps {
                withCredentials([
                    usernamePassword(credentialsId: 'dockerhub', usernameVariable: 'DOCKERHUB_USERNAME', passwordVariable: 'DOCKERHUB_PASSWORD'),
                    string(credentialsId: 'sshpassword', variable: 'SERVER_PASSWORD')
                ]) {
                    script {
                        sh """
                            sshpass -p '${SERVER_PASSWORD}' ssh -o StrictHostKeyChecking=no ${env.REMOTE_SERVER} "
                                echo '${DOCKERHUB_PASSWORD}' | docker login -u '${DOCKERHUB_USERNAME}' --password-stdin
                                
                                if ! docker pull ${env.DOCKERHUB_REPO}:${env.BRANCH_NAME}; then
                                    echo 'ERROR: Failed to pull Docker image'
                                    exit 1
                                fi
                                
                                if docker service inspect ${env.SERVICE_NAME} >/dev/null 2>&1; then
                                    echo 'Updating existing service...'
                                    if ! docker service update --image ${env.DOCKERHUB_REPO}:${env.BRANCH_NAME} --with-registry-auth --force ${env.SERVICE_NAME}; then
                                        echo 'ERROR: Failed to update service'
                                        exit 1
                                    fi
                                else
                                    echo 'Creating new service...'
                                    if [ '${env.BRANCH_NAME}' = 'staging' ]; then
                                        if ! docker stack deploy -c stage-docker-compose.yml staging; then
                                            echo 'ERROR: Failed to deploy stack'
                                            exit 1
                                        fi
                                    else
                                        if ! docker stack deploy -c docker-compose.yml pep; then
                                            echo 'ERROR: Failed to deploy stack'
                                            exit 1
                                        fi
                                    fi
                                fi
                            "
                        """
                    }
                }
            }
        }

        stage('Verify Deployment') {
            steps {
                withCredentials([string(credentialsId: 'sshpassword', variable: 'SERVER_PASSWORD')]) {
                    script {
                        sh """
                            sshpass -p '${SERVER_PASSWORD}' ssh -o StrictHostKeyChecking=no ${env.REMOTE_SERVER} '
                                echo "Verifying deployment status..."

                                for i in {1..20}; do
                                    STATUS=\$(docker service inspect --format "{{ if .UpdateStatus }}{{ .UpdateStatus.State }}{{ else }}none{{ end }}" ${env.SERVICE_NAME} 2>/dev/null)

                                    if [ -z "\$STATUS" ]; then
                                        STATUS="none"
                                    fi

                                    echo "Current update status: \$STATUS"

                                    if [ "\$STATUS" = "rollback_started" ] || [ "\$STATUS" = "rollback_completed" ] || [ "\$STATUS" = "rollback_paused" ]; then
                                        echo "Service is rolling back! Deployment failed."
                                        exit 1
                                    fi

                                    if [ "\$STATUS" = "completed" ] || [ "\$STATUS" = "none" ]; then
                                        echo "Service update completed successfully."
                                        break
                                    fi

                                    sleep 5
                                done
                            '
                        """
                    }
                }
            }
        }

    }

    post {
        success {
            withCredentials([string(credentialsId: 'sshpassword', variable: 'SERVER_PASSWORD')]) {
                sh """
                   sshpass -p '${SERVER_PASSWORD}' ssh -o StrictHostKeyChecking=no ${env.REMOTE_SERVER} '
                    if docker service inspect ${env.SERVICE_NAME} >/dev/null 2>&1; then
                        echo "Cleaning up stopped containers for service ${env.SERVICE_NAME}..."
                        docker ps -a \
                            --filter "label=com.docker.swarm.service.name=${env.SERVICE_NAME}" \
                            --filter "status=exited" -q | xargs -r docker rm -f
                    fi
                '
                """
            }
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
                to: 'yonas.t@ienetworks.co'
            )
        }
    }
}
