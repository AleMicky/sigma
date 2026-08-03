package com.endecorani.sigma_api.modules.organizacion.application.service;

import com.endecorani.sigma_api.modules.organizacion.application.dto.RegistroMigracionResponse;
import com.endecorani.sigma_api.modules.organizacion.domain.model.RegistroMigracion;
import com.endecorani.sigma_api.modules.organizacion.domain.repository.RegistroMigracionRepository;
import com.endecorani.sigma_api.shared.application.pagination.PageRequestDto;
import com.endecorani.sigma_api.shared.application.pagination.PageResponse;
import com.endecorani.sigma_api.shared.domain.exception.BusinessException;
import com.endecorani.sigma_api.shared.domain.exception.ResourceNotFoundException;
import com.endecorani.sigma_api.shared.util.ApiConstants;
import com.endecorani.sigma_api.shared.util.StringUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RegistroMigracionService {

    private static final Set<String> SORT_FIELDS = Set.of(
            "id",
            "sistemaOrigen",
            "entidad",
            "estado",
            "fechaRegistro"
    );

    private final RegistroMigracionRepository registroMigracionRepository;

    @Transactional(readOnly = true)
    public PageResponse<RegistroMigracionResponse> findAll(
            String sistemaOrigen,
            String entidad,
            String estado,
            Instant fechaDesde,
            Instant fechaHasta,
            String query,
            PageRequestDto pageRequest
    ) {
        if (fechaDesde != null && fechaHasta != null
                && fechaDesde.isAfter(fechaHasta)) {
            throw new BusinessException(
                    "INVALID_DATE_RANGE",
                    "fechaDesde no puede ser posterior a fechaHasta"
            );
        }

        String normalizedSistemaOrigen = StringUtils.normalize(sistemaOrigen);
        String normalizedEntidad = StringUtils.normalize(entidad);
        String normalizedQuery = StringUtils.normalize(query);

        return PageResponse.from(
                registroMigracionRepository.findAll(
                        normalizedSistemaOrigen,
                        normalizedEntidad,
                        estado,
                        fechaDesde,
                        fechaHasta,
                        normalizedQuery,
                        resolvePageable(pageRequest)
                ),
                this::toResponse
        );
    }

    private Pageable resolvePageable(PageRequestDto pageRequest) {
        String sortBy = pageRequest.sortBy();

        if (ApiConstants.DEFAULT_SORT_FIELD.equals(sortBy)
                || !SORT_FIELDS.contains(sortBy)) {
            sortBy = "fechaRegistro";
        }

        return PageRequest.of(
                pageRequest.page(),
                pageRequest.size(),
                Sort.by(pageRequest.direction(), sortBy)
        );
    }

    @Transactional(readOnly = true)
    public RegistroMigracionResponse findById(UUID id) {
        RegistroMigracion domain = registroMigracionRepository
                .findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Registro de migración",
                        id
                ));

        return toResponse(domain);
    }

    private RegistroMigracionResponse toResponse(RegistroMigracion domain) {
        return new RegistroMigracionResponse(
                domain.getId(),
                domain.getSistemaOrigen(),
                domain.getEntidad(),
                domain.getIdOrigen(),
                domain.getIdDestino(),
                domain.getEstado(),
                domain.getMensaje(),
                domain.getFechaRegistro()
        );
    }
}