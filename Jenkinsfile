pipeline {
    agent any

    options {
        disableConcurrentBuilds()
        timestamps()
    }

    environment {
        COMPOSE_FILE = 'compose.prod.yml'
        ENV_FILE = '/opt/infraestructura/sigma/.env'
        PROJECT_NAME = 'sigma-prod'
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Validate') {
            steps {
                sh '''
                    echo "Validando configuración Docker Compose..."

                    docker compose \
                        --env-file ${ENV_FILE} \
                        -p ${PROJECT_NAME} \
                        -f ${COMPOSE_FILE} \
                        config --quiet
                '''
            }
        }

        stage('Build') {
            steps {
                sh '''
                    echo "Construyendo SIGMA..."

                    docker compose \
                        --env-file ${ENV_FILE} \
                        -p ${PROJECT_NAME} \
                        -f ${COMPOSE_FILE} \
                        build
                '''
            }
        }

        stage('Deploy') {
            steps {
                sh '''
                    echo "Desplegando SIGMA..."

                    docker compose \
                        --env-file ${ENV_FILE} \
                        -p ${PROJECT_NAME} \
                        -f ${COMPOSE_FILE} \
                        up -d --remove-orphans
                '''
            }
        }

        stage('Verify') {
            steps {
                sh '''
                    echo "Esperando servicios..."
                    sleep 15

                    docker compose \
                        --env-file ${ENV_FILE} \
                        -p ${PROJECT_NAME} \
                        -f ${COMPOSE_FILE} \
                        ps
                '''
            }
        }
    }

    post {
        success {
            echo 'SIGMA desplegado correctamente.'
        }

        failure {
            echo 'Falló el despliegue de SIGMA.'
        }

        always {
            sh '''
                docker image prune -f || true
            '''
        }
    }
}