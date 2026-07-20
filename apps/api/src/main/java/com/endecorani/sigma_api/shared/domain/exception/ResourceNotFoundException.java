package com.endecorani.sigma_api.shared.domain.exception;

public class ResourceNotFoundException extends DomainException {

    private static final String DEFAULT_CODE = "RESOURCE_NOT_FOUND";

    public ResourceNotFoundException(String message) {
        super(DEFAULT_CODE, message);
    }

    public ResourceNotFoundException(
            String resource,
            Object identifier
    ) {
        super(
                DEFAULT_CODE,
                "%s no encontrado con identificador: %s"
                        .formatted(resource, identifier)
        );
    }

    public ResourceNotFoundException(
            String code,
            String message
    ) {
        super(code, message);
    }

}