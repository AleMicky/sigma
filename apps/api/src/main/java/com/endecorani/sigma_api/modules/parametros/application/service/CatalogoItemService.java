package com.endecorani.sigma_api.modules.parametros.application.service;

import com.endecorani.sigma_api.modules.parametros.application.dto.CatalogoItemRequest;
import com.endecorani.sigma_api.modules.parametros.application.dto.CatalogoItemResponse;
import com.endecorani.sigma_api.modules.parametros.domain.model.CatalogoItem;
import com.endecorani.sigma_api.modules.parametros.domain.repository.CatalogoItemRepository;
import com.endecorani.sigma_api.modules.parametros.domain.repository.CatalogoRepository;
import com.endecorani.sigma_api.shared.application.crud.AbstractCrudService;
import com.endecorani.sigma_api.shared.application.pagination.PageRequestDto;
import com.endecorani.sigma_api.shared.application.pagination.PageResponse;
import com.endecorani.sigma_api.shared.domain.exception.BusinessException;
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
public class CatalogoItemService extends AbstractCrudService<
        CatalogoItem,
        CatalogoItemRequest,
        CatalogoItemResponse,
        UUID
        > {

    private static final int NOMBRE_MIN_LENGTH = 2;
    private static final int NOMBRE_MAX_LENGTH = 100;
    private static final int VALOR_MIN_LENGTH = 1;
    private static final int VALOR_MAX_LENGTH = 50;

    private static final Set<String> SORT_FIELDS = Set.of(
            "id",
            "nombre",
            "valor",
            "orden",
            "createdAt",
            "updatedAt"
    );

    private final CatalogoItemRepository catalogoItemRepository;
    private final CatalogoRepository catalogoRepository;

    @Override
    protected CrudRepository<CatalogoItem, UUID> repository() {
        return catalogoItemRepository;
    }

    @Override
    protected Set<String> allowedSortFields() {
        return SORT_FIELDS;
    }

    @Transactional(readOnly = true)
    public PageResponse<CatalogoItemResponse> findByCatalogoId(
            UUID catalogoId,
            PageRequestDto pageRequest
    ) {
        requireCatalogoExists(catalogoId);

        return PageResponse.from(
                catalogoItemRepository.findByCatalogoId(
                        catalogoId,
                        pageRequest.toPageable(allowedSortFields())
                ),
                this::toResponse
        );
    }

    @Override
    protected CatalogoItem toDomain(CatalogoItemRequest request) {
        requireCatalogoExists(request.catalogoId());

        String valor = requireNormalizedValor(request.valor());
        validateUniqueValorForCreate(request.catalogoId(), valor);

        return CatalogoItem.builder()
                .catalogoId(request.catalogoId())
                .nombre(requireNormalizedNombre(request.nombre()))
                .valor(valor)
                .orden(resolveOrden(request.orden()))
                .build();
    }

    @Override
    protected void updateDomain(
            CatalogoItem domain,
            CatalogoItemRequest request
    ) {
        requireCatalogoExists(request.catalogoId());

        String valor = requireNormalizedValor(request.valor());
        validateUniqueValorForUpdate(
                request.catalogoId(),
                valor,
                domain.getId()
        );

        domain.setCatalogoId(request.catalogoId());
        domain.setNombre(requireNormalizedNombre(request.nombre()));
        domain.setValor(valor);
        domain.setOrden(resolveOrden(request.orden()));
    }

    @Override
    protected CatalogoItemResponse toResponse(CatalogoItem domain) {
        return new CatalogoItemResponse(
                domain.getId(),
                domain.getCatalogoId(),
                domain.getNombre(),
                domain.getValor(),
                domain.getOrden(),
                domain.getCreatedAt(),
                domain.getUpdatedAt(),
                domain.getCreatedBy(),
                domain.getUpdatedBy()
        );
    }

    @Override
    protected String resourceName() {
        return "Ítem de catálogo";
    }

    private void requireCatalogoExists(UUID catalogoId) {
        if (!catalogoRepository.existsById(catalogoId)) {
            throw new ResourceNotFoundException("Catálogo", catalogoId);
        }
    }

    private void validateUniqueValorForCreate(
            UUID catalogoId,
            String valor
    ) {
        if (catalogoItemRepository.existsByCatalogoIdAndValorIgnoreCase(
                catalogoId,
                valor
        )) {
            throw new ConflictException(
                    "CATALOGO_ITEM_ALREADY_EXISTS",
                    "Ya existe un ítem con el valor '%s' en este catálogo"
                            .formatted(valor)
            );
        }
    }

    private void validateUniqueValorForUpdate(
            UUID catalogoId,
            String valor,
            UUID currentId
    ) {
        if (catalogoItemRepository.existsByCatalogoIdAndValorIgnoreCaseAndIdNot(
                catalogoId,
                valor,
                currentId
        )) {
            throw new ConflictException(
                    "CATALOGO_ITEM_ALREADY_EXISTS",
                    "Ya existe otro ítem con el valor '%s' en este catálogo"
                            .formatted(valor)
            );
        }
    }

    private String requireNormalizedNombre(String value) {
        String normalized = StringUtils.normalize(value);

        if (normalized == null
                || normalized.length() < NOMBRE_MIN_LENGTH
                || normalized.length() > NOMBRE_MAX_LENGTH) {
            throw new BusinessException(
                    "INVALID_CATALOGO_ITEM_NOMBRE",
                    "El nombre debe tener entre %d y %d caracteres"
                            .formatted(NOMBRE_MIN_LENGTH, NOMBRE_MAX_LENGTH)
            );
        }

        return normalized;
    }

    private String requireNormalizedValor(String value) {
        String normalized = StringUtils.normalize(value);

        if (normalized == null
                || normalized.length() < VALOR_MIN_LENGTH
                || normalized.length() > VALOR_MAX_LENGTH) {
            throw new BusinessException(
                    "INVALID_CATALOGO_ITEM_VALOR",
                    "El valor debe tener entre %d y %d caracteres"
                            .formatted(VALOR_MIN_LENGTH, VALOR_MAX_LENGTH)
            );
        }

        return normalized;
    }

    private int resolveOrden(Integer orden) {
        return orden == null ? 0 : orden;
    }
}
