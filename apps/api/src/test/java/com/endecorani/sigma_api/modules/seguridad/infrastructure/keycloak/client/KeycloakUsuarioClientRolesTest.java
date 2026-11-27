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
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;

import java.net.SocketTimeoutException;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.header;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withServerError;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withStatus;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withException;

/**
 * REQ-SEG-002 + REQ-SEG-006: fallo cerrado con token de cuenta de servicio (nunca el JWT
 * del usuario) y errores sin cuerpo interno de Keycloak.
 */
@ExtendWith(MockitoExtension.class)
class KeycloakUsuarioClientRolesTest {

    private static final String ROLES_URL =
            "http://keycloak.test/admin/realms/sigma/users/kc-1/role-mappings/realm";
    private static final String USERS_URL =
            "http://keycloak.test/admin/realms/sigma/users?first=0&max=100";
    private static final String SERVICE_ACCOUNT_TOKEN = "service-account-token";
    private static final String USER_TOKEN = "jwt-token";

    @Mock
    private KeycloakTokenClient tokenClient;

    private MockRestServiceServer server;
    private KeycloakUsuarioClient client;

    @BeforeEach
    void setUp() {
        RestClient.Builder builder = RestClient.builder();
        server = MockRestServiceServer.bindTo(builder).build();
        KeycloakProperties properties = new KeycloakProperties(
                "http://keycloak.test", "sigma", null, null, "sigma-client", null, null);
        client = new KeycloakUsuarioClient(builder.build(), properties, tokenClient);

        Jwt jwt = Jwt.withTokenValue(USER_TOKEN)
                .header("alg", "none")
                .subject("kc-admin")
                .build();
        SecurityContextHolder.getContext().setAuthentication(new JwtAuthenticationToken(jwt, List.of()));

        when(tokenClient.adminApiClientCredentialsGrant()).thenReturn(new KeycloakTokenResponse(
                SERVICE_ACCOUNT_TOKEN, null, 3600L, null, "Bearer", null));
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void obtenerRolesDeUsuario_debeUsarTokenDeCuentaDeServicioNoElDelUsuario() {
        server.expect(requestTo(ROLES_URL))
                .andExpect(header(HttpHeaders.AUTHORIZATION, "Bearer " + SERVICE_ACCOUNT_TOKEN))
                .andRespond(withSuccess("[]", MediaType.APPLICATION_JSON));

        assertEquals(List.of(), client.obtenerRolesDeUsuario("kc-1"));
        verify(tokenClient).adminApiClientCredentialsGrant();
        server.verify();
    }

    @Test
    void obtenerRolesDeUsuario_keycloak500_debeLanzar503SinBodyInterno() {
        server.expect(requestTo(ROLES_URL))
                .andExpect(header(HttpHeaders.AUTHORIZATION, "Bearer " + SERVICE_ACCOUNT_TOKEN))
                .andRespond(withServerError()
                        .body("{\"internal\":\"client_secret=super-secreto\"}")
                        .contentType(MediaType.APPLICATION_JSON));

        BusinessException ex = assertThrows(BusinessException.class,
                () -> client.obtenerRolesDeUsuario("kc-1"));

        assertEquals("KEYCLOAK_UNAVAILABLE", ex.getCode());
        assertFalse(ex.getMessage().contains("super-secreto"));
        assertFalse(ex.getMessage().contains("internal"));
        server.verify();
    }

    @Test
    void obtenerRolesDeUsuario_keycloak401_debeLanzar422SinBodyInterno() {
        server.expect(requestTo(ROLES_URL))
                .andExpect(header(HttpHeaders.AUTHORIZATION, "Bearer " + SERVICE_ACCOUNT_TOKEN))
                .andRespond(withStatus(HttpStatus.UNAUTHORIZED)
                        .body("{\"error\":\"invalid_token\",\"detail\":\"aud=otro-client\"}")
                        .contentType(MediaType.APPLICATION_JSON));

        BusinessException ex = assertThrows(BusinessException.class,
                () -> client.obtenerRolesDeUsuario("kc-1"));

        assertEquals("KEYCLOAK_SYNC_ERROR", ex.getCode());
        assertFalse(ex.getMessage().contains("otro-client"));
        assertFalse(ex.getMessage().contains("invalid_token"));
        server.verify();
    }

    @Test
    void obtenerRolesDeUsuario_timeout_debeLanzar503() {
        server.expect(requestTo(ROLES_URL))
                .andExpect(header(HttpHeaders.AUTHORIZATION, "Bearer " + SERVICE_ACCOUNT_TOKEN))
                .andRespond(withException(new SocketTimeoutException("Connect timed out")));

        BusinessException ex = assertThrows(BusinessException.class,
                () -> client.obtenerRolesDeUsuario("kc-1"));

        assertEquals("KEYCLOAK_UNAVAILABLE", ex.getCode());
        server.verify();
    }

    @Test
    void obtenerTodos_con200SinBody_debeRetornarListaVacia() {
        server.expect(requestTo(USERS_URL))
                .andExpect(header(HttpHeaders.AUTHORIZATION, "Bearer " + SERVICE_ACCOUNT_TOKEN))
                .andRespond(withStatus(HttpStatus.OK).contentType(MediaType.APPLICATION_JSON));

        assertEquals(List.of(), client.obtenerTodos());
        server.verify();
    }

    @Test
    void obtenerTodos_errorSinBody_noDebeFallarPorNull() {
        server.expect(requestTo(USERS_URL))
                .andExpect(header(HttpHeaders.AUTHORIZATION, "Bearer " + SERVICE_ACCOUNT_TOKEN))
                .andRespond(withStatus(HttpStatus.BAD_REQUEST).contentType(MediaType.APPLICATION_JSON));

        BusinessException ex = assertThrows(BusinessException.class, client::obtenerTodos);

        assertEquals("KEYCLOAK_SYNC_ERROR", ex.getCode());
        server.verify();
    }

    @Test
    void obtenerRolesDeUsuario_respuestaSinRoles_debeRetornarListaVacia() {
        server.expect(requestTo(ROLES_URL))
                .andExpect(header(HttpHeaders.AUTHORIZATION, "Bearer " + SERVICE_ACCOUNT_TOKEN))
                .andRespond(withSuccess("[]", MediaType.APPLICATION_JSON));

        assertEquals(List.of(), client.obtenerRolesDeUsuario("kc-1"));
        server.verify();
    }
}
