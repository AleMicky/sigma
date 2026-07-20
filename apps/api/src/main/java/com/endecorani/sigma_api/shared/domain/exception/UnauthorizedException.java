package com.endecorani.sigma_api.shared.domain.exception;

public class UnauthorizedException extends DomainException {

    private static final String DEFAULT_CODE = "UNAUTHORIZED";

    public UnauthorizedException(String message) {
        super(DEFAULT_CODE, message);
    }
}
