package com.endecorani.sigma_api.modules.activos.application.service;

import com.endecorani.sigma_api.modules.activos.application.dto.request.ActivoAsignacionRequest;
import com.endecorani.sigma_api.modules.activos.application.dto.response.ActivoAsignacionResponse;
import com.endecorani.sigma_api.modules.activos.domain.model.ActivoAsignacion;
import com.endecorani.sigma_api.modules.activos.domain.repository.ActivoAsignacionRepository;
import com.endecorani.sigma_api.modules.activos.domain.repository.ActivoAsignacionSearchCriteria;
import com.endecorani.sigma_api.modules.activos.domain.repository.ActivoRepository;
import com.endecorani.sigma_api.shared.application.crud.AbstractCrudService;
import com.endecorani.sigma_api.shared.application.pagination.PageRequestDto;
import com.endecorani.sigma_api.shared.application.pagination.PageResponse;
import com.endecorani.sigma_api.shared.domain.exception.ResourceNotFoundException;
import com.endecorani.sigma_api.shared.domain.repository.CrudRepository;
import com.endecorani.sigma_api.shared.util.StringUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ActivoAsignacionService extends AbstractCrudService<ActivoAsignacion, ActivoAsignacionRequest, ActivoAsignacionResponse, UUID> {

    private static final Set<String> SORT_FIELDS = Set.of(
            "id",
            "fechaAsignacion",
            "fechaDevolucion",
            "createdAt",
            "updatedAt"
    );

    private final ActivoAsignacionRepository repository;
    private final ActivoRepository activoRepository;

    @Override
    protected CrudRepository<ActivoAsignacion, UUID> repository() {
        return repository;
    }

    @Override
    protected Set<String> allowedSortFields() {
        return SORT_FIELDS;
    }

    @Transactional(readOnly = true)
    public PageResponse<ActivoAsignacionResponse> find(UUID activoId, String query, PageRequestDto pageRequest) {
        ActivoAsignacionSearchCriteria criteria = new ActivoAsignacionSearchCriteria(activoId, StringUtils.normalize(query));
        return PageResponse.from(
                repository.findAll(criteria, pageRequest.toPageable(allowedSortFields())),
                this::toResponse
        );
    }

    @Override
    protected ActivoAsignacion toDomain(ActivoAsignacionRequest request) {
        validateReferencias(request);
        return ActivoAsignacion.builder()
                .activoId(request.activoId())
                .empleadoId(request.empleadoId())
                .areaId(request.areaId())
                .fechaAsignacion(request.fechaAsignacion())
                .fechaDevolucion(request.fechaDevolucion())
                .observacionAsignacion(request.observacionAsignacion())
                .observacionDevolucion(request.observacionDevolucion())
                .build();
    }

    @Override
    protected void updateDomain(ActivoAsignacion domain, ActivoAsignacionRequest request) {
        validateReferencias(request);
        domain.setActivoId(request.activoId());
        domain.setEmpleadoId(request.empleadoId());
        domain.setAreaId(request.areaId());
        domain.setFechaAsignacion(request.fechaAsignacion());
        domain.setFechaDevolucion(request.fechaDevolucion());
        domain.setObservacionAsignacion(request.observacionAsignacion());
        domain.setObservacionDevolucion(request.observacionDevolucion());
    }

    @Override
    protected ActivoAsignacionResponse toResponse(ActivoAsignacion domain) {
        return new ActivoAsignacionResponse(
                domain.getId(),
                domain.getActivoId(),
                domain.getEmpleadoId(),
                domain.getAreaId(),
                domain.getFechaAsignacion(),
                domain.getFechaDevolucion(),
                domain.getObservacionAsignacion(),
                domain.getObservacionDevolucion(),
                domain.getCreatedAt(),
                domain.getUpdatedAt(),
                domain.getCreatedBy(),
                domain.getUpdatedBy()
        );
    }

    @Override
    protected String resourceName() {
        return "ActivoAsignacion";
    }

    private void validateReferencias(ActivoAsignacionRequest request) {
        if (!activoRepository.existsById(request.activoId())) {
            throw new ResourceNotFoundException("Activo", request.activoId());
        }
    }
}
