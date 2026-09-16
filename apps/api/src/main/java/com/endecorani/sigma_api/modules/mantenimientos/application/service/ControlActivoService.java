package com.endecorani.sigma_api.modules.mantenimientos.application.service;

import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.entity.AccesorioEntity;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.repository.SpringAccesorioRepository;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.controlactivo.request.ControlActivoRequest;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.controlactivo.request.ControlActivoUpdate;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.controlactivo.response.ControlActivoDetalleResponse;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.controlactivo.response.ControlActivoResponse;
import com.endecorani.sigma_api.modules.mantenimientos.application.mapper.ControlActivoMapper;
import com.endecorani.sigma_api.modules.mantenimientos.domain.model.ControlActivo;
import com.endecorani.sigma_api.modules.mantenimientos.domain.model.ControlActivoDetalle;
import com.endecorani.sigma_api.modules.mantenimientos.domain.repository.ControlActivoRepository;
import com.endecorani.sigma_api.shared.application.pagination.PageRequestDto;
import com.endecorani.sigma_api.shared.application.pagination.PageResponse;
import com.endecorani.sigma_api.shared.domain.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

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

    private final ControlActivoRepository repository;
    private final ControlActivoMapper mapper;
    private final SpringAccesorioRepository springAccesorioRepository;

    @Transactional(readOnly = true)
    public PageResponse<ControlActivoResponse> findAll(PageRequestDto pageRequest) {
        Pageable pageable = pageRequest.toPageable(SORT_FIELDS);
        Page<ControlActivo> resultado = repository.findAll(pageable);
        List<ControlActivoResponse> content = mapToResponses(resultado.getContent());
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
    public ControlActivoResponse findById(UUID id) {
        ControlActivo controlActivo = obtenerPorId(id);
        return mapToResponse(controlActivo);
    }

    @Transactional(readOnly = true)
    public List<ControlActivoResponse> findBySolicitudMantenimientoId(UUID solicitudMantenimientoId) {
        return mapToResponses(repository.findBySolicitudMantenimientoId(solicitudMantenimientoId));
    }

    @Transactional(readOnly = true)
    public List<ControlActivoResponse> findByOrdenTrabajoId(UUID ordenTrabajoId) {
        return mapToResponses(repository.findByOrdenTrabajoId(ordenTrabajoId));
    }

    @Transactional(readOnly = true)
    public List<ControlActivoResponse> findByActivoId(UUID activoId) {
        return mapToResponses(repository.findByActivoId(activoId));
    }

    @Transactional
    public ControlActivoResponse create(ControlActivoRequest dto) {
        ControlActivo controlActivo = mapper.toDomain(dto);
        if (controlActivo.getFecha() == null) {
            controlActivo.setFecha(LocalDateTime.now());
        }

        if (controlActivo.getDetalles() != null) {
            controlActivo.getDetalles().forEach(detalle -> {
                if (detalle.getControlActivoId() == null) {
                    detalle.setControlActivoId(controlActivo.getId());
                }
            });
        }

        ControlActivo guardado = repository.save(controlActivo);
        return mapToResponse(guardado);
    }

    @Transactional
    public ControlActivoResponse update(UUID id, ControlActivoUpdate dto) {
        ControlActivo actual = obtenerPorId(id);
        mapper.updateDomain(dto, actual);

        if (actual.getDetalles() != null) {
            actual.getDetalles().forEach(detalle -> {
                if (detalle.getControlActivoId() == null) {
                    detalle.setControlActivoId(actual.getId());
                }
            });
        }

        ControlActivo actualizado = repository.save(actual);
        return mapToResponse(actualizado);
    }

    @Transactional
    public void delete(UUID id) {
        obtenerPorId(id);
        repository.deleteById(id);
    }

    private ControlActivo obtenerPorId(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Control de activo", id));
    }

    private ControlActivoResponse mapToResponse(ControlActivo controlActivo) {
        if (controlActivo == null) return null;
        List<ControlActivoResponse> responses = mapToResponses(List.of(controlActivo));
        return responses.isEmpty() ? null : responses.getFirst();
    }

    private List<ControlActivoResponse> mapToResponses(List<ControlActivo> controles) {
        if (controles == null || controles.isEmpty()) {
            return Collections.emptyList();
        }

        Set<UUID> accesorioIds = controles.stream()
                .filter(c -> c.getDetalles() != null)
                .flatMap(c -> c.getDetalles().stream())
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

        return controles.stream().map(c -> {
            ControlActivoResponse base = mapper.toResponse(c);
            List<ControlActivoDetalleResponse> detallesResponse = Collections.emptyList();
            if (c.getDetalles() != null && !c.getDetalles().isEmpty()) {
                detallesResponse = c.getDetalles().stream().map(d -> new ControlActivoDetalleResponse(
                        d.getId(),
                        d.getControlActivoId(),
                        d.getAccesorioId() != null ? finalMap.get(d.getAccesorioId()) : null,
                        d.getCantidadEsperada(),
                        d.getCantidadEncontrada(),
                        d.isConforme(),
                        d.getObservacion()
                )).collect(Collectors.toList());
            }

            return new ControlActivoResponse(
                    base.id(),
                    base.solicitudMantenimientoId(),
                    base.ordenTrabajoId(),
                    base.activoId(),
                    base.tipo(),
                    base.entregadoPorId(),
                    base.recibidoPorId(),
                    base.fecha(),
                    base.conforme(),
                    base.observacion(),
                    detallesResponse,
                    base.auditoria()
            );
        }).collect(Collectors.toList());
    }
}
