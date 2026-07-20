package com.endecorani.sigma_api.shared.domain.exception;

public class ConflictException extends DomainException {

    private static final String DEFAULT_CODE = "RESOURCE_CONFLICT";

    public ConflictException(String message) {
        super(DEFAULT_CODE, message);
    }

    public ConflictException(String code, String message) {
        super(code, message);
    }
}
