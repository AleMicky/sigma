package com.endecorani.sigma_api.modules.activos.application.service;

import com.endecorani.sigma_api.modules.activos.application.dto.request.CategoriaRequest;
import com.endecorani.sigma_api.modules.activos.application.dto.response.CategoriaResponse;
import com.endecorani.sigma_api.modules.activos.domain.model.Categoria;
import com.endecorani.sigma_api.modules.activos.domain.repository.CategoriaRepository;
import com.endecorani.sigma_api.shared.application.crud.AbstractCrudService;
import com.endecorani.sigma_api.shared.application.pagination.PageRequestDto;
import com.endecorani.sigma_api.shared.application.pagination.PageResponse;
import com.endecorani.sigma_api.shared.domain.exception.BusinessException;
import com.endecorani.sigma_api.shared.domain.exception.ConflictException;
import com.endecorani.sigma_api.shared.domain.repository.CrudRepository;
import com.endecorani.sigma_api.shared.util.StringUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CategoriaService extends AbstractCrudService<
        Categoria,
        CategoriaRequest,
        CategoriaResponse,
        UUID
        > {

    private static final Set<String> SORT_FIELDS = Set.of(
            "id",
            "codigo",
            "nombre",
            "descripcion",
            "orden",
            "createdAt",
            "updatedAt"
    );

    private final CategoriaRepository categoriaRepository;

    @Override
    protected CrudRepository<Categoria, UUID> repository() {
        return categoriaRepository;
    }

    @Override
    protected Set<String> allowedSortFields() {
        return SORT_FIELDS;
    }

    @Transactional(readOnly = true)
    public PageResponse<CategoriaResponse> search(
            String query,
            PageRequestDto pageRequest
    ) {
        String normalized = StringUtils.normalize(query);

        if (normalized == null) {
            return findAll(pageRequest);
        }

        return PageResponse.from(
                categoriaRepository.search(
                        normalized,
                        pageRequest.toPageable(allowedSortFields())
                ),
                this::toResponse
        );
    }

    @Override
    protected Categoria toDomain(CategoriaRequest request) {
        String codigo = StringUtils.normalize(request.codigo());
        validateUniqueCodigoForCreate(codigo);

        return Categoria.builder()
                .codigo(codigo)
                .nombre(StringUtils.normalize(request.nombre()))
                .descripcion(StringUtils.normalize(request.descripcion()))
                .orden(resolveOrdenForCreate(request.orden()))
                .build();
    }

    @Override
    protected void updateDomain(
            Categoria domain,
            CategoriaRequest request
    ) {
        String codigo = StringUtils.normalize(request.codigo());
        validateUniqueCodigoForUpdate(codigo, domain.getId());

        domain.setCodigo(codigo);
        domain.setNombre(StringUtils.normalize(request.nombre()));
        domain.setDescripcion(StringUtils.normalize(request.descripcion()));
        domain.setOrden(resolveOrdenForUpdate(request.orden()));
    }

    @Override
    protected CategoriaResponse toResponse(Categoria domain) {
        return new CategoriaResponse(
                domain.getId(),
                domain.getCodigo(),
                domain.getNombre(),
                domain.getDescripcion(),
                domain.getOrden(),
                domain.getCreatedAt(),
                domain.getUpdatedAt(),
                domain.getCreatedBy(),
                domain.getUpdatedBy()
        );
    }

    @Override
    protected String resourceName() {
        return "Categoría";
    }

    private void validateUniqueCodigoForCreate(String codigo) {
        if (categoriaRepository.existsByCodigoIgnoreCase(codigo)) {
            throw new ConflictException(
                    "CATEGORIA_ALREADY_EXISTS",
                    "Ya existe una categoría con el código '%s'"
                            .formatted(codigo)
            );
        }
    }

    private void validateUniqueCodigoForUpdate(
            String codigo,
            UUID currentId
    ) {
        if (categoriaRepository.existsByCodigoIgnoreCaseAndIdNot(
                codigo,
                currentId
        )) {
            throw new ConflictException(
                    "CATEGORIA_ALREADY_EXISTS",
                    "Ya existe otra categoría con el código '%s'"
                            .formatted(codigo)
            );
        }
    }

    private int resolveOrdenForCreate(Integer orden) {
        if (orden == null) {
            Integer maxOrden = categoriaRepository.findMaxOrden();
            return maxOrden == null ? 0 : maxOrden + 1;
        }

        if (orden < 0) {
            throw new BusinessException(
                    "INVALID_CATEGORIA_ORDEN",
                    "El orden no puede ser negativo"
            );
        }

        return orden;
    }

    private int resolveOrdenForUpdate(Integer orden) {
        int resolved = orden == null ? 0 : orden;

        if (resolved < 0) {
            throw new BusinessException(
                    "INVALID_CATEGORIA_ORDEN",
                    "El orden no puede ser negativo"
            );
        }

        return resolved;
    }
}
