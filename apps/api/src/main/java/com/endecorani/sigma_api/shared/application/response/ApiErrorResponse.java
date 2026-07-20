package com.endecorani.sigma_api.shared.application.response;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.Instant;
import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record ApiErrorResponse(
        boolean success,
        int status,
        String error,
        String code,
        String message,
        String path,
        List<FieldValidationError> validationErrors,
        Instant timestamp
) {

    public static ApiErrorResponse of(
            int status,
            String error,
            String code,
            String message,
            String path
    ) {
        return new ApiErrorResponse(
                false,
                status,
                error,
                code,
                message,
                path,
                null,
                Instant.now()
        );
    }

    public static ApiErrorResponse validation(
            int status,
            String error,
            String code,
            String message,
            String path,
            List<FieldValidationError> validationErrors
    ) {
        return new ApiErrorResponse(
                false,
                status,
                error,
                code,
                message,
                path,
                validationErrors,
                Instant.now()
        );

    }


}
