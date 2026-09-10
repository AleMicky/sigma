package com.endecorani.sigma_api.modules.mantenimientos.application.service;

import com.endecorani.sigma_api.modules.mantenimientos.application.dto.prioridad.request.PrioridadRequest;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.prioridad.request.PrioridadUpdate;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.prioridad.response.PrioridadResponse;
import com.endecorani.sigma_api.modules.mantenimientos.application.mapper.PrioridadMapper;
import com.endecorani.sigma_api.modules.mantenimientos.domain.model.Prioridad;
import com.endecorani.sigma_api.modules.mantenimientos.domain.repository.PrioridadRepository;
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

import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PrioridadService {

    private static final Set<String> SORT_FIELDS = Set.of(
            "id",
            "codigo",
            "nombre",
            "descripcion",
            "nivel",
            "porDefecto",
            "createdAt",
            "updatedAt"
    );

    private final PrioridadRepository repository;
    private final PrioridadMapper mapper;

    @Transactional(readOnly = true)
    public PageResponse<PrioridadResponse> listar(String search, PageRequestDto pageRequest) {
        String normalized = StringUtils.normalize(search);
        Pageable pageable = pageRequest.toPageable(SORT_FIELDS);
        Page<Prioridad> resultado;

        if (normalized == null || normalized.isBlank()) {
            resultado = repository.findAll(pageable);
        } else {
            resultado = repository.search(normalized, pageable);
        }

        return PageResponse.from(resultado, mapper::toResponse);
    }

    @Transactional(readOnly = true)
    public PrioridadResponse buscarPorId(UUID id) {
        Prioridad prioridad = obtenerPorId(id);
        return mapper.toResponse(prioridad);
    }

    @Transactional
    public PrioridadResponse crear(
            PrioridadRequest dto
    ) {
        String codigo = StringUtils.normalize(dto.codigo());
        validateUniqueCodigoForCreate(codigo);

        boolean porDefecto = Boolean.TRUE.equals(dto.porDefecto());
        validateDefaultForCreate(porDefecto);

        Prioridad prioridad = Prioridad.builder()
                .codigo(codigo)
                .nombre(StringUtils.normalize(dto.nombre()))
                .descripcion(StringUtils.normalize(dto.descripcion()))
                .nivel(dto.nivel())
                .porDefecto(porDefecto)
                .build();

        Prioridad guardado = repository.save(prioridad);
        return mapper.toResponse(guardado);
    }

    @Transactional
    public PrioridadResponse actualizar(UUID id, PrioridadUpdate dto) {
        Prioridad actual = obtenerPorId(id);

        String codigo = StringUtils.normalize(dto.codigo());
        validateUniqueCodigoForUpdate(codigo, id);
        validateDefaultForUpdate(Boolean.TRUE.equals(dto.porDefecto()), id);

        actual.setCodigo(codigo);
        actual.setNombre(StringUtils.normalize(dto.nombre()));
        actual.setDescripcion(StringUtils.normalize(dto.descripcion()));
        actual.setNivel(dto.nivel());
        actual.setPorDefecto(dto.porDefecto());

        Prioridad actualizada = repository.save(actual);
        return mapper.toResponse(actualizada);
    }

    @Transactional
    public void eliminar(UUID id) {
        obtenerPorId(id);
        repository.deleteById(id);
    }

    private Prioridad obtenerPorId(UUID id) {
        return repository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Prioridad", id)
                );
    }

    private void validateUniqueCodigoForCreate(String codigo) {
        if (codigo != null && repository.existsByCodigoIgnoreCase(codigo)) {
            throw new ConflictException("PRIORIDAD_ALREADY_EXISTS", "Ya existe una prioridad con el código '%s'".formatted(codigo));
        }
    }

    private void validateUniqueCodigoForUpdate(String codigo, UUID currentId) {
        if (codigo != null && repository.existsByCodigoIgnoreCaseAndIdNot(codigo, currentId)) {
            throw new ConflictException("PRIORIDAD_ALREADY_EXISTS", "Ya existe otra prioridad con el código '%s'".formatted(codigo));
        }
    }

    private void validateDefaultForCreate(boolean porDefecto) {
        if (porDefecto && repository.existsByPorDefectoTrue()) {
            throw new ConflictException("PRIORIDAD_DEFAULT_ALREADY_EXISTS", "Ya existe una prioridad marcada como por defecto");
        }
    }

    private void validateDefaultForUpdate(boolean porDefecto, UUID currentId) {
        if (porDefecto && repository.existsByPorDefectoTrueAndIdNot(currentId)) {
            throw new ConflictException("PRIORIDAD_DEFAULT_ALREADY_EXISTS", "Ya existe otra prioridad marcada como por defecto");
        }
    }
}