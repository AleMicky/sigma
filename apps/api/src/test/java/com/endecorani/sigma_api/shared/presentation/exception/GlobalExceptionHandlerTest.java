package com.endecorani.sigma_api.shared.presentation.exception;

import com.endecorani.sigma_api.shared.application.response.ApiErrorResponse;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockHttpServletRequest;

import static org.junit.jupiter.api.Assertions.*;

class GlobalExceptionHandlerTest {

    private final GlobalExceptionHandler handler = new GlobalExceptionHandler();
    private final MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/v1/porteria");

    @Test
    void handleIllegalState_debeRetornar500SinFiltrarDetallesInternos() {
        IllegalStateException exception = new IllegalStateException(
                "Fallo en parametros.correlativos: SELECT password FROM seguridad.usuarios");

        ResponseEntity<ApiErrorResponse> response = handler.handleIllegalState(exception, request);

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        ApiErrorResponse body = response.getBody();
        assertNotNull(body);
        assertEquals("INTERNAL_SERVER_ERROR", body.code());
        assertEquals("Ocurrió un error interno en el servidor", body.message());
        assertFalse(body.message().contains("password"));
        assertFalse(body.message().contains("correlativos"));
        assertEquals("/api/v1/porteria", body.path());
    }

    @Test
    void handleBadRequest_paraFechaInvalida_debeRetornar400ConParametro() {
        IllegalArgumentException exception = new IllegalArgumentException(
                "El parámetro 'fechaDesde' no tiene un formato de fecha válido");

        ResponseEntity<ApiErrorResponse> response = handler.handleBadRequest(exception, request);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        ApiErrorResponse body = response.getBody();
        assertNotNull(body);
        assertEquals("BAD_REQUEST", body.code());
        assertTrue(body.message().contains("fechaDesde"));
    }
}
