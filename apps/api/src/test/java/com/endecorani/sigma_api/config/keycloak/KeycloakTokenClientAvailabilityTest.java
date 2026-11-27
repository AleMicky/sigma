package com.endecorani.sigma_api.config.keycloak;

import com.endecorani.sigma_api.shared.domain.exception.BusinessException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;
import tools.jackson.databind.json.JsonMapper;

import java.net.SocketTimeoutException;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withException;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withServerError;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withStatus;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

/** REQ-SEG-115: 5xx/red en client_credentials debe ser 503 KEYCLOAK_UNAVAILABLE. */
class KeycloakTokenClientAvailabilityTest {

    private static final String TOKEN_URL =
            "https://kc.test/realms/sigma/protocol/openid-connect/token";

    private MockRestServiceServer server;
    private KeycloakTokenClient client;

    @BeforeEach
    void setUp() {
        RestClient.Builder builder = RestClient.builder();
        server = MockRestServiceServer.bindTo(builder).build();
        KeycloakProperties properties = new KeycloakProperties(
                null, "sigma", TOKEN_URL, null, "sigma-web", "secret", "sigma-api");
        client = new KeycloakTokenClient(properties, JsonMapper.builder().build(), builder.build());
    }

    @Test
    void clientCredentialsCon5xx_debeLanzar503KeycloakUnavailable() {
        server.expect(requestTo(TOKEN_URL))
                .andRespond(withServerError()
                        .body("{\"error\":\"internal\"}")
                        .contentType(MediaType.APPLICATION_JSON));

        BusinessException exception = assertThrows(
                BusinessException.class, client::adminApiClientCredentialsGrant);

        assertEquals("KEYCLOAK_UNAVAILABLE", exception.getCode());
        server.verify();
    }

    @Test
    void clientCredentialsConFalloDeRed_debeLanzar503KeycloakUnavailable() {
        server.expect(requestTo(TOKEN_URL))
                .andRespond(withException(new SocketTimeoutException("timeout")));

        BusinessException exception = assertThrows(
                BusinessException.class, client::adminApiClientCredentialsGrant);

        assertEquals("KEYCLOAK_UNAVAILABLE", exception.getCode());
        server.verify();
    }

    @Test
    void clientCredentialsRechazadoPorCredenciales_debeMantener422KeycloakSyncError() {
        server.expect(requestTo(TOKEN_URL))
                .andRespond(withStatus(HttpStatus.BAD_REQUEST)
                        .body("{\"error\":\"invalid_client\"}")
                        .contentType(MediaType.APPLICATION_JSON));

        BusinessException exception = assertThrows(
                BusinessException.class, client::adminApiClientCredentialsGrant);

        assertEquals("KEYCLOAK_SYNC_ERROR", exception.getCode());
        server.verify();
    }

    @Test
    void clientCredentialsValido_debeRetornarAccessToken() {
        server.expect(requestTo(TOKEN_URL))
                .andRespond(withSuccess(
                        "{\"access_token\":\"service-token\",\"token_type\":\"Bearer\"}",
                        MediaType.APPLICATION_JSON));

        assertEquals("service-token",
                client.adminApiClientCredentialsGrant().accessToken());
        server.verify();
    }
}
