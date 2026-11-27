package com.endecorani.sigma_api.shared.presentation.exception;

import com.endecorani.sigma_api.shared.application.response.ApiErrorResponse;
import com.endecorani.sigma_api.shared.application.response.FieldValidationError;
import com.endecorani.sigma_api.shared.domain.exception.BusinessException;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import jakarta.validation.Path;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.core.MethodParameter;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.validation.BeanPropertyBindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import tools.jackson.databind.json.JsonMapper;

import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

/** REQ-SEG-005/006/007: redacción de 400 y códigos de contrato 503/400 en BusinessException. */
class GlobalExceptionHandlerRedactionTest {

    private final GlobalExceptionHandler handler = new GlobalExceptionHandler();
    private final MockHttpServletRequest request = new MockHttpServletRequest("PUT", "/api/v1/roles/1/menus");
    private final JsonMapper jsonMapper = JsonMapper.builder().build();

    @ParameterizedTest
    @ValueSource(strings = {"password", "accessToken", "clientSecret"})
    void handleValidation_camposSensibles_debeRedactarRejectedValue(String campo) throws Exception {
        FieldError fieldError = new FieldError(
                "request", campo, "valor-super-secreto", false, null, null, "no puede estar vacío");
        MethodArgumentNotValidException exception = exceptionCon(fieldError);

        ResponseEntity<ApiErrorResponse> response = handler.handleValidation(exception, request);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        ApiErrorResponse body = response.getBody();
        assertNotNull(body);
        assertEquals("VALIDATION_ERROR", body.code());
        assertEquals(1, body.validationErrors().size());
        assertEquals("[REDACTED]", body.validationErrors().get(0).rejectedValue());
        assertFalse(jsonMapper.writeValueAsString(body).contains("valor-super-secreto"));
    }

    @Test
    void handleValidation_valorInofensivo_debeConservarRejectedValue() throws Exception {
        FieldError fieldError = new FieldError(
                "request", "size", 999, false, null, null, "tamaño máximo 500");
        MethodArgumentNotValidException exception = exceptionCon(fieldError);

        ResponseEntity<ApiErrorResponse> response = handler.handleValidation(exception, request);

        ApiErrorResponse body = response.getBody();
        assertNotNull(body);
        assertEquals(999, body.validationErrors().get(0).rejectedValue());
        assertTrue(jsonMapper.writeValueAsString(body).contains("999"));
    }

    @Test
    void handleConstraintViolation_valorSensible_debeRedactarlo() throws Exception {
        @SuppressWarnings("unchecked")
        ConstraintViolation<Object> violation = mock(ConstraintViolation.class);
        Path path = mock(Path.class);
        when(path.toString()).thenReturn("accessToken");
        when(violation.getPropertyPath()).thenReturn(path);
        when(violation.getMessage()).thenReturn("longitud inválida");
        when(violation.getInvalidValue()).thenReturn("token-super-secreto");
        ConstraintViolationException exception = new ConstraintViolationException(Set.of(violation));

        ResponseEntity<ApiErrorResponse> response = handler.handleConstraintViolation(exception, request);

        ApiErrorResponse body = response.getBody();
        assertNotNull(body);
        assertEquals("CONSTRAINT_VIOLATION", body.code());
        FieldValidationError fieldError = body.validationErrors().get(0);
        assertEquals("accessToken", fieldError.field());
        assertEquals("[REDACTED]", fieldError.rejectedValue());
        assertFalse(jsonMapper.writeValueAsString(body).contains("token-super-secreto"));
    }

    @Test
    void handleBusiness_keycloakNoDisponible_debeRetornar503() {
        ResponseEntity<ApiErrorResponse> response = handler.handleBusiness(
                new BusinessException("KEYCLOAK_UNAVAILABLE", "Keycloak no está disponible"), request);

        assertEquals(HttpStatus.SERVICE_UNAVAILABLE, response.getStatusCode());
        ApiErrorResponse body = response.getBody();
        assertNotNull(body);
        assertEquals(503, body.status());
        assertEquals("KEYCLOAK_UNAVAILABLE", body.code());
    }

    @Test
    void handleBusiness_validacionDeAplicacion_debeRetornar400() {
        ResponseEntity<ApiErrorResponse> response = handler.handleBusiness(
                new BusinessException("VALIDATION_ERROR", "El campo menuIds es obligatorio"), request);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        ApiErrorResponse body = response.getBody();
        assertNotNull(body);
        assertEquals(400, body.status());
        assertEquals("VALIDATION_ERROR", body.code());
    }

    private static MethodArgumentNotValidException exceptionCon(FieldError fieldError) throws Exception {
        BeanPropertyBindingResult bindingResult = new BeanPropertyBindingResult(new Object(), "request");
        bindingResult.addError(fieldError);
        MethodParameter parameter = new MethodParameter(
                GlobalExceptionHandlerRedactionTest.class.getDeclaredMethod("dummy", String.class), 0);
        return new MethodArgumentNotValidException(parameter, bindingResult);
    }

    @SuppressWarnings("unused")
    private void dummy(String value) {
    }
}
