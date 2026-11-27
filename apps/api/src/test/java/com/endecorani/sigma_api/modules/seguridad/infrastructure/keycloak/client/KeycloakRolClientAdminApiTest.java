package com.endecorani.sigma_api.modules.seguridad.infrastructure.keycloak.client;

import com.endecorani.sigma_api.config.keycloak.KeycloakProperties;
import com.endecorani.sigma_api.config.keycloak.KeycloakTokenClient;
import com.endecorani.sigma_api.modules.auth.application.dto.KeycloakTokenResponse;
import com.endecorani.sigma_api.shared.domain.exception.BusinessException;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.header;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withServerError;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withStatus;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

/** REQ-SEG-006: Admin API de roles con service account y errores sin cuerpo interno. */
@ExtendWith(MockitoExtension.class)
class KeycloakRolClientAdminApiTest {

    private static final String ROLES_URL = "http://keycloak.test/admin/realms/sigma/roles";
    private static final String SERVICE_ACCOUNT_TOKEN = "service-account-token";

    @Mock
    private KeycloakTokenClient tokenClient;

    private MockRestServiceServer server;
    private KeycloakRolClient client;

    @BeforeEach
    void setUp() {
        RestClient.Builder builder = RestClient.builder();
        server = MockRestServiceServer.bindTo(builder).build();
        KeycloakProperties properties = new KeycloakProperties(
                "http://keycloak.test", "sigma", null, null, "sigma-client", null, null);
        client = new KeycloakRolClient(builder.build(), properties, tokenClient);

        // Usuario autenticado con un JWT ajeno: no debe reenviarse a la Admin API.
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken("admin", "user-jwt", List.of()));

        when(tokenClient.adminApiClientCredentialsGrant()).thenReturn(new KeycloakTokenResponse(
                SERVICE_ACCOUNT_TOKEN, null, 3600L, null, "Bearer", null));
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void obtenerTodos_debeEnviarBearerDelServiceAccount() {
        server.expect(requestTo(ROLES_URL))
                .andExpect(header(HttpHeaders.AUTHORIZATION, "Bearer " + SERVICE_ACCOUNT_TOKEN))
                .andRespond(withSuccess("[]", MediaType.APPLICATION_JSON));

        assertEquals(List.of(), client.obtenerTodos());
        server.verify();
    }

    @Test
    void obtenerTodos_keycloak403_debeRetornar422SinBodyInterno() {
        server.expect(requestTo(ROLES_URL))
                .andExpect(header(HttpHeaders.AUTHORIZATION, "Bearer " + SERVICE_ACCOUNT_TOKEN))
                .andRespond(withStatus(HttpStatus.FORBIDDEN)
                        .body("{\"error\":\"forbidden\",\"detail\":\"secret-interno\"}")
                        .contentType(MediaType.APPLICATION_JSON));

        BusinessException ex = assertThrows(BusinessException.class, client::obtenerTodos);

        assertEquals("KEYCLOAK_SYNC_ERROR", ex.getCode());
        assertFalse(ex.getMessage().contains("secret-interno"));
        assertFalse(ex.getMessage().contains("forbidden"));
        server.verify();
    }

    @Test
    void obtenerTodos_keycloak500_debeRetornar503SinBodyInterno() {
        server.expect(requestTo(ROLES_URL))
                .andExpect(header(HttpHeaders.AUTHORIZATION, "Bearer " + SERVICE_ACCOUNT_TOKEN))
                .andRespond(withServerError()
                        .body("{\"detail\":\"internal-access-token=abc123\"}")
                        .contentType(MediaType.APPLICATION_JSON));

        BusinessException ex = assertThrows(BusinessException.class, client::obtenerTodos);

        assertEquals("KEYCLOAK_UNAVAILABLE", ex.getCode());
        assertFalse(ex.getMessage().contains("abc123"));
        assertFalse(ex.getMessage().contains("internal-access-token"));
        server.verify();
    }
}
