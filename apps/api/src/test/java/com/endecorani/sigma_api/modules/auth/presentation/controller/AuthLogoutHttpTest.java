package com.endecorani.sigma_api.modules.auth.presentation.controller;

import com.endecorani.sigma_api.config.keycloak.KeycloakProperties;
import com.endecorani.sigma_api.config.keycloak.KeycloakTokenClient;
import com.endecorani.sigma_api.config.security.KeycloakJwtAuthenticationConverter;
import com.endecorani.sigma_api.config.security.RestAccessDeniedHandler;
import com.endecorani.sigma_api.config.security.RestAuthenticationEntryPoint;
import com.endecorani.sigma_api.config.security.SecurityConfig;
import com.endecorani.sigma_api.modules.auth.application.service.AuthService;
import com.endecorani.sigma_api.shared.presentation.exception.GlobalExceptionHandler;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.oauth2.jwt.BadJwtException;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.junit.jupiter.SpringJUnitConfig;
import org.springframework.test.context.web.WebAppConfiguration;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;
import tools.jackson.databind.json.JsonMapper;

import java.nio.charset.StandardCharsets;
import java.util.Base64;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.reset;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * REQ-SEG-010: logout público sin Bearer; con Bearer se vincula el sub del JWT al del
 * refresh token. La matriz 401/403 de Sprint 17 permanece intacta.
 */
@WebAppConfiguration
@SpringJUnitConfig(classes = AuthLogoutHttpTest.TestConfig.class)
class AuthLogoutHttpTest {

    private static final String LOGOUT = "/api/v1/auth/logout";
    private static final String ACCESS_TOKEN = "access-token";
    private static final String BEARER = "Bearer " + ACCESS_TOKEN;

    @Autowired
    private WebApplicationContext context;
    @Autowired
    private JwtDecoder jwtDecoder;
    @Autowired
    private KeycloakTokenClient keycloakTokenClient;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        reset(jwtDecoder, keycloakTokenClient);
        mockMvc = MockMvcBuilders.webAppContextSetup(context).apply(springSecurity()).build();
    }

    @AfterEach
    void tearDown() {
        reset(jwtDecoder, keycloakTokenClient);
    }

    @Configuration
    @EnableWebMvc
    @EnableWebSecurity
    @Import({SecurityConfig.class, GlobalExceptionHandler.class})
    static class TestConfig {

        @Bean
        JsonMapper jsonMapper() {
            return JsonMapper.builder().build();
        }

        @Bean
        KeycloakProperties keycloakProperties() {
            return new KeycloakProperties(
                    "http://keycloak.test", "sigma", null, null, "sigma-web", null, "sigma-api");
        }

        @Bean
        RestAuthenticationEntryPoint restAuthenticationEntryPoint(JsonMapper jsonMapper) {
            return new RestAuthenticationEntryPoint(jsonMapper);
        }

        @Bean
        RestAccessDeniedHandler restAccessDeniedHandler(JsonMapper jsonMapper) {
            return new RestAccessDeniedHandler(jsonMapper);
        }

        @Bean
        KeycloakJwtAuthenticationConverter keycloakJwtAuthenticationConverter(KeycloakProperties properties) {
            return new KeycloakJwtAuthenticationConverter(properties);
        }

        @Bean
        JwtDecoder jwtDecoder() {
            return mock(JwtDecoder.class);
        }

        @Bean
        KeycloakTokenClient keycloakTokenClient() {
            return mock(KeycloakTokenClient.class);
        }

        @Bean
        AuthService authService(JsonMapper jsonMapper, JwtDecoder jwtDecoder,
                                KeycloakTokenClient keycloakTokenClient) {
            return new AuthService(keycloakTokenClient, jsonMapper, jwtDecoder);
        }

        @Bean
        AuthController authController(AuthService authService) {
            return new AuthController(authService);
        }
    }

    @Test
    void sinBearer_logoutSigueSiendoPublicoYCierraSesion() throws Exception {
        String refreshToken = jwtPayload("kc-sub");

        mockMvc.perform(logout(refreshToken))
                .andExpect(status().isOk());

        verify(keycloakTokenClient).logout(refreshToken);
        verifyNoInteractions(jwtDecoder);
    }

    @Test
    void conBearerDelMismoSub_debeCerrarSesion() throws Exception {
        String refreshToken = jwtPayload("kc-sub");
        when(jwtDecoder.decode(ACCESS_TOKEN)).thenReturn(jwt("kc-sub"));

        mockMvc.perform(logout(refreshToken).header(HttpHeaders.AUTHORIZATION, BEARER))
                .andExpect(status().isOk());

        verify(jwtDecoder).decode(ACCESS_TOKEN);
        verify(keycloakTokenClient).logout(refreshToken);
    }

    @Test
    void conBearerDeOtroSub_debeResponder403SinInvalidarRefreshToken() throws Exception {
        String refreshToken = jwtPayload("kc-sub");
        when(jwtDecoder.decode(ACCESS_TOKEN)).thenReturn(jwt("otro-sub"));

        mockMvc.perform(logout(refreshToken).header(HttpHeaders.AUTHORIZATION, BEARER))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));

        verify(keycloakTokenClient, never()).logout(org.mockito.ArgumentMatchers.anyString());
    }

    @Test
    void conBearerInvalido_debeResponder401SinInvalidarRefreshToken() throws Exception {
        when(jwtDecoder.decode(ACCESS_TOKEN)).thenThrow(new BadJwtException("firma inválida"));

        mockMvc.perform(logout(jwtPayload("kc-sub")).header(HttpHeaders.AUTHORIZATION, BEARER))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("UNAUTHORIZED"));

        verify(keycloakTokenClient, never()).logout(org.mockito.ArgumentMatchers.anyString());
    }

    @Test
    void conBearerYRefreshTokenSinSub_debeResponder403() throws Exception {
        when(jwtDecoder.decode(ACCESS_TOKEN)).thenReturn(jwt("kc-sub"));

        mockMvc.perform(logout("token-opaco").header(HttpHeaders.AUTHORIZATION, BEARER))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));

        verify(keycloakTokenClient, never()).logout(org.mockito.ArgumentMatchers.anyString());
    }

    @Test
    @WithMockUser(username = "operador", roles = "OPERADOR")
    void logoutNoExigeRolAdmin() throws Exception {
        mockMvc.perform(logout(jwtPayload("kc-sub")))
                .andExpect(status().isOk());
    }

    private static org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder logout(
            String refreshToken
    ) {
        return post(LOGOUT)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"refreshToken\":\"" + refreshToken + "\"}");
    }

    private static Jwt jwt(String subject) {
        return Jwt.withTokenValue(ACCESS_TOKEN)
                .header("alg", "none")
                .subject(subject)
                .build();
    }

    private static String jwtPayload(String subject) {
        String payload = "{\"sub\":\"" + subject + "\"}";
        return "eyJhbGciOiJub25lIn0."
                + Base64.getUrlEncoder().withoutPadding()
                .encodeToString(payload.getBytes(StandardCharsets.UTF_8))
                + ".signature";
    }
}
