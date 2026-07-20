package com.endecorani.sigma_api.shared.presentation.exception;

import com.endecorani.sigma_api.shared.application.response.ApiErrorResponse;
import com.endecorani.sigma_api.shared.domain.exception.DomainException;
import com.endecorani.sigma_api.shared.domain.exception.ResourceNotFoundException;
import org.junit.jupiter.api.Test;
import org.springframework.data.core.PropertyReferenceException;
import org.springframework.data.core.TypeInformation;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockHttpServletRequest;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

class GlobalExceptionHandlerTest {

    private final GlobalExceptionHandler handler = new GlobalExceptionHandler();

    @Test
    void handleDomainReturnsBadRequestWithExceptionCode() {
        DomainException exception = new DomainException(
                "CUSTOM_DOMAIN_ERROR",
                "Regla de dominio inválida"
        ) {
        };
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setRequestURI("/api/v1/demo");

        ResponseEntity<ApiErrorResponse> response = handler.handleDomain(
                exception,
                request
        );

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("CUSTOM_DOMAIN_ERROR", response.getBody().code());
        assertEquals("Regla de dominio inválida", response.getBody().message());
        assertEquals("/api/v1/demo", response.getBody().path());
    }

    @Test
    void handleNotFoundKeepsSpecificStatus() {
        ResourceNotFoundException exception = new ResourceNotFoundException(
                "Producto",
                10
        );
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setRequestURI("/api/v1/products/10");

        ResponseEntity<ApiErrorResponse> response = handler.handleNotFound(
                exception,
                request
        );

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("RESOURCE_NOT_FOUND", response.getBody().code());
    }

    @Test
    void handleInvalidSortPropertyReturnsBadRequest() {
        PropertyReferenceException exception = new PropertyReferenceException(
                "foo",
                TypeInformation.of(Object.class),
                List.of()
        );
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setRequestURI("/api/v1/tipos-activo");

        ResponseEntity<ApiErrorResponse> response = handler.handleInvalidSortProperty(
                exception,
                request
        );

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("INVALID_SORT_FIELD", response.getBody().code());
    }
}
