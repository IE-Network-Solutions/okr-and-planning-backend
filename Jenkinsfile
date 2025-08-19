
pipeline {
    agent any

    options {
        timeout(time: 5, unit: 'MINUTES')
    }

    stages {
        stage('Select Environment') {
            steps {
                script {
                    withCredentials([string(credentialsId: 'REMOTE_SERVER_TEST_LAB', variable: 'REMOTE_SERVER_TEST')]) {
                        def branchName = env.GIT_BRANCH ?: sh(script: "git rev-parse --abbrev-ref HEAD", returnStdout: true).trim()
                        env.BRANCH_NAME = branchName

                        if (branchName.contains('yonas')) {
                            env.SSH_CREDENTIALS_ID_1 = 'testlab'
                            env.REMOTE_SERVER_1 = REMOTE_SERVER_TEST
                            env.SECRETS_PATH = '/home/ubuntu/secrets/.okr-env'
                        } else {
                            error("Branch does not match expected pattern for deployment")
                        }
                    }
                }
            }
        }

        stage('Fetch Environment Variables') {
            steps {
                script {
                    withCredentials([string(credentialsId: 'pepproduction2', variable: 'SERVER_PASSWORD')]) {
                        def secretsPath = env.SECRETS_PATH
                        env.REPO_URL = sh(script: "sshpass -p '${SERVER_PASSWORD}' ssh -o StrictHostKeyChecking=no ${env.REMOTE_SERVER_1} 'grep REPO_URL ${secretsPath} | cut -d= -f2'", returnStdout: true).trim()
                        env.BRANCH_NAME = sh(script: "sshpass -p '${SERVER_PASSWORD}' ssh -o StrictHostKeyChecking=no ${env.REMOTE_SERVER_1} 'grep BRANCH_NAME ${secretsPath} | cut -d= -f2'", returnStdout: true).trim()
                        env.REPO_DIR = sh(script: "sshpass -p '${SERVER_PASSWORD}' ssh -o StrictHostKeyChecking=no ${env.REMOTE_SERVER_1} 'grep REPO_DIR ${secretsPath} | cut -d= -f2'", returnStdout: true).trim()
                        env.DOCKERHUB_REPO = sh(script: "sshpass -p '${SERVER_PASSWORD}' ssh -o StrictHostKeyChecking=no ${env.REMOTE_SERVER_1} 'grep DOCKERHUB_REPO ${secretsPath} | cut -d= -f2'", returnStdout: true).trim()
                        env.SERVICE_NAME = sh(script: "sshpass -p '${SERVER_PASSWORD}' ssh -o StrictHostKeyChecking=no ${env.REMOTE_SERVER_1} 'grep SERVICE_NAME ${secretsPath} | cut -d= -f2'", returnStdout: true).trim()
                    }
                }
            }
        }

        stage('Prepare Repository') {
            steps {
                withCredentials([string(credentialsId: 'pepproduction2', variable: 'SERVER_PASSWORD')]) {
                    sh """
                        sshpass -p '${SERVER_PASSWORD}' ssh -o StrictHostKeyChecking=no ${env.REMOTE_SERVER_1} '
                        if [ -d "${env.REPO_DIR}" ]; then
                            sudo chown -R \$USER:\$USER ${env.REPO_DIR}
                            sudo chmod -R 755 ${env.REPO_DIR}
                        fi'
                    """
                }
            }
        }

        stage('Pull Latest Changes') {
            steps {
                withCredentials([string(credentialsId: 'pepproduction2', variable: 'SERVER_PASSWORD')]) {
                    sh """
                        sshpass -p '${SERVER_PASSWORD}' ssh -o StrictHostKeyChecking=no ${env.REMOTE_SERVER_1} '
                        if [ ! -d "${env.REPO_DIR}/.git" ]; then
                            git clone ${env.REPO_URL} -b ${env.BRANCH_NAME} ${env.REPO_DIR}
                        else
                            cd ${env.REPO_DIR} && git reset --hard HEAD && git pull origin ${env.BRANCH_NAME}
                        fi'
                    """
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                withCredentials([
                    usernamePassword(credentialsId: 'dockerhub', usernameVariable: 'DOCKERHUB_USERNAME', passwordVariable: 'DOCKERHUB_PASSWORD'),
                    string(credentialsId: 'pepproduction2', variable: 'SERVER_PASSWORD')
                ]) {
                    sh """
                        sshpass -p '${SERVER_PASSWORD}' ssh -o StrictHostKeyChecking=no ${env.REMOTE_SERVER_1} '
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

stage('Deploy / Update Service') {
    steps {
        withCredentials([
            usernamePassword(credentialsId: 'dockerhub', usernameVariable: 'DOCKERHUB_USERNAME', passwordVariable: 'DOCKERHUB_PASSWORD'),
            string(credentialsId: 'pepproduction2', variable: 'SERVER_PASSWORD')
        ]) {

            // Deploy stack
            sh """
                sshpass -p '${SERVER_PASSWORD}' ssh -o StrictHostKeyChecking=no ${env.REMOTE_SERVER_1} '
                    echo "$DOCKERHUB_PASSWORD" | docker login -u "$DOCKERHUB_USERNAME" --password-stdin &&
                    docker pull ${env.DOCKERHUB_REPO}:${env.BRANCH_NAME} &&
                    docker stack deploy -c docker-compose.yml pep
                '
            """

            // Wait and check for rollback
           sh """
sshpass -p '${SERVER_PASSWORD}' ssh -o StrictHostKeyChecking=no ${env.REMOTE_SERVER_1} bash -s <<'ENDSSH'
for i in {1..10}; do
    STATUS=\$(docker service inspect --format '{{if .UpdateStatus}}{{.UpdateStatus.State}}{{else}}none{{end}}' "$SERVICE_NAME")
    echo "Current update status: \$STATUS"

    if [ "\$STATUS" = "rollback_started" ] || [ "\$STATUS" = "rollback_completed" ]; then
        echo "Service is rolling back!"
        exit 1
    fi

    if [ "\$STATUS" = "completed" ]; then
        break
    fi

    sleep 5
done
ENDSSH
"""


            // Clean up old containers
            sh """
                sshpass -p '${SERVER_PASSWORD}' ssh -o StrictHostKeyChecking=no ${env.REMOTE_SERVER_1} '
                    docker container prune -f
                '
            """
        }
    }
}





    }

    post {
        success {
            echo 'Application deployed/updated successfully using Docker Swarm!'
        }
        failure {
            echo 'Deployment failed.'
        }
    }
}
