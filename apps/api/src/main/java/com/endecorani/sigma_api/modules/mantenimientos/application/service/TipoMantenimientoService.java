package com.endecorani.sigma_api.modules.mantenimientos.application.service;

import com.endecorani.sigma_api.modules.mantenimientos.application.dto.tipo.request.TipoMantenimientoRequest;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.tipo.request.TipoMantenimientoUpdate;
import com.endecorani.sigma_api.modules.mantenimientos.application.dto.tipo.response.TipoMantenimientoResponse;
import com.endecorani.sigma_api.modules.mantenimientos.application.mapper.TipoMantenimientoMapper;
import com.endecorani.sigma_api.modules.mantenimientos.domain.model.TipoMantenimiento;
import com.endecorani.sigma_api.modules.mantenimientos.domain.repository.TipoMantenimientoRepository;
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
public class TipoMantenimientoService {

    private static final Set<String> SORT_FIELDS = Set.of(
            "id",
            "codigo",
            "nombre",
            "descripcion",
            "createdAt",
            "updatedAt"
    );

    private final TipoMantenimientoRepository repository;
    private final TipoMantenimientoMapper mapper;

    @Transactional(readOnly = true)
    public PageResponse<TipoMantenimientoResponse> listar(String search, PageRequestDto pageRequest) {
        String normalized = StringUtils.normalize(search);
        Pageable pageable = pageRequest.toPageable(SORT_FIELDS);
        Page<TipoMantenimiento> resultado;

        if (normalized == null || normalized.isBlank()) {
            resultado = repository.findAll(pageable);
        } else {
            resultado = repository.search(normalized, pageable);
        }

        return PageResponse.from(resultado, mapper::toResponse);
    }

    @Transactional(readOnly = true)
    public TipoMantenimientoResponse buscarPorId(UUID id) {
        TipoMantenimiento tipo = obtenerPorId(id);
        return mapper.toResponse(tipo);
    }

    @Transactional
    public TipoMantenimientoResponse crear(
            TipoMantenimientoRequest dto
    ) {
        String codigo = StringUtils.normalize(dto.codigo());
        validateUniqueCodigoForCreate(codigo);

        TipoMantenimiento tipo = TipoMantenimiento.builder()
                .codigo(codigo)
                .nombre(StringUtils.normalize(dto.nombre()))
                .descripcion(StringUtils.normalize(dto.descripcion()))
                .build();

        TipoMantenimiento guardado = repository.save(tipo);
        return mapper.toResponse(guardado);
    }

    @Transactional
    public TipoMantenimientoResponse actualizar(UUID id, TipoMantenimientoUpdate dto) {
        TipoMantenimiento actual = obtenerPorId(id);

        String codigo = StringUtils.normalize(dto.codigo());
        validateUniqueCodigoForUpdate(codigo, id);

        actual.setCodigo(codigo);
        actual.setNombre(StringUtils.normalize(dto.nombre()));
        actual.setDescripcion(StringUtils.normalize(dto.descripcion()));

        TipoMantenimiento actualizado = repository.save(actual);
        return mapper.toResponse(actualizado);
    }

    @Transactional
    public void eliminar(UUID id) {
        obtenerPorId(id);
        repository.deleteById(id);
    }

    private TipoMantenimiento obtenerPorId(UUID id) {
        return repository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Tipo de mantenimiento", id)
                );
    }

    private void validateUniqueCodigoForCreate(String codigo) {
        if (codigo != null && repository.existsByCodigoIgnoreCase(codigo)) {
            throw new ConflictException("TIPO_MANTENIMIENTO_ALREADY_EXISTS", "Ya existe un tipo de mantenimiento con el código '%s'".formatted(codigo));
        }
    }

    private void validateUniqueCodigoForUpdate(String codigo, UUID currentId) {
        if (codigo != null && repository.existsByCodigoIgnoreCaseAndIdNot(codigo, currentId)) {
            throw new ConflictException("TIPO_MANTENIMIENTO_ALREADY_EXISTS", "Ya existe otro tipo de mantenimiento con el código '%s'".formatted(codigo));
        }
    }
}
