package com.endecorani.sigma_api.modules.seguridad.infrastructure.keycloak.client;

import com.endecorani.sigma_api.config.keycloak.KeycloakTokenClient;
import com.endecorani.sigma_api.modules.auth.application.dto.KeycloakTokenResponse;
import com.endecorani.sigma_api.shared.domain.exception.BusinessException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClientResponseException;

/**
 * REQ-SEG-006: la Admin API de Keycloak se invoca siempre con la cuenta de servicio
 * ({@code client_credentials}) y sus errores se traducen a códigos de contrato sin
 * reenviar el cuerpo interno de Keycloak.
 */
@Slf4j
final class KeycloakAdminApiSupport {

    static final String UNAVAILABLE_MESSAGE = "Keycloak no está disponible. Intente nuevamente más tarde";
    static final String UNAVAILABLE_CODE = "KEYCLOAK_UNAVAILABLE";
    static final String SYNC_ERROR_CODE = "KEYCLOAK_SYNC_ERROR";

    private KeycloakAdminApiSupport() {
    }

    static String serviceAccountToken(KeycloakTokenClient tokenClient) {
        KeycloakTokenResponse response = tokenClient.adminApiClientCredentialsGrant();
        if (response == null || response.accessToken() == null || response.accessToken().isBlank()) {
            throw new BusinessException(UNAVAILABLE_CODE, UNAVAILABLE_MESSAGE);
        }
        return response.accessToken();
    }

    static BusinessException mapResponseError(RestClientResponseException exception, String operacion) {
        int status = exception.getStatusCode().value();
        // Detalle (posiblemente con secretos internos) únicamente en el log del servidor.
        // REQ-SEG-114: getResponseBodyAsString() puede ser null (respuestas 200/4xx sin cuerpo).
        String responseBody = exception.getResponseBodyAsString();
        log.error("Keycloak Admin API rechazó {}: status={} body={}",
                operacion, status, responseBody == null ? "" : responseBody, exception);
        if (exception.getStatusCode().is5xxServerError()) {
            return new BusinessException(UNAVAILABLE_CODE, UNAVAILABLE_MESSAGE);
        }
        return new BusinessException(
                SYNC_ERROR_CODE,
                "No se pudo %s en Keycloak Admin API (HTTP %d). Revise la cuenta de servicio configurada"
                        .formatted(operacion, status)
        );
    }

    static BusinessException mapNetworkError(ResourceAccessException exception, String operacion) {
        log.error("Keycloak Admin API no respondió durante {}", operacion, exception);
        return new BusinessException(UNAVAILABLE_CODE, UNAVAILABLE_MESSAGE);
    }

    static BusinessException mapUnexpectedError(Exception exception, String operacion) {
        log.error("Error inesperado al invocar Keycloak Admin API para {}", operacion, exception);
        return new BusinessException(UNAVAILABLE_CODE, UNAVAILABLE_MESSAGE);
    }
}
