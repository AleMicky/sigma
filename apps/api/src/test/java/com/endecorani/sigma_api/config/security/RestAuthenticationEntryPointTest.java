package com.endecorani.sigma_api.config.security;

import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.authentication.InsufficientAuthenticationException;
import tools.jackson.databind.json.JsonMapper;

import java.nio.charset.StandardCharsets;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

/** REQ-SEG-005: el 401 es estable y no repite el mensaje crudo del decoder JWT. */
class RestAuthenticationEntryPointTest {

    private final RestAuthenticationEntryPoint entryPoint =
            new RestAuthenticationEntryPoint(JsonMapper.builder().build());

    @Test
    void decoderConAudiencias_noDebeFiltrarDetalleEnElCuerpo() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/v1/usuarios");
        MockHttpServletResponse response = new MockHttpServletResponse();
        InsufficientAuthenticationException exception = new InsufficientAuthenticationException(
                "Invalid audience: expected [sigma-web], got [realm-management, account]");

        entryPoint.commence(request, response, exception);

        assertEquals(401, response.getStatus());
        String body = response.getContentAsString(StandardCharsets.UTF_8);
        assertTrue(body.contains("\"code\":\"UNAUTHORIZED\""));
        assertTrue(body.contains("Debe autenticarse para acceder a este recurso"));
        assertFalse(body.contains("audience"), "El detalle del decoder sólo debe ir al log");
        assertFalse(body.contains("realm-management"));
        assertFalse(body.contains("sigma-web"));
    }

    @Test
    void excepcionConCausaSensible_noDebeFiltrarLaCausaEnElCuerpo() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/v1/roles");
        MockHttpServletResponse response = new MockHttpServletResponse();
        InsufficientAuthenticationException exception = new InsufficientAuthenticationException(
                "Token inválido",
                new IllegalStateException("client_secret=super-secreto; aud=otro-client"));

        entryPoint.commence(request, response, exception);

        assertEquals(401, response.getStatus());
        String body = response.getContentAsString(StandardCharsets.UTF_8);
        assertTrue(body.contains("\"code\":\"UNAUTHORIZED\""));
        assertTrue(body.contains("Debe autenticarse para acceder a este recurso"));
        assertFalse(body.contains("super-secreto"));
        assertFalse(body.contains("otro-client"));
    }
}
