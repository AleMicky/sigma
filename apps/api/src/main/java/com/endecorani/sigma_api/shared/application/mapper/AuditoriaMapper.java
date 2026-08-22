package com.endecorani.sigma_api.shared.application.mapper;


import com.endecorani.sigma_api.shared.application.dto.response.AuditoriaResponse;
import com.endecorani.sigma_api.shared.domain.model.AuditableModel;

public final class AuditoriaMapper {

    private AuditoriaMapper() {
    }

    public static AuditoriaResponse from(AuditableModel domain) {
        return new AuditoriaResponse(
                domain.getCreatedAt(),
                domain.getUpdatedAt(),
                domain.getCreatedBy(),
                domain.getUpdatedBy()
        );
    }
}