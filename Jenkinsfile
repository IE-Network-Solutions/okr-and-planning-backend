pipeline {
    agent any

    options {
        timeout(time: 20, unit: 'MINUTES')
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
        withCredentials([string(credentialsId: 'pepproduction2', variable: 'SERVER_PASSWORD')]) {
            sh """
                sshpass -p '${SERVER_PASSWORD}' ssh -o StrictHostKeyChecking=no ${env.REMOTE_SERVER_1} /bin/bash -c '
                    set -e
                    cd ${env.REPO_DIR}
                    docker build --no-cache -t ${env.DOCKERHUB_REPO}:${env.BRANCH_NAME} .
                    docker image prune -f
                '
            """
        }
    }
}


      stage('Deploy / Update Service') {
    steps {
        withCredentials([string(credentialsId: 'pepproduction2', variable: 'SERVER_PASSWORD')]) {
            sh """
                sshpass -p '${SERVER_PASSWORD}' ssh -o StrictHostKeyChecking=no ${env.REMOTE_SERVER_1} /bin/bash -c '
                    set -e
                    if ! docker info | grep -q "Swarm: active"; then
                        docker swarm init --advertise-addr \$(hostname -I | awk '{print \$1}')
                    fi

                    if docker stack ls | grep -q "pep"; then
                        docker service update --force \\
                            --update-parallelism 1 \\
                            --update-delay 10s \\
                            --image ${env.DOCKERHUB_REPO}:${env.BRANCH_NAME} \\
                            pep_okr_backend
                    else
                        docker stack deploy -c ~/docker-compose.yml pep
                    fi

                    echo "Post-deploy diagnostics:"
                    docker service ls
                    docker service ps pep_okr_backend
                    docker images | grep "${env.DOCKERHUB_REPO}"
                    docker ps --filter "name=pep_okr_backend"

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
