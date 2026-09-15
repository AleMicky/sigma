package com.endecorani.sigma_api.modules.mantenimientos.application.service;

import com.endecorani.sigma_api.modules.mantenimientos.application.dto.actividad.request.ActividadMantenimientoRequest;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.actividad.request.ActividadMantenimientoUpdate;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.actividad.response.ActividadMantenimientoResponse;
import com.endecorani.sigma_api.modules.mantenimientos.application.mapper.ActividadMantenimientoMapper;
import com.endecorani.sigma_api.modules.mantenimientos.domain.model.ActividadMantenimiento;
import com.endecorani.sigma_api.modules.mantenimientos.domain.repository.ActividadMantenimientoRepository;
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

import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ActividadMantenimientoService {

    private static final Set<String> SORT_FIELDS = Set.of(
            "id",
            "codigo",
            "nombre",
            "aplicaTodosTiposActivo",
            "requiereChecklist",
            "createdAt",
            "updatedAt"
    );

    private final ActividadMantenimientoRepository repository;
    private final ActividadMantenimientoMapper mapper;

    @Transactional(readOnly = true)
    public PageResponse<ActividadMantenimientoResponse> findAll(PageRequestDto pageRequest) {
        Pageable pageable = pageRequest.toPageable(SORT_FIELDS);
        Page<ActividadMantenimiento> resultado = repository.findAll(pageable);
        return PageResponse.from(resultado, mapper::toResponse);
    }

    @Transactional(readOnly = true)
    public PageResponse<ActividadMantenimientoResponse> listar(String search, PageRequestDto pageRequest) {
        String normalized = StringUtils.normalize(search);
        Pageable pageable = pageRequest.toPageable(SORT_FIELDS);
        Page<ActividadMantenimiento> resultado;

        if (normalized == null || normalized.isBlank()) {
            resultado = repository.findAll(pageable);
        } else {
            resultado = repository.search(normalized, pageable);
        }

        return PageResponse.from(resultado, mapper::toResponse);
    }

    @Transactional(readOnly = true)
    public ActividadMantenimientoResponse findById(UUID id) {
        ActividadMantenimiento actividad = obtenerPorId(id);
        return mapper.toResponse(actividad);
    }

    @Transactional(readOnly = true)
    public ActividadMantenimientoResponse findByCodigo(String codigo) {
        ActividadMantenimiento actividad = repository.findByCodigo(codigo)
                .orElseThrow(() -> new ResourceNotFoundException("Actividad de mantenimiento no encontrada con código: " + codigo));
        return mapper.toResponse(actividad);
    }

    @Transactional(readOnly = true)
    public List<ActividadMantenimientoResponse> findByTipoActivoId(UUID tipoActivoId) {
        return repository.findByTipoActivoId(tipoActivoId).stream()
                .map(mapper::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public ActividadMantenimientoResponse create(ActividadMantenimientoRequest dto) {
        if (repository.existsByCodigoIgnoreCase(dto.codigo())) {
            throw new ConflictException(
                    "ACTIVIDAD_CODIGO_DUPLICADO",
                    "Ya existe una actividad de mantenimiento con el código " + dto.codigo()
            );
        }

        ActividadMantenimiento domain = mapper.toDomain(dto);
        if (domain.getAplicaciones() != null) {
            domain.getAplicaciones().forEach(aplicacion -> {
                if (aplicacion.getActividadMantenimientoId() == null) {
                    aplicacion.setActividadMantenimientoId(domain.getId());
                }
            });
        }

        ActividadMantenimiento guardado = repository.save(domain);
        return mapper.toResponse(guardado);
    }

    @Transactional
    public ActividadMantenimientoResponse update(UUID id, ActividadMantenimientoRequest dto) {
        ActividadMantenimiento actual = obtenerPorId(id);

        if (repository.existsByCodigoIgnoreCaseAndIdNot(dto.codigo(), id)) {
            throw new ConflictException(
                    "ACTIVIDAD_CODIGO_DUPLICADO",
                    "Ya existe otra actividad de mantenimiento con el código " + dto.codigo()
            );
        }

        mapper.updateDomainFromRequest(dto, actual);

        if (actual.getAplicaciones() != null) {
            actual.getAplicaciones().forEach(aplicacion -> {
                if (aplicacion.getActividadMantenimientoId() == null) {
                    aplicacion.setActividadMantenimientoId(actual.getId());
                }
            });
        }

        ActividadMantenimiento actualizado = repository.save(actual);
        return mapper.toResponse(actualizado);
    }

    @Transactional
    public ActividadMantenimientoResponse update(UUID id, ActividadMantenimientoUpdate dto) {
        ActividadMantenimiento actual = obtenerPorId(id);

        if (repository.existsByCodigoIgnoreCaseAndIdNot(dto.codigo(), id)) {
            throw new ConflictException(
                    "ACTIVIDAD_CODIGO_DUPLICADO",
                    "Ya existe otra actividad de mantenimiento con el código " + dto.codigo()
            );
        }

        mapper.updateDomain(dto, actual);

        if (actual.getAplicaciones() != null) {
            actual.getAplicaciones().forEach(aplicacion -> {
                if (aplicacion.getActividadMantenimientoId() == null) {
                    aplicacion.setActividadMantenimientoId(actual.getId());
                }
            });
        }

        ActividadMantenimiento actualizado = repository.save(actual);
        return mapper.toResponse(actualizado);
    }

    @Transactional
    public void delete(UUID id) {
        obtenerPorId(id);
        repository.deleteById(id);
    }

    private ActividadMantenimiento obtenerPorId(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Actividad de mantenimiento", id));
    }
}
