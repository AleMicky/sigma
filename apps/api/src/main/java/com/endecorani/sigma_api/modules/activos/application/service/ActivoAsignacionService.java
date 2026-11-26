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
import com.endecorani.sigma_api.shared.domain.exception.BusinessException;
import com.endecorani.sigma_api.shared.domain.exception.ResourceNotFoundException;
import com.endecorani.sigma_api.shared.domain.repository.CrudRepository;
import com.endecorani.sigma_api.shared.util.StringUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Objects;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ActivoAsignacionService extends AbstractCrudService<ActivoAsignacion, ActivoAsignacionRequest, ActivoAsignacionResponse, UUID> {

    private static final String DESTINATARIO_INVALIDO = "ASIGNACION_DESTINATARIO_INVALIDO";
    private static final String FECHAS_INVALIDAS = "ASIGNACION_FECHAS_INVALIDAS";
    private static final String FECHAS_SOLAPADAS = "ASIGNACION_FECHAS_SOLAPADAS";

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

    /**
     * Cierra la asignación abierta previa antes de registrar la nueva, de modo
     * que nunca queden dos asignaciones vigentes para el mismo activo.
     */
    @Override
    @Transactional
    public ActivoAsignacionResponse create(ActivoAsignacionRequest request) {
        ActivoAsignacion domain = toDomain(request);
        cerrarAsignacionAbiertaPrevia(domain, null);
        validarSinSolapes(domain, null);
        return toResponse(repository.save(domain));
    }

    @Override
    @Transactional
    public ActivoAsignacionResponse update(UUID id, ActivoAsignacionRequest request) {
        ActivoAsignacion domain = findDomainById(id);
        updateDomain(domain, request);
        cerrarAsignacionAbiertaPrevia(domain, id);
        validarSinSolapes(domain, id);
        return toResponse(repository.save(domain));
    }

    @Override
    protected ActivoAsignacion toDomain(ActivoAsignacionRequest request) {
        validarRequest(request);
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
        validarRequest(request);
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

    private void validarRequest(ActivoAsignacionRequest request) {
        validarDestinatarioUnico(request);
        validarFechas(request);
        validateReferencias(request);
    }

    /** Debe existir exactamente uno de empleadoId o areaId. */
    private void validarDestinatarioUnico(ActivoAsignacionRequest request) {
        boolean tieneEmpleado = request.empleadoId() != null;
        boolean tieneArea = request.areaId() != null;

        if (tieneEmpleado == tieneArea) {
            throw new BusinessException(
                    DESTINATARIO_INVALIDO,
                    "Debe indicar exactamente uno de empleadoId o areaId");
        }
    }

    /** La devolución no puede ser anterior al inicio de la asignación. */
    private void validarFechas(ActivoAsignacionRequest request) {
        if (request.fechaAsignacion() == null) {
            return; // @NotNull del DTO responde 400 antes de llegar al servicio
        }
        if (request.fechaDevolucion() != null
                && request.fechaDevolucion().isBefore(request.fechaAsignacion())) {
            throw new BusinessException(
                    FECHAS_INVALIDAS,
                    "La fecha de devolución no puede ser anterior a la fecha de asignación");
        }
    }

    /**
     * Cierra la asignación abierta de ese activo en la fecha de inicio de la
     * nueva. Si la abierta empieza después, se deja intacta y la comprobación
     * de solapes rechazará la operación.
     */
    private void cerrarAsignacionAbiertaPrevia(ActivoAsignacion domain, UUID excludeId) {
        if (domain.getActivoId() == null || domain.getFechaAsignacion() == null) {
            return;
        }

        repository.findOpenByActivoId(domain.getActivoId())
                .filter(previa -> !Objects.equals(previa.getId(), excludeId))
                .filter(previa -> previa.getFechaAsignacion() == null
                        || !previa.getFechaAsignacion().isAfter(domain.getFechaAsignacion()))
                .ifPresent(previa -> {
                    previa.setFechaDevolucion(domain.getFechaAsignacion());
                    repository.save(previa);
                });
    }

    private void validarSinSolapes(ActivoAsignacion domain, UUID excludeId) {
        if (repository.existsOverlappingByActivoId(
                domain.getActivoId(),
                domain.getFechaAsignacion(),
                domain.getFechaDevolucion(),
                excludeId)) {
            throw new BusinessException(
                    FECHAS_SOLAPADAS,
                    "El activo ya tiene una asignación cuyo periodo solapa con el indicado");
        }
    }

    private void validateReferencias(ActivoAsignacionRequest request) {
        if (!activoRepository.existsById(request.activoId())) {
            throw new ResourceNotFoundException("Activo", request.activoId());
        }
    }
}
