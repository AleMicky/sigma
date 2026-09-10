package com.endecorani.sigma_api.shared.application.mapper;

import com.endecorani.sigma_api.shared.application.dto.response.AuditoriaResponse;
import com.endecorani.sigma_api.shared.domain.model.AuditableModel;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface AuditoriaResponseMapper {

    default AuditoriaResponse toResponse(AuditableModel domain) {
        if (domain == null) {
            return null;
        }

        return new AuditoriaResponse(
                domain.getCreatedAt(),
                domain.getUpdatedAt(),
                domain.getCreatedBy(),
                domain.getUpdatedBy(),
                domain.getCreatedById(),
                domain.getUpdatedById()
        );

    }

}