package com.endecorani.sigma_api.modules.gestionvehicular.application.service;

import com.endecorani.sigma_api.modules.activos.application.service.AccesorioLookupService;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.controlactivo.request.ControlActivoDetalleRequest;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.controlactivo.response.ControlActivoDetalleResponse;
import com.endecorani.sigma_api.modules.gestionvehicular.application.mapper.ControlActivoVehicularMapper;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.model.ControlActivoDetalle;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.repository.ControlActivoDetalleRepository;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.repository.ControlActivoRepository;
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

@Service("gestionVehicularControlActivoDetalleService")
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
    private final ControlActivoVehicularMapper mapper;
    private final AccesorioLookupService accesorioLookupService;

    @Transactional
    public ControlActivoDetalleResponse create(ControlActivoDetalleRequest request) {
        if (request.controlActivoId() != null && controlActivoRepository.findById(request.controlActivoId()).isEmpty()) {
            throw new ResourceNotFoundException("Control de activo", request.controlActivoId());
        }

        ControlActivoDetalle domain = mapper.toDetalleDomain(request);
        return mapToResponse(repository.save(domain));
    }

    @Transactional
    public ControlActivoDetalleResponse update(UUID id, ControlActivoDetalleRequest request) {
        ControlActivoDetalle domain = obtenerPorId(id);

        if (request.controlActivoId() != null && controlActivoRepository.findById(request.controlActivoId()).isEmpty()) {
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

        Map<UUID, AccesorioLookupService.AccesorioResumen> accesorioMap = accesorioLookupService.findMapByIds(accesorioIds);

        return detalles.stream().map(d -> {
            AccesorioLookupService.AccesorioResumen acc = d.getAccesorioId() != null
                    ? accesorioMap.get(d.getAccesorioId())
                    : null;
            ControlActivoDetalleResponse.AccesorioInfo accesorioInfo = acc != null
                    ? new ControlActivoDetalleResponse.AccesorioInfo(acc.id(), acc.codigo(), acc.nombre())
                    : null;
            return new ControlActivoDetalleResponse(
                    d.getId(),
                    d.getControlActivoId(),
                    accesorioInfo,
                    d.getCantidadEsperada(),
                    d.getCantidadEncontrada(),
                    d.isConforme(),
                    d.getObservacion()
            );
        }).collect(Collectors.toList());
    }
}
