package com.endecorani.sigma_api.shared.presentation.exception;

import com.endecorani.sigma_api.shared.application.pagination.PageRequestDto;
import com.endecorani.sigma_api.shared.application.response.ApiErrorResponse;
import org.junit.jupiter.api.Test;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockHttpServletRequest;

import java.sql.SQLException;

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

    @Test
    void handleIllegalArgument_paraTamanoMayorA500_debeRetornar400InvalidPageSize() {
        IllegalArgumentException exception = new IllegalArgumentException(
                PageRequestDto.INVALID_PAGE_SIZE_CODE);

        ResponseEntity<ApiErrorResponse> response = handler.handleIllegalArgument(exception, request);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        ApiErrorResponse body = response.getBody();
        assertNotNull(body);
        assertEquals("INVALID_PAGE_SIZE", body.code());
    }

    @Test
    void handleDataIntegrity_paraIndiceParcialDeProgramacion_debeRetornar409ConCodigoDeDominio() {
        DataIntegrityViolationException exception = new DataIntegrityViolationException(
                "could not execute statement",
                new SQLException("duplicate key value violates unique constraint "
                        + "\"uq_programacion_activa_por_plan_activo\""));

        ResponseEntity<ApiErrorResponse> response = handler.handleDataIntegrity(exception, request);

        assertEquals(HttpStatus.CONFLICT, response.getStatusCode());
        ApiErrorResponse body = response.getBody();
        assertNotNull(body);
        assertEquals("PROGRAMACION_ACTIVA_DUPLICADA", body.code());
        assertFalse(body.code().contains("DATA_INTEGRITY"));
    }
}
