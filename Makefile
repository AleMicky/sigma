# ==============================================================================
# SIGMA - Makefile para Operaciones y Despliegue
# ==============================================================================

SHELL := /bin/bash

# Archivos de variables: se usa .env.example como referencia si no existe el real.
# Ningún target escribe .env automáticamente en producción.
ENV_FILE_DEV  := $(if $(wildcard .env),.env,.env.example)
ENV_FILE_TEST := $(if $(wildcard .env.test),.env.test,.env.test.example)
ENV_FILE_PROD := $(if $(wildcard .env),.env,.env.example)

COMPOSE_PROD  := docker compose --env-file $(ENV_FILE_PROD) -f compose.prod.yml
COMPOSE_TEST  := docker compose --env-file $(ENV_FILE_TEST) -f compose.test.yml
COMPOSE_DEV   := docker compose --env-file $(ENV_FILE_DEV) -f compose.yml
NETWORK_NAME      := infraestructura-network
NETWORK_TEST_NAME := sigma-network

# Colores para salida en consola
GREEN  := \033[0;32m
RED    := \033[0;31m
YELLOW := \033[0;33m
BLUE   := \033[0;34m
CYAN   := \033[0;36m
RESET  := \033[0m

.DEFAULT_GOAL := help

.PHONY: help
help: ## Muestra este menú de ayuda interactivo
	@printf "$(BLUE)============================================================$(RESET)\n"
	@printf "$(BLUE)              SIGMA - Comandos de Despliegue y Ops          $(RESET)\n"
	@printf "$(BLUE)============================================================$(RESET)\n"
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  $(GREEN)%-20s$(RESET) %s\n", $$1, $$2}' $(MAKEFILE_LIST)
	@printf "\n"

# ------------------------------------------------------------------------------
# Configuración Inicial y Redes
# ------------------------------------------------------------------------------

.PHONY: init-env
init-env: ## Crea .env desde .env.example SOLO para desarrollo local (nunca en deploy)
	@if [ ! -f .env ]; then \
		printf "$(YELLOW)Creando .env a partir de .env.example (solo desarrollo)...$(RESET)\n"; \
		cp .env.example .env; \
		printf "$(GREEN).env creado exitosamente. Por favor actualiza sus variables.$(RESET)\n"; \
	else \
		printf "$(BLUE).env ya existe.$(RESET)\n"; \
	fi

.PHONY: check-env
check-env: ## Verifica que exista un .env real antes de desplegar (nunca lo crea)
	@if [ ! -f .env ]; then \
		printf "$(RED)ERROR: no existe .env. Cópialo manualmente desde .env.example y completa valores reales antes de desplegar.$(RESET)\n"; \
		exit 1; \
	fi
	@if grep -Eq '^[[:space:]]*(DB_PASSWORD|KEYCLOAK_CLIENT_SECRET|FLOWABLE_PASSWORD)[[:space:]]*=[[:space:]]*(change-me|postgres|)[[:space:]]*$$' .env; then \
		printf "$(RED)ERROR: .env contiene valores de ejemplo (change-me/postgres/vacío). Completa secretos reales antes de desplegar.$(RESET)\n"; \
		exit 1; \
	fi

.PHONY: init-network
init-network: ## Crea la red Docker externa 'infraestructura-network' si no existe
	@if ! docker network ls --format '{{.Name}}' | grep -wq $(NETWORK_NAME); then \
		printf "$(YELLOW)Creando red Docker externa: $(NETWORK_NAME)...$(RESET)\n"; \
		docker network create $(NETWORK_NAME); \
		printf "$(GREEN)Red $(NETWORK_NAME) creada.$(RESET)\n"; \
	else \
		printf "$(BLUE)La red $(NETWORK_NAME) ya existe.$(RESET)\n"; \
	fi

.PHONY: init-network-test
init-network-test: ## Crea la red externa 'sigma-network' usada por compose.test.yml si no existe
	@if ! docker network ls --format '{{.Name}}' | grep -wq $(NETWORK_TEST_NAME); then \
		printf "$(YELLOW)Creando red externa de test: $(NETWORK_TEST_NAME)...$(RESET)\n"; \
		docker network create $(NETWORK_TEST_NAME); \
		printf "$(GREEN)Red $(NETWORK_TEST_NAME) creada.$(RESET)\n"; \
	else \
		printf "$(BLUE)La red $(NETWORK_TEST_NAME) ya existe.$(RESET)\n"; \
	fi

# ------------------------------------------------------------------------------
# Validación
# ------------------------------------------------------------------------------

.PHONY: validate-compose
validate-compose: ## Valida los 3 stacks de Docker Compose (config --quiet, sin exponer secretos)
	@printf "$(YELLOW)Validando stacks de Docker Compose...$(RESET)\n"
	docker compose --env-file $(ENV_FILE_DEV) -f compose.yml config --quiet
	docker compose --env-file $(ENV_FILE_TEST) -f compose.test.yml config --quiet
	docker compose --env-file $(ENV_FILE_PROD) -f compose.prod.yml config --quiet
	@printf "$(GREEN)Los 3 stacks son válidos.$(RESET)\n"

.PHONY: lint-web
lint-web: ## Ejecuta ESLint del frontend Web (gate de calidad)
	@printf "$(YELLOW)Ejecutando lint de Web...$(RESET)\n"
	pnpm --filter web lint

# ------------------------------------------------------------------------------
# Despliegue en Producción (compose.prod.yml)
# ------------------------------------------------------------------------------

.PHONY: deploy
deploy: check-env validate-compose init-network ## Despliega todo el stack en producción (build + up en background)
	@printf "$(YELLOW)Desplegando stack de producción SIGMA...$(RESET)\n"
	$(COMPOSE_PROD) up -d --build --remove-orphans
	@printf "$(GREEN)Despliegue completado exitosamente.$(RESET)\n"

.PHONY: deploy-api
deploy-api: init-network ## Reconstruye y despliega únicamente el servicio API en producción
	@printf "$(YELLOW)Desplegando API en producción...$(RESET)\n"
	$(COMPOSE_PROD) up -d --build --remove-orphans api
	@printf "$(GREEN)API desplegada exitosamente.$(RESET)\n"

.PHONY: deploy-web
deploy-web: init-network ## Reconstruye y despliega únicamente el frontend Web en producción
	@printf "$(YELLOW)Desplegando Web en producción...$(RESET)\n"
	$(COMPOSE_PROD) up -d --build --remove-orphans web
	@printf "$(GREEN)Web desplegada exitosamente.$(RESET)\n"

.PHONY: pull-deploy
pull-deploy: ## Descarga últimos cambios de Git (git pull) y despliega producción
	@printf "$(YELLOW)Actualizando repositorio...$(RESET)\n"
	git pull
	@$(MAKE) deploy

.PHONY: down
down: ## Detiene y elimina los contenedores del entorno de producción
	@printf "$(YELLOW)Deteniendo stack de producción...$(RESET)\n"
	$(COMPOSE_PROD) down

.PHONY: restart
restart: ## Reinicia los contenedores de producción
	@printf "$(YELLOW)Reiniciando stack de producción...$(RESET)\n"
	$(COMPOSE_PROD) restart

.PHONY: logs
logs: ## Muestra los logs en tiempo real de todos los servicios de producción
	$(COMPOSE_PROD) logs -f

.PHONY: logs-api
logs-api: ## Muestra los logs en tiempo real de la API en producción
	$(COMPOSE_PROD) logs -f api

.PHONY: logs-web
logs-web: ## Muestra los logs en tiempo real de la app Web en producción
	$(COMPOSE_PROD) logs -f web

.PHONY: ps
ps: ## Muestra el estado de los contenedores en producción
	$(COMPOSE_PROD) ps

# ------------------------------------------------------------------------------
# Entorno de Test / Staging (compose.test.yml + .env.test)
# ------------------------------------------------------------------------------

.PHONY: deploy-test
deploy-test: init-network-test ## Despliega el stack de test usando compose.test.yml y .env.test
	@printf "$(YELLOW)Desplegando stack de test SIGMA...$(RESET)\n"
	$(COMPOSE_TEST) up -d --build
	@printf "$(GREEN)Despliegue de test completado exitosamente.$(RESET)\n"

.PHONY: pull-deploy-test
pull-deploy-test: ## Actualiza desde la rama 'test' de Git (git pull) y despliega test
	@printf "$(YELLOW)Actualizando repositorio desde la rama test...$(RESET)\n"
	git checkout test 2>/dev/null || git checkout -b test origin/test || true
	git pull origin test
	@$(MAKE) deploy-test

.PHONY: down-test
down-test: ## Detiene y elimina los contenedores del entorno de test
	@printf "$(YELLOW)Deteniendo stack de test...$(RESET)\n"
	$(COMPOSE_TEST) down

.PHONY: logs-test
logs-test: ## Muestra los logs en tiempo real de todos los servicios de test
	$(COMPOSE_TEST) logs -f

.PHONY: ps-test
ps-test: ## Muestra el estado de los contenedores de test
	$(COMPOSE_TEST) ps

# ------------------------------------------------------------------------------
# Entorno de Desarrollo (compose.yml)
# ------------------------------------------------------------------------------

.PHONY: dev-up
dev-up: init-env ## Inicia el stack de desarrollo local (PostgreSQL + API + Web)
	@printf "$(YELLOW)Iniciando stack de desarrollo...$(RESET)\n"
	$(COMPOSE_DEV) up -d --build
	@printf "$(GREEN)Stack de desarrollo activo en:$(RESET)\n"
	@printf "  - API:      http://localhost:8080/swagger-ui.html\n"
	@printf "  - Web:      http://localhost:3000\n"
	@printf "  - Postgres: localhost:5432\n"

.PHONY: dev-down
dev-down: ## Detiene el stack de desarrollo
	@printf "$(YELLOW)Deteniendo stack de desarrollo...$(RESET)\n"
	$(COMPOSE_DEV) down

.PHONY: dev-logs
dev-logs: ## Muestra los logs del stack de desarrollo
	$(COMPOSE_DEV) logs -f

.PHONY: dev-ps
dev-ps: ## Muestra el estado de los contenedores de desarrollo
	$(COMPOSE_DEV) ps

# ------------------------------------------------------------------------------
# Mantenimiento y Utilidades
# ------------------------------------------------------------------------------

.PHONY: test-api
test-api: ## Ejecuta los tests unitarios de la API con Maven
	@printf "$(YELLOW)Ejecutando tests de la API...$(RESET)\n"
	cd apps/api && ./mvnw test

.PHONY: build-web
build-web: ## Compila el frontend Web localmente con pnpm
	@printf "$(YELLOW)Compilando frontend Web...$(RESET)\n"
	pnpm --filter web install --frozen-lockfile && pnpm --filter web build

.PHONY: clean
clean: ## Limpia imágenes huérfanas/intermedias de Docker
	@printf "$(YELLOW)Limpiando imágenes intermedias...$(RESET)\n"
	docker image prune -f

.PHONY: prune
prune: ## Limpieza segura de Docker (imágenes y contenedores detenidos; NO borra volúmenes)
	@printf "$(YELLOW)Ejecutando limpieza segura del sistema Docker (sin volúmenes)...$(RESET)\n"
	docker system prune -af

.PHONY: prune-volumes
prune-volumes: ## DESTRUCTIVO: borra también volúmenes sin uso. Requiere CONFIRM=YES
	@if [ "$(CONFIRM)" != "YES" ]; then \
		printf "$(RED)ERROR: este target elimina volúmenes. Ejecuta: make prune-volumes CONFIRM=YES$(RESET)\n"; \
		exit 1; \
	fi
	@printf "$(RED)Eliminando volúmenes sin uso (CONFIRM=YES)...$(RESET)\n"
	docker system prune -af --volumes
