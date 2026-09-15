package com.endecorani.sigma_api.modules.mantenimientos.application.service;

import com.endecorani.sigma_api.modules.mantenimientos.application.dto.ordentrabajo.request.OrdenTrabajoRequest;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.ordentrabajo.request.OrdenTrabajoUpdate;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.ordentrabajo.response.OrdenTrabajoResponse;
import com.endecorani.sigma_api.modules.mantenimientos.application.mapper.OrdenTrabajoMapper;
import com.endecorani.sigma_api.modules.mantenimientos.domain.model.OrdenTrabajo;
import com.endecorani.sigma_api.modules.mantenimientos.domain.repository.OrdenTrabajoRepository;
import com.endecorani.sigma_api.modules.parametros.application.service.CorrelativoService;
import com.endecorani.sigma_api.modules.parametros.domain.constant.CorrelativoCodigo;
import com.endecorani.sigma_api.shared.application.pagination.PageRequestDto;
import com.endecorani.sigma_api.shared.application.pagination.PageResponse;
import com.endecorani.sigma_api.shared.domain.exception.ConflictException;
import com.endecorani.sigma_api.shared.domain.exception.ResourceNotFoundException;
import com.endecorani.sigma_api.shared.util.StringUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OrdenTrabajoService {

    private static final Set<String> SORT_FIELDS = Set.of(
            "id",
            "numero",
            "fechaInicio",
            "fechaFin",
            "createdAt",
            "updatedAt"
    );

    private final OrdenTrabajoRepository repository;
    private final OrdenTrabajoMapper mapper;
    private final CorrelativoService correlativoService;

    @Transactional(readOnly = true)
    public PageResponse<OrdenTrabajoResponse> findAll(PageRequestDto pageRequest) {
        Pageable pageable = pageRequest.toPageable(SORT_FIELDS);
        Page<OrdenTrabajo> resultado = repository.findAll(pageable);
        return PageResponse.from(resultado, mapper::toResponse);
    }

    @Transactional(readOnly = true)
    public PageResponse<OrdenTrabajoResponse> listar(String search, PageRequestDto pageRequest) {
        String normalized = StringUtils.normalize(search);
        Pageable pageable = pageRequest.toPageable(SORT_FIELDS);
        Page<OrdenTrabajo> resultado;

        if (normalized == null || normalized.isBlank()) {
            resultado = repository.findAll(pageable);
        } else {
            resultado = repository.search(normalized, pageable);
        }

        return PageResponse.from(resultado, mapper::toResponse);
    }

    @Transactional(readOnly = true)
    public OrdenTrabajoResponse findById(UUID id) {
        OrdenTrabajo ordenTrabajo = obtenerPorId(id);
        return mapper.toResponse(ordenTrabajo);
    }

    @Transactional(readOnly = true)
    public OrdenTrabajoResponse findByNumero(String numero) {
        OrdenTrabajo ordenTrabajo = repository.findByNumero(numero)
                .orElseThrow(() -> new ResourceNotFoundException("Orden de trabajo no encontrada con número: " + numero));
        return mapper.toResponse(ordenTrabajo);
    }

    @Transactional(readOnly = true)
    public OrdenTrabajoResponse findBySolicitudMantenimientoId(UUID solicitudMantenimientoId) {
        OrdenTrabajo ordenTrabajo = repository.findBySolicitudMantenimientoId(solicitudMantenimientoId)
                .orElseThrow(() -> new ResourceNotFoundException("Orden de trabajo no encontrada para la solicitud: " + solicitudMantenimientoId));
        return mapper.toResponse(ordenTrabajo);
    }

    @Transactional
    public OrdenTrabajoResponse create(OrdenTrabajoRequest dto) {
        if (repository.existsBySolicitudMantenimientoId(dto.solicitudMantenimientoId())) {
            throw new ConflictException(
                    "OT_SOLICITUD_DUPLICADA",
                    "Ya existe una orden de trabajo para esta solicitud de mantenimiento"
            );
        }

        String numero = correlativoService.generar(
                CorrelativoCodigo.ORDEN_TRABAJO,
                LocalDateTime.now().getYear()
        );

        OrdenTrabajo ordenTrabajo = mapper.toDomain(dto);
        ordenTrabajo.setNumero(numero);

        if (ordenTrabajo.getActividades() != null) {
            ordenTrabajo.getActividades().forEach(actividad -> {
                if (actividad.getOrdenTrabajoId() == null) {
                    actividad.setOrdenTrabajoId(ordenTrabajo.getId());
                }
                if (actividad.getEvidencias() != null) {
                    actividad.getEvidencias().forEach(evidencia -> {
                        if (evidencia.getOrdenTrabajoActividadId() == null) {
                            evidencia.setOrdenTrabajoActividadId(actividad.getId());
                        }
                    });
                }
            });
        }

        if (ordenTrabajo.getAdjuntos() != null) {
            ordenTrabajo.getAdjuntos().forEach(adjunto -> {
                if (adjunto.getOrdenTrabajoId() == null) {
                    adjunto.setOrdenTrabajoId(ordenTrabajo.getId());
                }
            });
        }

        OrdenTrabajo guardado = repository.save(ordenTrabajo);
        return mapper.toResponse(guardado);
    }

    @Transactional
    public OrdenTrabajoResponse update(UUID id, OrdenTrabajoUpdate dto) {
        OrdenTrabajo actual = obtenerPorId(id);

        if (repository.existsBySolicitudMantenimientoIdAndIdNot(dto.solicitudMantenimientoId(), id)) {
            throw new ConflictException(
                    "OT_SOLICITUD_DUPLICADA",
                    "Ya existe otra orden de trabajo para esta solicitud de mantenimiento"
            );
        }

        mapper.updateDomain(dto, actual);

        if (actual.getActividades() != null) {
            actual.getActividades().forEach(actividad -> {
                if (actividad.getOrdenTrabajoId() == null) {
                    actividad.setOrdenTrabajoId(actual.getId());
                }
                if (actividad.getEvidencias() != null) {
                    actividad.getEvidencias().forEach(evidencia -> {
                        if (evidencia.getOrdenTrabajoActividadId() == null) {
                            evidencia.setOrdenTrabajoActividadId(actividad.getId());
                        }
                    });
                }
            });
        }

        if (actual.getAdjuntos() != null) {
            actual.getAdjuntos().forEach(adjunto -> {
                if (adjunto.getOrdenTrabajoId() == null) {
                    adjunto.setOrdenTrabajoId(actual.getId());
                }
            });
        }

        OrdenTrabajo actualizado = repository.save(actual);
        return mapper.toResponse(actualizado);
    }

    @Transactional
    public void delete(UUID id) {
        obtenerPorId(id);
        repository.deleteById(id);
    }

    private OrdenTrabajo obtenerPorId(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Orden de trabajo", id));
    }
}
