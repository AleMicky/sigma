# ==============================================================================
# SIGMA - Makefile para Operaciones y Despliegue
# ==============================================================================

SHELL := /bin/bash
COMPOSE_PROD := docker compose -f compose.prod.yml
COMPOSE_DEV  := docker compose -f compose.yml
NETWORK_NAME := infraestructura-network

# Colores para salida en consola
GREEN  := \033[0;32m
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
init-env: ## Crea el archivo .env a partir de .env.example si no existe
	@if [ ! -f .env ]; then \
		printf "$(YELLOW)Creando .env a partir de .env.example...$(RESET)\n"; \
		cp .env.example .env; \
		printf "$(GREEN).env creado exitosamente. Por favor actualiza sus variables.$(RESET)\n"; \
	else \
		printf "$(BLUE).env ya existe.$(RESET)\n"; \
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

# ------------------------------------------------------------------------------
# Despliegue en Producción (compose.prod.yml)
# ------------------------------------------------------------------------------

.PHONY: deploy
deploy: init-env init-network ## Despliega todo el stack en producción (build + up en background)
	@printf "$(YELLOW)Desplegando stack de producción SIGMA...$(RESET)\n"
	$(COMPOSE_PROD) up -d --build
	@printf "$(GREEN)Despliegue completado exitosamente.$(RESET)\n"

.PHONY: deploy-api
deploy-api: init-network ## Reconstruye y despliega únicamente el servicio API en producción
	@printf "$(YELLOW)Desplegando API en producción...$(RESET)\n"
	$(COMPOSE_PROD) up -d --build api
	@printf "$(GREEN)API desplegada exitosamente.$(RESET)\n"

.PHONY: deploy-web
deploy-web: init-network ## Reconstruye y despliega únicamente el frontend Web en producción
	@printf "$(YELLOW)Desplegando Web en producción...$(RESET)\n"
	$(COMPOSE_PROD) up -d --build web
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
	cd apps/web && pnpm install && pnpm build

.PHONY: clean
clean: ## Limpia imágenes huérfanas/intermedias de Docker
	@printf "$(YELLOW)Limpiando imágenes intermedias...$(RESET)\n"
	docker image prune -f

.PHONY: prune
prune: ## Limpieza profunda de Docker (imágenes, contenedores detenidos y volúmenes sin uso)
	@printf "$(YELLOW)Ejecutando limpieza profunda del sistema Docker...$(RESET)\n"
	docker system prune -af --volumes
