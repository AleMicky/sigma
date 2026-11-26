pipeline {
    agent any

    options {
        disableConcurrentBuilds()
        timestamps()
    }

    parameters {
        booleanParam(
            name: 'FORCE_DEPLOY',
            defaultValue: false,
            description: 'Permite desplegar explícitamente a producción desde una rama distinta a main'
        )
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
                    set -eu
                    echo "Validando configuración Docker Compose..."

                    docker compose \
                        --env-file "${ENV_FILE}" \
                        -p "${PROJECT_NAME}" \
                        -f "${COMPOSE_FILE}" \
                        config --quiet
                '''
            }
        }

        // ─────────────────────────────────────────────
        // API
        // ─────────────────────────────────────────────

        stage('Test API') {
            when {
                anyOf {
                    changeset "apps/api/**"
                    changeset "compose.prod.yml"
                }
            }

            steps {
                echo 'Cambios detectados en API. Ejecutando tests unitarios...'

                sh '''
                    set -eu
                    cd apps/api
                    chmod +x mvnw
                    ./mvnw test -B
                '''
            }
        }

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
                    set -eu
                    docker compose \
                        --env-file "${ENV_FILE}" \
                        -p "${PROJECT_NAME}" \
                        -f "${COMPOSE_FILE}" \
                        build api
                '''
            }
        }

        stage('Deploy API') {
            when {
                allOf {
                    anyOf {
                        branch 'main'
                        expression { env.GIT_BRANCH == 'origin/main' || env.GIT_BRANCH == 'main' }
                        expression { params.FORCE_DEPLOY == true }
                    }
                    anyOf {
                        changeset "apps/api/**"
                        changeset "compose.prod.yml"
                    }
                }
            }

            steps {
                echo 'Desplegando API...'

                sh '''
                    set -eu
                    docker compose \
                        --env-file "${ENV_FILE}" \
                        -p "${PROJECT_NAME}" \
                        -f "${COMPOSE_FILE}" \
                        up -d --no-deps api
                '''
            }
        }

        stage('Verify API') {
            when {
                allOf {
                    anyOf {
                        branch 'main'
                        expression { env.GIT_BRANCH == 'origin/main' || env.GIT_BRANCH == 'main' }
                        expression { params.FORCE_DEPLOY == true }
                    }
                    anyOf {
                        changeset "apps/api/**"
                        changeset "compose.prod.yml"
                    }
                }
            }

            steps {
                sh '''
                    set -eu
                    echo "Verificando estado healthy de api..."

                    CONTAINER_ID=$(docker compose \
                        --env-file "${ENV_FILE}" \
                        -p "${PROJECT_NAME}" \
                        -f "${COMPOSE_FILE}" \
                        ps -q api)

                    if [ -z "${CONTAINER_ID}" ]; then
                        echo "ERROR: No se encontró un contenedor activo para el servicio api."
                        exit 1
                    fi

                    MAX_ATTEMPTS=36
                    SLEEP_SECONDS=5
                    STATUS="unknown"

                    for i in $(seq 1 "${MAX_ATTEMPTS}"); do
                        STATUS=$(docker inspect --format '{{.State.Health.Status}}' "${CONTAINER_ID}" 2>/dev/null || echo "missing")
                        echo "[Intento ${i}/${MAX_ATTEMPTS}] Estado health de api (${CONTAINER_ID}): ${STATUS}"

                        if [ "${STATUS}" = "healthy" ]; then
                            echo "Servicio api alcanzó estado healthy."
                            exit 0
                        fi

                        if [ "${STATUS}" = "unhealthy" ] || [ "${STATUS}" = "missing" ]; then
                            echo "ERROR: Servicio api en estado no saludable (${STATUS})."
                            docker compose --env-file "${ENV_FILE}" -p "${PROJECT_NAME}" -f "${COMPOSE_FILE}" logs --tail=50 api || true
                            exit 1
                        fi

                        sleep "${SLEEP_SECONDS}"
                    done

                    echo "ERROR: Timeout esperando estado healthy en api (último estado: ${STATUS})."
                    docker compose --env-file "${ENV_FILE}" -p "${PROJECT_NAME}" -f "${COMPOSE_FILE}" logs --tail=50 api || true
                    exit 1
                '''
            }
        }

        // ─────────────────────────────────────────────
        // WEB
        // ─────────────────────────────────────────────

        stage('Verify Web Build') {
            when {
                anyOf {
                    changeset "apps/web/**"
                    changeset "package.json"
                    changeset "pnpm-lock.yaml"
                    changeset "pnpm-workspace.yaml"
                    changeset ".dockerignore"
                    changeset "compose.prod.yml"
                }
            }

            steps {
                echo 'Cambios detectados en Web. Verificando lint, tests unitarios y compilación TypeScript/Vite...'

                sh '''
                    set -eu
                    pnpm --filter web install --frozen-lockfile
                    pnpm --filter web lint
                    pnpm --filter web test
                    pnpm --filter web build
                '''
            }
        }

        stage('Build Web') {
            when {
                anyOf {
                    changeset "apps/web/**"
                    changeset "package.json"
                    changeset "pnpm-lock.yaml"
                    changeset "pnpm-workspace.yaml"
                    changeset ".dockerignore"
                    changeset "compose.prod.yml"
                }
            }

            steps {
                echo 'Cambios detectados en Web. Construyendo...'

                sh '''
                    set -eu
                    docker compose \
                        --env-file "${ENV_FILE}" \
                        -p "${PROJECT_NAME}" \
                        -f "${COMPOSE_FILE}" \
                        build web
                '''
            }
        }

        stage('Deploy Web') {
            when {
                allOf {
                    anyOf {
                        branch 'main'
                        expression { env.GIT_BRANCH == 'origin/main' || env.GIT_BRANCH == 'main' }
                        expression { params.FORCE_DEPLOY == true }
                    }
                    anyOf {
                        changeset "apps/web/**"
                        changeset "package.json"
                        changeset "pnpm-lock.yaml"
                        changeset "pnpm-workspace.yaml"
                        changeset ".dockerignore"
                        changeset "compose.prod.yml"
                    }
                }
            }

            steps {
                echo 'Desplegando Web...'

                sh '''
                    set -eu
                    docker compose \
                        --env-file "${ENV_FILE}" \
                        -p "${PROJECT_NAME}" \
                        -f "${COMPOSE_FILE}" \
                        up -d --no-deps web
                '''
            }
        }

        stage('Verify Web') {
            when {
                allOf {
                    anyOf {
                        branch 'main'
                        expression { env.GIT_BRANCH == 'origin/main' || env.GIT_BRANCH == 'main' }
                        expression { params.FORCE_DEPLOY == true }
                    }
                    anyOf {
                        changeset "apps/web/**"
                        changeset "package.json"
                        changeset "pnpm-lock.yaml"
                        changeset "pnpm-workspace.yaml"
                        changeset ".dockerignore"
                        changeset "compose.prod.yml"
                    }
                }
            }

            steps {
                sh '''
                    set -eu
                    echo "Verificando estado healthy de web..."

                    CONTAINER_ID=$(docker compose \
                        --env-file "${ENV_FILE}" \
                        -p "${PROJECT_NAME}" \
                        -f "${COMPOSE_FILE}" \
                        ps -q web)

                    if [ -z "${CONTAINER_ID}" ]; then
                        echo "ERROR: No se encontró un contenedor activo para el servicio web."
                        exit 1
                    fi

                    MAX_ATTEMPTS=18
                    SLEEP_SECONDS=5
                    STATUS="unknown"

                    for i in $(seq 1 "${MAX_ATTEMPTS}"); do
                        STATUS=$(docker inspect --format '{{.State.Health.Status}}' "${CONTAINER_ID}" 2>/dev/null || echo "missing")
                        echo "[Intento ${i}/${MAX_ATTEMPTS}] Estado health de web (${CONTAINER_ID}): ${STATUS}"

                        if [ "${STATUS}" = "healthy" ]; then
                            echo "Servicio web alcanzó estado healthy."
                            exit 0
                        fi

                        if [ "${STATUS}" = "unhealthy" ] || [ "${STATUS}" = "missing" ]; then
                            echo "ERROR: Servicio web en estado no saludable (${STATUS})."
                            docker compose --env-file "${ENV_FILE}" -p "${PROJECT_NAME}" -f "${COMPOSE_FILE}" logs --tail=50 web || true
                            exit 1
                        fi

                        sleep "${SLEEP_SECONDS}"
                    done

                    echo "ERROR: Timeout esperando estado healthy en web (último estado: ${STATUS})."
                    docker compose --env-file "${ENV_FILE}" -p "${PROJECT_NAME}" -f "${COMPOSE_FILE}" logs --tail=50 web || true
                    exit 1
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
                        --env-file "${ENV_FILE}" \
                        -p "${PROJECT_NAME}" \
                        -f "${COMPOSE_FILE}" \
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
