package com.endecorani.sigma_api.modules.mantenimientos.application.service;

import com.endecorani.sigma_api.modules.mantenimientos.application.dto.actividad.request.ActividadMantenimientoAplicacionRequest;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.actividad.response.ActividadMantenimientoAplicacionResponse;
import com.endecorani.sigma_api.modules.mantenimientos.application.mapper.ActividadMantenimientoMapper;
import com.endecorani.sigma_api.modules.mantenimientos.domain.model.ActividadMantenimientoAplicacion;
import com.endecorani.sigma_api.modules.mantenimientos.domain.repository.ActividadMantenimientoAplicacionRepository;
import com.endecorani.sigma_api.modules.mantenimientos.domain.repository.ActividadMantenimientoRepository;
import com.endecorani.sigma_api.shared.application.pagination.PageRequestDto;
import com.endecorani.sigma_api.shared.application.pagination.PageResponse;
import com.endecorani.sigma_api.shared.domain.exception.ConflictException;
import com.endecorani.sigma_api.shared.domain.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
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
            "tipoActivoId",
            "componenteId",
            "createdAt",
            "updatedAt"
    );

    private final ActividadMantenimientoAplicacionRepository repository;
    private final ActividadMantenimientoRepository actividadRepository;
    private final ActividadMantenimientoMapper mapper;

    @Transactional
    public ActividadMantenimientoAplicacionResponse create(ActividadMantenimientoAplicacionRequest dto) {
        if (dto.actividadMantenimientoId() != null && !actividadRepository.findById(dto.actividadMantenimientoId()).isPresent()) {
            throw new ResourceNotFoundException("Actividad de mantenimiento", dto.actividadMantenimientoId());
        }

        if (dto.actividadMantenimientoId() != null && repository.existsByActividadMantenimientoIdAndTipoActivoIdAndComponenteId(
                dto.actividadMantenimientoId(), dto.tipoActivoId(), dto.componenteId())) {
            throw new ConflictException("APLICACION_DUPLICADA", "Ya existe esta aplicación para la actividad de mantenimiento");
        }

        ActividadMantenimientoAplicacion domain = mapper.toAplicacionDomain(dto);
        return mapper.toAplicacionResponse(repository.save(domain));
    }

    @Transactional
    public ActividadMantenimientoAplicacionResponse update(UUID id, ActividadMantenimientoAplicacionRequest dto) {
        ActividadMantenimientoAplicacion domain = obtenerPorId(id);

        if (dto.actividadMantenimientoId() != null && !actividadRepository.findById(dto.actividadMantenimientoId()).isPresent()) {
            throw new ResourceNotFoundException("Actividad de mantenimiento", dto.actividadMantenimientoId());
        }

        mapper.updateAplicacionFromRequest(dto, domain);

        if (dto.actividadMantenimientoId() != null) {
            domain.setActividadMantenimientoId(dto.actividadMantenimientoId());
        }

        return mapper.toAplicacionResponse(repository.save(domain));
    }

    @Transactional(readOnly = true)
    public ActividadMantenimientoAplicacionResponse findById(UUID id) {
        ActividadMantenimientoAplicacion domain = obtenerPorId(id);
        return mapper.toAplicacionResponse(domain);
    }

    @Transactional(readOnly = true)
    public PageResponse<ActividadMantenimientoAplicacionResponse> findByActividadMantenimientoId(
            UUID actividadMantenimientoId,
            PageRequestDto pageRequest
    ) {
        Pageable pageable = pageRequest.toPageable(SORT_FIELDS);
        Page<ActividadMantenimientoAplicacion> resultado = repository.findByActividadMantenimientoId(actividadMantenimientoId, pageable);
        return PageResponse.from(resultado, mapper::toAplicacionResponse);
    }

    @Transactional(readOnly = true)
    public PageResponse<ActividadMantenimientoAplicacionResponse> findAll(PageRequestDto pageRequest) {
        Pageable pageable = pageRequest.toPageable(SORT_FIELDS);
        Page<ActividadMantenimientoAplicacion> resultado = repository.findAll(pageable);
        return PageResponse.from(resultado, mapper::toAplicacionResponse);
    }

    @Transactional
    public void delete(UUID id) {
        obtenerPorId(id);
        repository.deleteById(id);
    }

    private ActividadMantenimientoAplicacion obtenerPorId(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Aplicación de actividad de mantenimiento", id));
    }
}
