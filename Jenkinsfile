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
        // CHECK-ENV (fail-fast, sin imprimir secretos)
        // ─────────────────────────────────────────────

        stage('check-env') {
            steps {
                sh '''
                    set -eu

                    if [ ! -f "${ENV_FILE}" ]; then
                        echo "ERROR: No existe el archivo de entorno ${ENV_FILE}. Créalo desde .env.example con valores reales antes de ejecutar el pipeline."
                        exit 1
                    fi

                    # Variables críticas declaradas en compose*.yml. Solo se imprimen nombres, nunca valores.
                    REQUIRED_VARS="SPRING_PROFILES_ACTIVE DB_HOST DB_NAME DB_USERNAME DB_PASSWORD CORS_ALLOWED_ORIGINS KEYCLOAK_ISSUER_URI KEYCLOAK_TOKEN_URL KEYCLOAK_LOGOUT_URL KEYCLOAK_CLIENT_ID KEYCLOAK_CLIENT_SECRET FLOWABLE_BASE_URL FLOWABLE_USERNAME FLOWABLE_PASSWORD VITE_API_URL"

                    awk -v vars="${REQUIRED_VARS}" -v env_file="${ENV_FILE}" '
                        BEGIN {
                            n = split(vars, v, " ")
                            for (i = 1; i <= n; i++) required[v[i]] = 1
                            dq = sprintf("%c", 34)
                            sq = sprintf("%c", 39)
                        }
                        /^[[:space:]]*#/ { next }
                        {
                            line = $0
                            sub(/^[[:space:]]*export[[:space:]]+/, "", line)
                            p = index(line, "=")
                            if (p == 0) next
                            name = substr(line, 1, p - 1)
                            gsub(/[[:space:]]/, "", name)
                            if (!(name in required)) next
                            value = substr(line, p + 1)
                            gsub(/^[[:space:]]+|[[:space:]]+$/, "", value)
                            q = substr(value, 1, 1)
                            if ((q == dq || q == sq) && substr(value, length(value), 1) == q)
                                value = substr(value, 2, length(value) - 2)
                            gsub(/^[[:space:]]+|[[:space:]]+$/, "", value)
                            seen[name] = 1
                            if (value == "") empty[name] = 1
                        }
                        END {
                            failed = 0
                            n = split(vars, v, " ")
                            for (i = 1; i <= n; i++) {
                                if (!(v[i] in seen)) {
                                    print "ERROR: falta la variable crítica " v[i] " en " env_file
                                    failed = 1
                                } else if (v[i] in empty) {
                                    print "ERROR: la variable crítica " v[i] " está vacía en " env_file
                                    failed = 1
                                }
                            }
                            exit failed
                        }
                    ' "${ENV_FILE}"

                    echo "check-env OK: ${ENV_FILE} existe y las variables críticas están definidas."
                '''
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
                    changeset "infrastructure/nginx/**"
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
                    changeset "infrastructure/nginx/**"
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
                        changeset "infrastructure/nginx/**"
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
                        changeset "infrastructure/nginx/**"
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
