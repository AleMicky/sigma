package com.endecorani.sigma_api.modules.mantenimientos.application.service;

import com.endecorani.sigma_api.modules.mantenimientos.application.dto.request.OrdenTrabajoActividadRequest;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.response.OrdenTrabajoActividadResponse;
import com.endecorani.sigma_api.modules.mantenimientos.domain.model.OrdenTrabajoActividad;
import com.endecorani.sigma_api.modules.mantenimientos.domain.repository.ActividadMantenimientoRepository;
import com.endecorani.sigma_api.modules.mantenimientos.domain.repository.OrdenTrabajoActividadRepository;
import com.endecorani.sigma_api.modules.mantenimientos.domain.repository.OrdenTrabajoRepository;
import com.endecorani.sigma_api.shared.application.mapper.AuditoriaMapper;
import com.endecorani.sigma_api.shared.application.pagination.PageRequestDto;
import com.endecorani.sigma_api.shared.application.pagination.PageResponse;
import com.endecorani.sigma_api.shared.domain.exception.ResourceNotFoundException;
import com.endecorani.sigma_api.shared.util.StringUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OrdenTrabajoActividadService {

    private static final Set<String> SORT_FIELDS = Set.of(
            "id",
            "ordenTrabajoId",
            "actividadMantenimientoId",
            "descripcion",
            "realizado",
            "fechaRealizacion",
            "createdAt",
            "updatedAt"
    );

    private final OrdenTrabajoActividadRepository repository;
    private final OrdenTrabajoRepository ordenTrabajoRepository;
    private final ActividadMantenimientoRepository actividadMantenimientoRepository;

    @Transactional
    public OrdenTrabajoActividadResponse create(OrdenTrabajoActividadRequest request) {
        requireOrdenTrabajoExists(request.ordenTrabajoId());

        if (request.actividadMantenimientoId() != null) {
            requireActividadMantenimientoExists(request.actividadMantenimientoId());
        }

        OrdenTrabajoActividad domain = OrdenTrabajoActividad.builder()
                .ordenTrabajoId(request.ordenTrabajoId())
                .actividadMantenimientoId(request.actividadMantenimientoId())
                .descripcion(StringUtils.normalize(request.descripcion()))
                .realizado(request.realizado())
                .observacion(StringUtils.normalize(request.observacion()))
                .fechaRealizacion(request.fechaRealizacion())
                .build();

        return toResponse(repository.save(domain));
    }

    @Transactional
    public OrdenTrabajoActividadResponse update(
            UUID id,
            OrdenTrabajoActividadRequest request
    ) {
        requireOrdenTrabajoExists(request.ordenTrabajoId());

        if (request.actividadMantenimientoId() != null) {
            requireActividadMantenimientoExists(request.actividadMantenimientoId());
        }

        OrdenTrabajoActividad domain = findDomainById(id);

        domain.setOrdenTrabajoId(request.ordenTrabajoId());
        domain.setActividadMantenimientoId(request.actividadMantenimientoId());
        domain.setDescripcion(StringUtils.normalize(request.descripcion()));
        domain.setRealizado(request.realizado());
        domain.setObservacion(StringUtils.normalize(request.observacion()));
        domain.setFechaRealizacion(request.fechaRealizacion());

        return toResponse(repository.save(domain));
    }

    @Transactional(readOnly = true)
    public OrdenTrabajoActividadResponse findById(UUID id) {
        return toResponse(findDomainById(id));
    }

    @Transactional(readOnly = true)
    public PageResponse<OrdenTrabajoActividadResponse> findAll(PageRequestDto pageRequest) {
        Pageable pageable = pageRequest.toPageable(SORT_FIELDS);

        return PageResponse.from(
                repository.findAll(pageable),
                this::toResponse
        );
    }

    @Transactional(readOnly = true)
    public PageResponse<OrdenTrabajoActividadResponse> findByOrdenTrabajoId(
            UUID ordenTrabajoId,
            PageRequestDto pageRequest
    ) {
        requireOrdenTrabajoExists(ordenTrabajoId);

        Pageable pageable = pageRequest.toPageable(SORT_FIELDS);

        return PageResponse.from(
                repository.findByOrdenTrabajoId(ordenTrabajoId, pageable),
                this::toResponse
        );
    }

    @Transactional
    public void delete(UUID id) {
        findDomainById(id);
        repository.deleteById(id);
    }

    private OrdenTrabajoActividad findDomainById(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Actividad de orden de trabajo", id));
    }

    private void requireOrdenTrabajoExists(UUID id) {
        if (!ordenTrabajoRepository.existsById(id)) {
            throw new ResourceNotFoundException("Orden de trabajo", id);
        }
    }

    private void requireActividadMantenimientoExists(UUID id) {
        if (!actividadMantenimientoRepository.existsById(id)) {
            throw new ResourceNotFoundException("Actividad de mantenimiento", id);
        }
    }

    private OrdenTrabajoActividadResponse toResponse(OrdenTrabajoActividad domain) {
        var ordenTrabajoInfo = domain.getOrdenTrabajoId() != null
                ? ordenTrabajoRepository.findById(domain.getOrdenTrabajoId())
                .map(o -> new OrdenTrabajoActividadResponse.OrdenTrabajoInfo(
                        o.getId(),
                        o.getNumero()
                ))
                .orElse(null)
                : null;

        var actividadInfo = domain.getActividadMantenimientoId() != null
                ? actividadMantenimientoRepository.findById(domain.getActividadMantenimientoId())
                .map(a -> new OrdenTrabajoActividadResponse.ActividadMantenimientoInfo(
                        a.getId(),
                        a.getCodigo(),
                        a.getNombre()
                ))
                .orElse(null)
                : null;

        return new OrdenTrabajoActividadResponse(
                domain.getId(),
                ordenTrabajoInfo,
                actividadInfo,
                domain.getDescripcion(),
                domain.isRealizado(),
                domain.getObservacion(),
                domain.getFechaRealizacion(),
                AuditoriaMapper.from(domain)
        );
    }
}
