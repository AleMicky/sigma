package com.endecorani.sigma_api.shared.application.response;

public record FieldValidationError(
        String field,
        String message,
        Object rejectedValue
) {
}
