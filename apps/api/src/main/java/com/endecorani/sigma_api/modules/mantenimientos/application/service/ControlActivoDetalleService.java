package com.endecorani.sigma_api.modules.mantenimientos.application.service;

import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.entity.AccesorioEntity;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.repository.SpringAccesorioRepository;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.controlactivo.request.ControlActivoDetalleRequest;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.controlactivo.response.ControlActivoDetalleResponse;
import com.endecorani.sigma_api.modules.mantenimientos.application.mapper.ControlActivoMapper;
import com.endecorani.sigma_api.modules.mantenimientos.domain.model.ControlActivoDetalle;
import com.endecorani.sigma_api.modules.mantenimientos.domain.repository.ControlActivoDetalleRepository;
import com.endecorani.sigma_api.modules.mantenimientos.domain.repository.ControlActivoRepository;
import com.endecorani.sigma_api.shared.application.pagination.PageRequestDto;
import com.endecorani.sigma_api.shared.application.pagination.PageResponse;
import com.endecorani.sigma_api.shared.domain.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

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

    private final ControlActivoDetalleRepository repository;
    private final ControlActivoRepository controlActivoRepository;
    private final ControlActivoMapper mapper;
    private final SpringAccesorioRepository springAccesorioRepository;

    @Transactional
    public ControlActivoDetalleResponse create(ControlActivoDetalleRequest request) {
        if (request.controlActivoId() != null && !controlActivoRepository.findById(request.controlActivoId()).isPresent()) {
            throw new ResourceNotFoundException("Control de activo", request.controlActivoId());
        }

        ControlActivoDetalle domain = mapper.toDetalleDomain(request);
        return mapToResponse(repository.save(domain));
    }

    @Transactional
    public ControlActivoDetalleResponse update(UUID id, ControlActivoDetalleRequest request) {
        ControlActivoDetalle domain = obtenerPorId(id);

        if (request.controlActivoId() != null && !controlActivoRepository.findById(request.controlActivoId()).isPresent()) {
            throw new ResourceNotFoundException("Control de activo", request.controlActivoId());
        }

        mapper.updateDetalleFromRequest(request, domain);

        if (request.controlActivoId() != null) {
            domain.setControlActivoId(request.controlActivoId());
        }

        return mapToResponse(repository.save(domain));
    }

    @Transactional(readOnly = true)
    public ControlActivoDetalleResponse findById(UUID id) {
        ControlActivoDetalle domain = obtenerPorId(id);
        return mapToResponse(domain);
    }

    @Transactional(readOnly = true)
    public PageResponse<ControlActivoDetalleResponse> findAll(PageRequestDto pageRequest) {
        Pageable pageable = pageRequest.toPageable(SORT_FIELDS);
        Page<ControlActivoDetalle> resultado = repository.findAll(pageable);
        List<ControlActivoDetalleResponse> content = mapToResponses(resultado.getContent());
        return new PageResponse<>(
                content,
                resultado.getNumber(),
                resultado.getSize(),
                resultado.getTotalElements(),
                resultado.getTotalPages(),
                resultado.isFirst(),
                resultado.isLast(),
                resultado.isEmpty()
        );
    }

    @Transactional(readOnly = true)
    public PageResponse<ControlActivoDetalleResponse> findAll(UUID controlActivoId, PageRequestDto pageRequest) {
        Pageable pageable = pageRequest.toPageable(SORT_FIELDS);
        Page<ControlActivoDetalle> resultado = repository.findByControlActivoId(controlActivoId, pageable);
        List<ControlActivoDetalleResponse> content = mapToResponses(resultado.getContent());
        return new PageResponse<>(
                content,
                resultado.getNumber(),
                resultado.getSize(),
                resultado.getTotalElements(),
                resultado.getTotalPages(),
                resultado.isFirst(),
                resultado.isLast(),
                resultado.isEmpty()
        );
    }

    @Transactional
    public void delete(UUID id) {
        obtenerPorId(id);
        repository.deleteById(id);
    }

    private ControlActivoDetalle obtenerPorId(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Detalle de control de activo", id));
    }

    private ControlActivoDetalleResponse mapToResponse(ControlActivoDetalle detalle) {
        if (detalle == null) return null;
        List<ControlActivoDetalleResponse> responses = mapToResponses(List.of(detalle));
        return responses.isEmpty() ? null : responses.getFirst();
    }

    private List<ControlActivoDetalleResponse> mapToResponses(List<ControlActivoDetalle> detalles) {
        if (detalles == null || detalles.isEmpty()) return Collections.emptyList();

        Set<UUID> accesorioIds = detalles.stream()
                .map(ControlActivoDetalle::getAccesorioId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        Map<UUID, ControlActivoDetalleResponse.AccesorioInfo> accesorioMap = Collections.emptyMap();
        if (!accesorioIds.isEmpty()) {
            accesorioMap = springAccesorioRepository.findAllById(accesorioIds).stream()
                    .collect(Collectors.toMap(
                            AccesorioEntity::getId,
                            acc -> new ControlActivoDetalleResponse.AccesorioInfo(acc.getId(), acc.getCodigo(), acc.getNombre()),
                            (a, b) -> a
                    ));
        }

        final Map<UUID, ControlActivoDetalleResponse.AccesorioInfo> finalMap = accesorioMap;
        return detalles.stream().map(d -> new ControlActivoDetalleResponse(
                d.getId(),
                d.getControlActivoId(),
                d.getAccesorioId() != null ? finalMap.get(d.getAccesorioId()) : null,
                d.getCantidadEsperada(),
                d.getCantidadEncontrada(),
                d.isConforme(),
                d.getObservacion()
        )).collect(Collectors.toList());
    }
}
