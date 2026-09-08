package com.endecorani.sigma_api.modules.mantenimientos.application.service;

import com.endecorani.sigma_api.modules.mantenimientos.domain.model.TipoMantenimiento;
import com.endecorani.sigma_api.modules.mantenimientos.domain.repository.TipoMantenimientoRepository;
import com.endecorani.sigma_api.modules.mantenimientos.presentation.request.ActualizarTipoMantenimientoRequest;
import com.endecorani.sigma_api.modules.mantenimientos.presentation.request.CrearTipoMantenimientoRequest;
import com.endecorani.sigma_api.modules.mantenimientos.presentation.response.TipoMantenimientoResponse;
import com.endecorani.sigma_api.shared.application.pagination.PageRequestDto;
import com.endecorani.sigma_api.shared.application.pagination.PageResponse;
import com.endecorani.sigma_api.shared.util.StringUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
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

    @Transactional
    public TipoMantenimiento crear(CrearTipoMantenimientoRequest request) {

        String codigo = request.codigo()
                .trim()
                .toUpperCase();

        if (repository.existsByCodigo(codigo)) {
            throw new IllegalArgumentException(
                    "Ya existe un tipo de mantenimiento con el código: " + codigo
            );
        }

        TipoMantenimiento tipoMantenimiento =
                TipoMantenimiento.builder()
                        .id(UUID.randomUUID())
                        .codigo(codigo)
                        .nombre(request.nombre().trim())
                        .descripcion(request.descripcion())
                        .build();

        return repository.save(tipoMantenimiento);
    }

    @Transactional(readOnly = true)
    public List<TipoMantenimiento> listar() {
        return repository.findAll();
    }

    @Transactional(readOnly = true)
    public PageResponse<TipoMantenimientoResponse> findAll(PageRequestDto pageRequest) {
        var page = repository.findAll(pageRequest.toPageable(SORT_FIELDS));
        return PageResponse.from(page, this::toResponse);
    }

    @Transactional(readOnly = true)
    public PageResponse<TipoMantenimientoResponse> find(
            String query,
            PageRequestDto pageRequest
    ) {
        String normalized = StringUtils.normalize(query);
        if (normalized == null) {
            return findAll(pageRequest);
        }

        return PageResponse.from(
                repository.search(
                        normalized,
                        pageRequest.toPageable(SORT_FIELDS)
                ),
                this::toResponse
        );
    }

    @Transactional(readOnly = true)
    public TipoMantenimiento obtener(UUID id) {

        return repository.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Tipo de mantenimiento no encontrado: " + id
                        )
                );
    }

    public TipoMantenimientoResponse toResponse(TipoMantenimiento tipo) {
        return new TipoMantenimientoResponse(
                tipo.getId(),
                tipo.getCodigo(),
                tipo.getNombre(),
                tipo.getDescripcion()
        );
    }

    @Transactional
    public TipoMantenimiento actualizar(
            UUID id,
            ActualizarTipoMantenimientoRequest request
    ) {

        TipoMantenimiento actual = obtener(id);

        String codigo = request.codigo()
                .trim()
                .toUpperCase();

        if (repository.existsByCodigoAndIdNot(codigo, id)) {
            throw new IllegalArgumentException(
                    "Ya existe otro tipo de mantenimiento con el código: "
                            + codigo
            );
        }

        actual.setCodigo(codigo);
        actual.setNombre(request.nombre().trim());
        actual.setDescripcion(request.descripcion());

        return repository.save(actual);
    }

    @Transactional
    public void eliminar(UUID id) {

        TipoMantenimiento actual = obtener(id);

        repository.deleteById(actual.getId());
    }
}