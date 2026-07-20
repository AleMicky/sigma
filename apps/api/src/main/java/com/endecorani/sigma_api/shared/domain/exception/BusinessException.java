package com.endecorani.sigma_api.shared.domain.exception;

public class BusinessException extends DomainException {

    private static final String DEFAULT_CODE = "BUSINESS_RULE_VIOLATION";

    public BusinessException(String message) {
        super(DEFAULT_CODE, message);
    }

    public BusinessException(String code, String message) {
        super(code, message);
    }

}