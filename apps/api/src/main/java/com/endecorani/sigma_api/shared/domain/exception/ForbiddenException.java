package com.endecorani.sigma_api.shared.domain.exception;

public class ForbiddenException extends DomainException {

    private static final String DEFAULT_CODE = "FORBIDDEN";

    public ForbiddenException(String message) {
        super(DEFAULT_CODE, message);
    }

}