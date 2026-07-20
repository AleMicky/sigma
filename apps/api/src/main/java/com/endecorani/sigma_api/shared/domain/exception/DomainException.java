package com.endecorani.sigma_api.shared.domain.exception;

import lombok.Getter;

// excepción base para las excepciones controladas.

@Getter
public abstract class DomainException extends RuntimeException {

    private final String code;

    protected DomainException(String code, String message) {
        super(message);
        this.code = code;
    }

    protected DomainException(String code, String message, Throwable cause) {
        super(message, cause);
        this.code = code;
    }
}
