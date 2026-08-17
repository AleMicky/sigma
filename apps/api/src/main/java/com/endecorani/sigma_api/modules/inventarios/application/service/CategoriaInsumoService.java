package com.endecorani.sigma_api.modules.inventarios.application.service;

import com.endecorani.sigma_api.modules.inventarios.application.dto.request.CategoriaInsumoRequest;
import com.endecorani.sigma_api.modules.inventarios.application.dto.response.CategoriaInsumoResponse;
import com.endecorani.sigma_api.modules.inventarios.domain.model.CategoriaInsumo;
import com.endecorani.sigma_api.modules.inventarios.domain.repository.CategoriaInsumoRepository;
import com.endecorani.sigma_api.modules.inventarios.domain.repository.TipoInsumoRepository;
import com.endecorani.sigma_api.shared.application.crud.AbstractCrudService;
import com.endecorani.sigma_api.shared.application.pagination.PageRequestDto;
import com.endecorani.sigma_api.shared.application.pagination.PageResponse;
import com.endecorani.sigma_api.shared.domain.exception.ConflictException;
import com.endecorani.sigma_api.shared.domain.exception.ResourceNotFoundException;
import com.endecorani.sigma_api.shared.domain.repository.CrudRepository;
import com.endecorani.sigma_api.shared.util.StringUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CategoriaInsumoService extends AbstractCrudService<
        CategoriaInsumo,
        CategoriaInsumoRequest,
        CategoriaInsumoResponse,
        UUID
        > {

    private static final Set<String> SORT_FIELDS = Set.of(
            "id",
            "codigo",
            "nombre",
            "descripcion",
            "createdAt",
            "updatedAt"
    );

    private final CategoriaInsumoRepository categoriaInsumoRepository;
    private final TipoInsumoRepository tipoInsumoRepository;

    @Override
    protected CrudRepository<CategoriaInsumo, UUID> repository() {
        return categoriaInsumoRepository;
    }

    @Override
    protected Set<String> allowedSortFields() {
        return SORT_FIELDS;
    }

    @Transactional(readOnly = true)
    public PageResponse<CategoriaInsumoResponse> findByTipoInsumoId(
            UUID tipoInsumoId,
            String query,
            PageRequestDto pageRequest
    ) {
        requireTipoInsumoExists(tipoInsumoId);

        String normalized = StringUtils.normalize(query);
        var pageable = pageRequest.toPageable(allowedSortFields());

        if (normalized == null) {
            return PageResponse.from(
                    categoriaInsumoRepository.findByTipoInsumoId(
                            tipoInsumoId,
                            pageable
                    ),
                    this::toResponse
            );
        }

        return PageResponse.from(
                categoriaInsumoRepository.searchByTipoInsumoId(
                        tipoInsumoId,
                        normalized,
                        pageable
                ),
                this::toResponse
        );
    }

    @Transactional(readOnly = true)
    public PageResponse<CategoriaInsumoResponse> search(
            String query,
            PageRequestDto pageRequest
    ) {
        String normalized = StringUtils.normalize(query);

        if (normalized == null) {
            return findAll(pageRequest);
        }

        return PageResponse.from(
                categoriaInsumoRepository.search(
                        normalized,
                        pageRequest.toPageable(allowedSortFields())
                ),
                this::toResponse
        );
    }

    @Override
    protected CategoriaInsumo toDomain(CategoriaInsumoRequest request) {
        requireTipoInsumoExists(request.tipoInsumoId());
        String codigo = StringUtils.normalize(request.codigo());
        validateUniqueCodigoForCreate(request.tipoInsumoId(), codigo);

        return CategoriaInsumo.builder()
                .tipoInsumoId(request.tipoInsumoId())
                .codigo(codigo)
                .nombre(StringUtils.normalize(request.nombre()))
                .descripcion(StringUtils.normalize(request.descripcion()))
                .build();
    }

    @Override
    protected void updateDomain(
            CategoriaInsumo domain,
            CategoriaInsumoRequest request
    ) {
        requireTipoInsumoExists(request.tipoInsumoId());
        String codigo = StringUtils.normalize(request.codigo());
        validateUniqueCodigoForUpdate(
                request.tipoInsumoId(),
                codigo,
                domain.getId()
        );

        domain.setTipoInsumoId(request.tipoInsumoId());
        domain.setCodigo(codigo);
        domain.setNombre(StringUtils.normalize(request.nombre()));
        domain.setDescripcion(StringUtils.normalize(request.descripcion()));
    }

    @Override
    protected CategoriaInsumoResponse toResponse(CategoriaInsumo domain) {
        return new CategoriaInsumoResponse(
                domain.getId(),
                domain.getTipoInsumoId(),
                domain.getCodigo(),
                domain.getNombre(),
                domain.getDescripcion(),
                domain.getCreatedAt(),
                domain.getUpdatedAt(),
                domain.getCreatedBy(),
                domain.getUpdatedBy()
        );
    }

    @Override
    protected String resourceName() {
        return "Categoría de insumo";
    }

    private void requireTipoInsumoExists(UUID tipoInsumoId) {
        if (!tipoInsumoRepository.existsById(tipoInsumoId)) {
            throw new ResourceNotFoundException("Tipo de insumo", tipoInsumoId);
        }
    }

    private void validateUniqueCodigoForCreate(UUID tipoInsumoId, String codigo) {
        if (categoriaInsumoRepository.existsByTipoInsumoIdAndCodigoIgnoreCase(
                tipoInsumoId,
                codigo
        )) {
            throw new ConflictException(
                    "CATEGORIA_INSUMO_ALREADY_EXISTS",
                    "Ya existe una categoría de insumo con el código '%s' para este tipo de insumo"
                            .formatted(codigo)
            );
        }
    }

    private void validateUniqueCodigoForUpdate(
            UUID tipoInsumoId,
            String codigo,
            UUID currentId
    ) {
        if (categoriaInsumoRepository.existsByTipoInsumoIdAndCodigoIgnoreCaseAndIdNot(
                tipoInsumoId,
                codigo,
                currentId
        )) {
            throw new ConflictException(
                    "CATEGORIA_INSUMO_ALREADY_EXISTS",
                    "Ya existe otra categoría de insumo con el código '%s' para este tipo de insumo"
                            .formatted(codigo)
            );
        }
    }
}
