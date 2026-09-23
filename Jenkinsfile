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

        // ─────────────────────────────────────────────
        // CHECKOUT
        // ─────────────────────────────────────────────

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        // ─────────────────────────────────────────────
        // VALIDATE
        // ─────────────────────────────────────────────

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

        // ─────────────────────────────────────────────
        // API
        // ─────────────────────────────────────────────

        stage('Build API') {
            when {
                anyOf {
                    changeset "apps/api/**"
                    changeset "compose.prod.yml"
                }
            }

            steps {
                echo 'Cambios detectados en API. Construyendo...'

                sh '''
                    docker compose \
                        --env-file ${ENV_FILE} \
                        -p ${PROJECT_NAME} \
                        -f ${COMPOSE_FILE} \
                        build api
                '''
            }
        }

        stage('Deploy API') {
            when {
                anyOf {
                    changeset "apps/api/**"
                    changeset "compose.prod.yml"
                }
            }

            steps {
                echo 'Desplegando API...'

                sh '''
                    docker compose \
                        --env-file ${ENV_FILE} \
                        -p ${PROJECT_NAME} \
                        -f ${COMPOSE_FILE} \
                        up -d --no-deps api
                '''
            }
        }

        // ─────────────────────────────────────────────
        // WEB
        // ─────────────────────────────────────────────

        stage('Build Web') {
            when {
                anyOf {
                    changeset "apps/web/**"
                    changeset "compose.prod.yml"
                }
            }

            steps {
                echo 'Cambios detectados en Web. Construyendo...'

                sh '''
                    docker compose \
                        --env-file ${ENV_FILE} \
                        -p ${PROJECT_NAME} \
                        -f ${COMPOSE_FILE} \
                        build web
                '''
            }
        }

        stage('Deploy Web') {
            when {
                anyOf {
                    changeset "apps/web/**"
                    changeset "compose.prod.yml"
                }
            }

            steps {
                echo 'Desplegando Web...'

                sh '''
                    docker compose \
                        --env-file ${ENV_FILE} \
                        -p ${PROJECT_NAME} \
                        -f ${COMPOSE_FILE} \
                        up -d --no-deps web
                '''
            }
        }

        // ─────────────────────────────────────────────
        // VERIFY API
        // ─────────────────────────────────────────────

        stage('Verify API') {
            when {
                anyOf {
                    changeset "apps/api/**"
                    changeset "compose.prod.yml"
                }
            }

            steps {
                sh '''
                    echo "Esperando API..."
                    sleep 15

                    echo "Estado de sigma-api:"

                    docker compose \
                        --env-file ${ENV_FILE} \
                        -p ${PROJECT_NAME} \
                        -f ${COMPOSE_FILE} \
                        ps api
                '''
            }
        }

        // ─────────────────────────────────────────────
        // VERIFY WEB
        // ─────────────────────────────────────────────

        stage('Verify Web') {
            when {
                anyOf {
                    changeset "apps/web/**"
                    changeset "compose.prod.yml"
                }
            }

            steps {
                sh '''
                    echo "Esperando Web..."
                    sleep 5

                    echo "Estado de sigma-web:"

                    docker compose \
                        --env-file ${ENV_FILE} \
                        -p ${PROJECT_NAME} \
                        -f ${COMPOSE_FILE} \
                        ps web
                '''
            }
        }

        // ─────────────────────────────────────────────
        // STATUS
        // ─────────────────────────────────────────────

        stage('Status') {
            steps {
                sh '''
                    echo "Estado actual de SIGMA:"

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
            echo 'Pipeline de SIGMA finalizado correctamente.'
        }

        failure {
            echo 'Falló el pipeline de SIGMA.'
        }

        always {
            sh '''
                echo "Limpiando imágenes Docker no utilizadas..."
                docker image prune -f || true
            '''
        }
    }
}