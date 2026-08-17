package com.endecorani.sigma_api.modules.mantenimientos.application.service;

import com.endecorani.sigma_api.modules.activos.domain.repository.ComponenteRepository;
import com.endecorani.sigma_api.modules.activos.domain.repository.TipoActivoRepository;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.request.ActividadMantenimientoAplicacionRequest;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.response.ActividadMantenimientoAplicacionResponse;
import com.endecorani.sigma_api.modules.mantenimientos.domain.model.ActividadMantenimientoAplicacion;
import com.endecorani.sigma_api.modules.mantenimientos.domain.repository.ActividadMantenimientoAplicacionRepository;
import com.endecorani.sigma_api.modules.mantenimientos.domain.repository.ActividadMantenimientoRepository;
import com.endecorani.sigma_api.shared.application.dto.response.AuditoriaResponse;
import com.endecorani.sigma_api.shared.application.pagination.PageRequestDto;
import com.endecorani.sigma_api.shared.application.pagination.PageResponse;
import com.endecorani.sigma_api.shared.domain.exception.ConflictException;
import com.endecorani.sigma_api.shared.domain.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ActividadMantenimientoAplicacionService {

    private static final Set<String> SORT_FIELDS = Set.of(
            "id",
            "actividadMantenimientoId",
            "tipoActivoId",
            "componenteId",
            "createdAt",
            "updatedAt"
    );

    private final ActividadMantenimientoAplicacionRepository repository;
    private final ActividadMantenimientoRepository actividadMantenimientoRepository;
    private final TipoActivoRepository tipoActivoRepository;
    private final ComponenteRepository componenteRepository;

    @Transactional
    public ActividadMantenimientoAplicacionResponse create(
            ActividadMantenimientoAplicacionRequest request
    ) {
        requireActividadMantenimientoExists(
                request.actividadMantenimientoId()
        );
        requireTipoActivoExists(request.tipoActivoId());

        if (request.componenteId() != null) {
            requireComponenteExists(request.componenteId());
        }

        validateUniqueForCreate(
                request.actividadMantenimientoId(),
                request.tipoActivoId(),
                request.componenteId()
        );

        ActividadMantenimientoAplicacion domain =
                ActividadMantenimientoAplicacion.builder()
                        .actividadMantenimientoId(
                                request.actividadMantenimientoId()
                        )
                        .tipoActivoId(request.tipoActivoId())
                        .componenteId(request.componenteId())
                        .build();

        return toResponse(repository.save(domain));
    }

    @Transactional
    public ActividadMantenimientoAplicacionResponse update(
            UUID id,
            ActividadMantenimientoAplicacionRequest request
    ) {
        requireActividadMantenimientoExists(
                request.actividadMantenimientoId()
        );
        requireTipoActivoExists(request.tipoActivoId());

        if (request.componenteId() != null) {
            requireComponenteExists(request.componenteId());
        }

        ActividadMantenimientoAplicacion domain = findDomainById(id);

        validateUniqueForUpdate(
                request.actividadMantenimientoId(),
                request.tipoActivoId(),
                request.componenteId(),
                id
        );

        domain.setActividadMantenimientoId(
                request.actividadMantenimientoId()
        );
        domain.setTipoActivoId(request.tipoActivoId());
        domain.setComponenteId(request.componenteId());

        return toResponse(repository.save(domain));
    }

    @Transactional(readOnly = true)
    public ActividadMantenimientoAplicacionResponse findById(UUID id) {
        return toResponse(findDomainById(id));
    }

    @Transactional(readOnly = true)
    public PageResponse<ActividadMantenimientoAplicacionResponse>
    findAll(PageRequestDto pageRequest) {
        Pageable pageable = pageRequest.toPageable(SORT_FIELDS);

        return PageResponse.from(
                repository.findAll(pageable),
                this::toResponse
        );
    }

    @Transactional(readOnly = true)
    public PageResponse<ActividadMantenimientoAplicacionResponse>
    findByActividadMantenimientoId(
            UUID actividadMantenimientoId,
            PageRequestDto pageRequest
    ) {
        requireActividadMantenimientoExists(actividadMantenimientoId);

        Pageable pageable = pageRequest.toPageable(SORT_FIELDS);

        return PageResponse.from(
                repository.findByActividadMantenimientoId(
                        actividadMantenimientoId,
                        pageable
                ),
                this::toResponse
        );
    }

    @Transactional(readOnly = true)
    public PageResponse<ActividadMantenimientoAplicacionResponse>
    findByTipoActivoId(
            UUID tipoActivoId,
            PageRequestDto pageRequest
    ) {
        requireTipoActivoExists(tipoActivoId);

        Pageable pageable = pageRequest.toPageable(SORT_FIELDS);

        return PageResponse.from(
                repository.findByTipoActivoId(tipoActivoId, pageable),
                this::toResponse
        );
    }

    @Transactional
    public void delete(UUID id) {
        findDomainById(id);
        repository.deleteById(id);
    }

    private ActividadMantenimientoAplicacion findDomainById(UUID id) {
        return repository
                .findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Aplicación de actividad de mantenimiento",
                                id
                        )
                );
    }

    private void requireActividadMantenimientoExists(UUID id) {
        if (!actividadMantenimientoRepository.existsById(id)) {
            throw new ResourceNotFoundException(
                    "Actividad de mantenimiento", id
            );
        }
    }

    private void requireTipoActivoExists(UUID id) {
        if (!tipoActivoRepository.existsById(id)) {
            throw new ResourceNotFoundException(
                    "Tipo de activo", id
            );
        }
    }

    private void requireComponenteExists(UUID id) {
        if (!componenteRepository.existsById(id)) {
            throw new ResourceNotFoundException(
                    "Componente", id
            );
        }
    }

    private void validateUniqueForCreate(
            UUID actividadMantenimientoId,
            UUID tipoActivoId,
            UUID componenteId
    ) {
        if (repository
                .existsByActividadMantenimientoIdAndTipoActivoIdAndComponenteId(
                        actividadMantenimientoId,
                        tipoActivoId,
                        componenteId
                )) {
            throw new ConflictException(
                    "ACTIVIDAD_APLICACION_ALREADY_EXISTS",
                    "Ya existe esta aplicación de actividad para el tipo de activo y componente especificados"
            );
        }
    }

    private void validateUniqueForUpdate(
            UUID actividadMantenimientoId,
            UUID tipoActivoId,
            UUID componenteId,
            UUID currentId
    ) {
        if (repository
                .existsByActividadMantenimientoIdAndTipoActivoIdAndComponenteIdAndIdNot(
                        actividadMantenimientoId,
                        tipoActivoId,
                        componenteId,
                        currentId
                )) {
            throw new ConflictException(
                    "ACTIVIDAD_APLICACION_ALREADY_EXISTS",
                    "Ya existe otra aplicación de actividad para el tipo de activo y componente especificados"
            );
        }
    }

    private ActividadMantenimientoAplicacionResponse toResponse(
            ActividadMantenimientoAplicacion domain
    ) {
        ActividadMantenimientoAplicacionResponse
                .ActividadMantenimientoInfo actividadInfo = null;

        if (domain.getActividadMantenimientoId() != null) {
            actividadInfo = actividadMantenimientoRepository
                    .findById(domain.getActividadMantenimientoId())
                    .map(a ->
                            new ActividadMantenimientoAplicacionResponse
                                    .ActividadMantenimientoInfo(
                                    a.getId(),
                                    a.getCodigo(),
                                    a.getNombre()
                            )
                    )
                    .orElse(null);
        }

        ActividadMantenimientoAplicacionResponse.TipoActivoInfo
                tipoActivoInfo = null;

        if (domain.getTipoActivoId() != null) {
            tipoActivoInfo = tipoActivoRepository
                    .findById(domain.getTipoActivoId())
                    .map(t ->
                            new ActividadMantenimientoAplicacionResponse
                                    .TipoActivoInfo(
                                    t.getId(),
                                    t.getNombre()
                            )
                    )
                    .orElse(null);
        }

        ActividadMantenimientoAplicacionResponse.ComponenteInfo
                componenteInfo = null;

        if (domain.getComponenteId() != null) {
            componenteInfo = componenteRepository
                    .findById(domain.getComponenteId())
                    .map(c ->
                            new ActividadMantenimientoAplicacionResponse
                                    .ComponenteInfo(
                                    c.getId(),
                                    c.getNombre()
                            )
                    )
                    .orElse(null);
        }

        AuditoriaResponse auditoria = new AuditoriaResponse(
                domain.getCreatedAt(),
                domain.getUpdatedAt(),
                domain.getCreatedBy(),
                domain.getUpdatedBy()
        );

        return new ActividadMantenimientoAplicacionResponse(
                domain.getId(),
                actividadInfo,
                tipoActivoInfo,
                componenteInfo,
                auditoria
        );
    }
}
