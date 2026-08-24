package com.endecorani.sigma_api.modules.mantenimientos.application.service;

import com.endecorani.sigma_api.modules.mantenimientos.application.dto.request.ControlActivoRequest;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.response.ControlActivoResponse;
import com.endecorani.sigma_api.modules.mantenimientos.domain.model.ControlActivo;
import com.endecorani.sigma_api.modules.mantenimientos.domain.repository.ControlActivoRepository;
import com.endecorani.sigma_api.shared.application.dto.response.AuditoriaResponse;
import com.endecorani.sigma_api.shared.application.pagination.PageRequestDto;
import com.endecorani.sigma_api.shared.application.pagination.PageResponse;
import com.endecorani.sigma_api.shared.domain.exception.ResourceNotFoundException;
import com.endecorani.sigma_api.shared.util.StringUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ControlActivoService {

    private static final Set<String> SORT_FIELDS = Set.of(
            "id",
            "fecha",
            "tipo",
            "conforme",
            "createdAt",
            "updatedAt"
    );

    private final ControlActivoRepository controlActivoRepository;

    @Transactional
    public ControlActivoResponse create(ControlActivoRequest request) {
        ControlActivo domain = toDomain(request);
        ControlActivo saved = controlActivoRepository.save(domain);
        return toResponse(saved);
    }

    @Transactional
    public ControlActivoResponse update(UUID id, ControlActivoRequest request) {
        ControlActivo domain = findDomainById(id);
        updateDomain(domain, request);
        ControlActivo updated = controlActivoRepository.save(domain);
        return toResponse(updated);
    }

    @Transactional(readOnly = true)
    public ControlActivoResponse findById(UUID id) {
        return toResponse(findDomainById(id));
    }

    @Transactional(readOnly = true)
    public PageResponse<ControlActivoResponse> findAll(PageRequestDto pageRequest) {
        return PageResponse.from(
                controlActivoRepository.findAll(
                        pageRequest.toPageable(SORT_FIELDS)
                ),
                this::toResponse
        );
    }

    @Transactional
    public void delete(UUID id) {
        findDomainById(id);
        controlActivoRepository.deleteById(id);
    }

    private ControlActivo findDomainById(UUID id) {
        return controlActivoRepository
                .findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "ControlActivo",
                                id
                        )
                );
    }

    private ControlActivo toDomain(ControlActivoRequest request) {
        return ControlActivo.builder()
                .solicitudMantenimientoId(request.solicitudMantenimientoId())
                .ordenTrabajoId(request.ordenTrabajoId())
                .activoId(request.activoId())
                .tipo(request.tipo())
                .entregadoPorId(request.entregadoPorId())
                .recibidoPorId(request.recibidoPorId())
                .fecha(request.fecha())
                .conforme(request.conforme())
                .observacion(StringUtils.normalize(request.observacion()))
                .build();
    }

    private void updateDomain(
            ControlActivo domain,
            ControlActivoRequest request
    ) {
        domain.setSolicitudMantenimientoId(request.solicitudMantenimientoId());
        domain.setOrdenTrabajoId(request.ordenTrabajoId());
        domain.setActivoId(request.activoId());
        domain.setTipo(request.tipo());
        domain.setEntregadoPorId(request.entregadoPorId());
        domain.setRecibidoPorId(request.recibidoPorId());
        domain.setFecha(request.fecha());
        domain.setConforme(request.conforme());
        domain.setObservacion(StringUtils.normalize(request.observacion()));
    }

    private ControlActivoResponse toResponse(ControlActivo domain) {
        return new ControlActivoResponse(
                domain.getId(),
                domain.getSolicitudMantenimientoId(),
                domain.getOrdenTrabajoId(),
                domain.getActivoId(),
                domain.getTipo(),
                domain.getEntregadoPorId(),
                domain.getRecibidoPorId(),
                domain.getFecha(),
                domain.isConforme(),
                domain.getObservacion(),
                new AuditoriaResponse(
                        domain.getCreatedAt(),
                        domain.getUpdatedAt(),
                        domain.getCreatedBy(),
                        domain.getUpdatedBy()
                )
        );
    }
}
