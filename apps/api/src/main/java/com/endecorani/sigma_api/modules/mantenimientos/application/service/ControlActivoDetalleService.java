package com.endecorani.sigma_api.modules.mantenimientos.application.service;

import com.endecorani.sigma_api.modules.activos.domain.repository.AccesorioRepository;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.request.ControlActivoDetalleRequest;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.response.ControlActivoDetalleResponse;
import com.endecorani.sigma_api.modules.mantenimientos.domain.model.ControlActivoDetalle;
import com.endecorani.sigma_api.modules.mantenimientos.domain.repository.ControlActivoDetalleRepository;
import com.endecorani.sigma_api.shared.application.dto.response.AuditoriaResponse;
import com.endecorani.sigma_api.shared.application.pagination.PageRequestDto;
import com.endecorani.sigma_api.shared.application.pagination.PageResponse;
import com.endecorani.sigma_api.shared.domain.exception.ConflictException;
import com.endecorani.sigma_api.shared.domain.exception.ResourceNotFoundException;
import com.endecorani.sigma_api.shared.util.StringUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ControlActivoDetalleService {

    private static final Set<String> SORT_FIELDS = Set.of(
            "id",
            "cantidadEsperada",
            "cantidadEncontrada",
            "conforme",
            "createdAt",
            "updatedAt"
    );

    private final ControlActivoDetalleRepository controlActivoDetalleRepository;
    private final AccesorioRepository accesorioRepository;

    @Transactional
    public ControlActivoDetalleResponse create(ControlActivoDetalleRequest request) {
        validateUniqueAccesorioForCreate(
                request.controlActivoId(),
                request.accesorioId()
        );
        ControlActivoDetalle domain = toDomain(request);
        ControlActivoDetalle saved = controlActivoDetalleRepository.save(domain);
        return toResponse(saved);
    }

    @Transactional
    public ControlActivoDetalleResponse update(UUID id, ControlActivoDetalleRequest request) {
        ControlActivoDetalle domain = findDomainById(id);
        validateUniqueAccesorioForUpdate(
                request.controlActivoId(),
                request.accesorioId(),
                domain.getId()
        );
        updateDomain(domain, request);
        ControlActivoDetalle updated = controlActivoDetalleRepository.save(domain);
        return toResponse(updated);
    }

    @Transactional(readOnly = true)
    public ControlActivoDetalleResponse findById(UUID id) {
        return toResponse(findDomainById(id));
    }

    @Transactional(readOnly = true)
    public PageResponse<ControlActivoDetalleResponse> findAll(PageRequestDto pageRequest) {
        return PageResponse.from(
                controlActivoDetalleRepository.findAll(
                        pageRequest.toPageable(SORT_FIELDS)
                ),
                this::toResponse
        );
    }

    @Transactional(readOnly = true)
    public PageResponse<ControlActivoDetalleResponse> findAll(
            UUID controlActivoId,
            PageRequestDto pageRequest
    ) {
        return PageResponse.from(
                controlActivoDetalleRepository.findByControlActivoId(
                        controlActivoId,
                        pageRequest.toPageable(SORT_FIELDS)
                ),
                this::toResponse
        );
    }

    @Transactional
    public void delete(UUID id) {
        findDomainById(id);
        controlActivoDetalleRepository.deleteById(id);
    }

    private ControlActivoDetalle findDomainById(UUID id) {
        return controlActivoDetalleRepository
                .findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "ControlActivoDetalle",
                                id
                        )
                );
    }

    private void validateUniqueAccesorioForCreate(
            UUID controlActivoId,
            UUID accesorioId
    ) {
        if (controlActivoDetalleRepository.existsByControlActivoIdAndAccesorioId(
                controlActivoId,
                accesorioId
        )) {
            throw new ConflictException(
                    "CONTROL_ACTIVO_DETALLE_ALREADY_EXISTS",
                    "Ya existe un detalle con el accesorio '%s' para el control de activo '%s'"
                            .formatted(accesorioId, controlActivoId)
            );
        }
    }

    private void validateUniqueAccesorioForUpdate(
            UUID controlActivoId,
            UUID accesorioId,
            UUID currentId
    ) {
        if (controlActivoDetalleRepository.existsByControlActivoIdAndAccesorioIdAndIdNot(
                controlActivoId,
                accesorioId,
                currentId
        )) {
            throw new ConflictException(
                    "CONTROL_ACTIVO_DETALLE_ALREADY_EXISTS",
                    "Ya existe otro detalle con el accesorio '%s' para el control de activo '%s'"
                            .formatted(accesorioId, controlActivoId)
            );
        }
    }

    private ControlActivoDetalle toDomain(ControlActivoDetalleRequest request) {
        return ControlActivoDetalle.builder()
                .controlActivoId(request.controlActivoId())
                .accesorioId(request.accesorioId())
                .cantidadEsperada(request.cantidadEsperada())
                .cantidadEncontrada(request.cantidadEncontrada())
                .conforme(request.conforme())
                .observacion(StringUtils.normalize(request.observacion()))
                .build();
    }

    private void updateDomain(
            ControlActivoDetalle domain,
            ControlActivoDetalleRequest request
    ) {
        domain.setControlActivoId(request.controlActivoId());
        domain.setAccesorioId(request.accesorioId());
        domain.setCantidadEsperada(request.cantidadEsperada());
        domain.setCantidadEncontrada(request.cantidadEncontrada());
        domain.setConforme(request.conforme());
        domain.setObservacion(StringUtils.normalize(request.observacion()));
    }

    private ControlActivoDetalleResponse toResponse(ControlActivoDetalle domain) {
        var accesorioInfo = domain.getAccesorioId() != null
                ? accesorioRepository.findById(domain.getAccesorioId())
                .map(a -> new ControlActivoDetalleResponse.AccesorioInfo(
                        a.getId(),
                        a.getCodigo(),
                        a.getNombre()
                ))
                .orElse(null)
                : null;

        return new ControlActivoDetalleResponse(
                domain.getId(),
                domain.getControlActivoId(),
                accesorioInfo,
                domain.getCantidadEsperada(),
                domain.getCantidadEncontrada(),
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
