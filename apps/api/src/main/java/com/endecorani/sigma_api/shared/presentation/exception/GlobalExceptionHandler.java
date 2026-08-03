package com.endecorani.sigma_api.shared.presentation.exception;

import com.endecorani.sigma_api.shared.application.response.ApiErrorResponse;

import com.endecorani.sigma_api.shared.application.response.FieldValidationError;

import com.endecorani.sigma_api.shared.domain.exception.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.core.PropertyReferenceException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import java.util.List;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)

    public ResponseEntity<ApiErrorResponse> handleNotFound(
            ResourceNotFoundException exception,
            HttpServletRequest request
    ) {
        return buildResponse(
                HttpStatus.NOT_FOUND,
                exception.getCode(),
                exception.getMessage(),
                request.getRequestURI()
        );
    }

    @ExceptionHandler(ConflictException.class)
    public ResponseEntity<ApiErrorResponse> handleConflict(
            ConflictException exception,
            HttpServletRequest request
    ) {
        return buildResponse(
                HttpStatus.CONFLICT,
                exception.getCode(),
                exception.getMessage(),
                request.getRequestURI()
        );
    }

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ApiErrorResponse> handleBusiness(
            BusinessException exception,
            HttpServletRequest request
    ) {
        return buildResponse(
                HttpStatus.UNPROCESSABLE_CONTENT,
                exception.getCode(),
                exception.getMessage(),
                request.getRequestURI()
        );
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ApiErrorResponse> handleMaxUploadSize(
            MaxUploadSizeExceededException exception,
            HttpServletRequest request
    ) {
        return buildResponse(
                HttpStatus.PAYLOAD_TOO_LARGE,
                "INVALID_IMAGE_SIZE",
                "El archivo supera el tamaño máximo permitido",
                request.getRequestURI()
        );
    }

    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<ApiErrorResponse> handleUnauthorized(
            UnauthorizedException exception,
            HttpServletRequest request
    ) {
        return buildResponse(
                HttpStatus.UNAUTHORIZED,
                exception.getCode(),
                exception.getMessage(),
                request.getRequestURI()
        );
    }

    @ExceptionHandler(ForbiddenException.class)
    public ResponseEntity<ApiErrorResponse> handleForbidden(
            ForbiddenException exception,
            HttpServletRequest request

    ) {
        return buildResponse(
                HttpStatus.FORBIDDEN,
                exception.getCode(),
                exception.getMessage(),
                request.getRequestURI()
        );
    }

    @ExceptionHandler(DomainException.class)
    public ResponseEntity<ApiErrorResponse> handleDomain(
            DomainException exception,
            HttpServletRequest request
    ) {
        return buildResponse(
                HttpStatus.BAD_REQUEST,
                exception.getCode(),
                exception.getMessage(),
                request.getRequestURI()
        );
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiErrorResponse> handleValidation(
            MethodArgumentNotValidException exception,
            HttpServletRequest request
    ) {

        List<FieldValidationError> errors = exception
                .getBindingResult()
                .getFieldErrors()
                .stream()
                .map(this::mapFieldError)
                .toList();

        ApiErrorResponse response =
                ApiErrorResponse.validation(
                        HttpStatus.BAD_REQUEST.value(),
                        HttpStatus.BAD_REQUEST.getReasonPhrase(),
                        "VALIDATION_ERROR",
                        "Existen errores de validación",
                        request.getRequestURI(),
                        errors
                );

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(response);

    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ApiErrorResponse> handleConstraintViolation(
            ConstraintViolationException exception,
            HttpServletRequest request
    ) {

        List<FieldValidationError> errors = exception
                .getConstraintViolations()
                .stream()
                .map(violation ->
                        new FieldValidationError(
                                violation
                                        .getPropertyPath()
                                        .toString(),
                                violation.getMessage(),
                                violation.getInvalidValue()
                        )
                )
                .toList();

        ApiErrorResponse response =
                ApiErrorResponse.validation(
                        HttpStatus.BAD_REQUEST.value(),
                        HttpStatus.BAD_REQUEST.getReasonPhrase(),
                        "CONSTRAINT_VIOLATION",
                        "Existen parámetros inválidos",
                        request.getRequestURI(),
                        errors
                );

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(response);

    }

    @ExceptionHandler({
            MethodArgumentTypeMismatchException.class,
            MissingServletRequestParameterException.class,
            HttpMessageNotReadableException.class
    })
    public ResponseEntity<ApiErrorResponse> handleBadRequest(
            Exception exception,
            HttpServletRequest request

    ) {

        return buildResponse(
                HttpStatus.BAD_REQUEST,
                "BAD_REQUEST",
                resolveBadRequestMessage(exception),
                request.getRequestURI()

        );

    }

    @ExceptionHandler(PropertyReferenceException.class)
    public ResponseEntity<ApiErrorResponse> handleInvalidSortProperty(
            PropertyReferenceException exception,
            HttpServletRequest request
    ) {
        return buildResponse(
                HttpStatus.BAD_REQUEST,
                "INVALID_SORT_FIELD",
                "El campo de ordenación '%s' no es válido"
                        .formatted(exception.getPropertyName()),
                request.getRequestURI()
        );
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiErrorResponse> handleDataIntegrity(
            DataIntegrityViolationException exception,
            HttpServletRequest request
    ) {

        log.warn(
                "Violación de integridad de datos en {}",
                request.getRequestURI(),
                exception
        );

        return buildResponse(
                HttpStatus.CONFLICT,
                "DATA_INTEGRITY_VIOLATION",
                "La operación viola una restricción de integridad de datos",
                request.getRequestURI()
        );

    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiErrorResponse> handleUnexpected(
            Exception exception,
            HttpServletRequest request
    ) {
        log.error(
                "Error inesperado en {}",
                request.getRequestURI(),
                exception
        );
        return buildResponse(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "INTERNAL_SERVER_ERROR",
                "Ocurrió un error interno en el servidor",
                request.getRequestURI()
        );

    }

    private FieldValidationError mapFieldError(
            FieldError error
    ) {
        return new FieldValidationError(
                error.getField(),
                error.getDefaultMessage(),
                error.getRejectedValue()
        );
    }

    private ResponseEntity<ApiErrorResponse> buildResponse(
            HttpStatus status,
            String code,
            String message,
            String path
    ) {
        ApiErrorResponse response = ApiErrorResponse.of(
                status.value(),
                status.getReasonPhrase(),
                code,
                message,
                path
        );

        return ResponseEntity
                .status(status)
                .body(response);
    }

    private String resolveBadRequestMessage(
            Exception exception
    ) {

        if (exception instanceof MethodArgumentTypeMismatchException mismatch) {
            return "El parámetro '%s' tiene un valor inválido"
                    .formatted(mismatch.getName());
        }

        if (exception instanceof MissingServletRequestParameterException missing) {
            return "El parámetro '%s' es obligatorio"
                    .formatted(missing.getParameterName());
        }

        if (exception instanceof HttpMessageNotReadableException) {
            return "El cuerpo de la solicitud tiene un formato inválido";
        }

        return "La solicitud contiene datos inválidos";
    }
}
