package com.endecorani.sigma_api.modules.inventarios.application.service;

import com.endecorani.sigma_api.modules.inventarios.application.dto.request.TipoInsumoRequest;
import com.endecorani.sigma_api.modules.inventarios.application.dto.response.TipoInsumoResponse;
import com.endecorani.sigma_api.modules.inventarios.domain.model.TipoInsumo;
import com.endecorani.sigma_api.modules.inventarios.domain.repository.TipoInsumoRepository;
import com.endecorani.sigma_api.shared.application.crud.AbstractCrudService;
import com.endecorani.sigma_api.shared.application.pagination.PageRequestDto;
import com.endecorani.sigma_api.shared.application.pagination.PageResponse;
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
public class TipoInsumoService extends AbstractCrudService<
        TipoInsumo,
        TipoInsumoRequest,
        TipoInsumoResponse,
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

    private final TipoInsumoRepository tipoInsumoRepository;

    @Override
    protected CrudRepository<TipoInsumo, UUID> repository() {
        return tipoInsumoRepository;
    }

    @Override
    protected Set<String> allowedSortFields() {
        return SORT_FIELDS;
    }

    @Transactional(readOnly = true)
    public PageResponse<TipoInsumoResponse> search(
            String query,
            PageRequestDto pageRequest
    ) {
        String normalized = StringUtils.normalize(query);

        if (normalized == null) {
            return findAll(pageRequest);
        }

        return PageResponse.from(
                tipoInsumoRepository.search(
                        normalized,
                        pageRequest.toPageable(allowedSortFields())
                ),
                this::toResponse
        );
    }

    @Override
    protected TipoInsumo toDomain(TipoInsumoRequest request) {
        String codigo = StringUtils.normalize(request.codigo());
        validateUniqueCodigoForCreate(codigo);

        return TipoInsumo.builder()
                .codigo(codigo)
                .nombre(StringUtils.normalize(request.nombre()))
                .descripcion(StringUtils.normalize(request.descripcion()))
                .build();
    }

    @Override
    protected void updateDomain(
            TipoInsumo domain,
            TipoInsumoRequest request
    ) {
        String codigo = StringUtils.normalize(request.codigo());
        validateUniqueCodigoForUpdate(codigo, domain.getId());

        domain.setCodigo(codigo);
        domain.setNombre(StringUtils.normalize(request.nombre()));
        domain.setDescripcion(StringUtils.normalize(request.descripcion()));
    }

    @Override
    protected TipoInsumoResponse toResponse(TipoInsumo domain) {
        return new TipoInsumoResponse(
                domain.getId(),
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
        return "Tipo de insumo";
    }

    private void validateUniqueCodigoForCreate(String codigo) {
        if (tipoInsumoRepository.existsByCodigoIgnoreCase(codigo)) {
            throw new ConflictException(
                    "TIPO_INSUMO_ALREADY_EXISTS",
                    "Ya existe un tipo de insumo con el código '%s'"
                            .formatted(codigo)
            );
        }
    }

    private void validateUniqueCodigoForUpdate(
            String codigo,
            UUID currentId
    ) {
        if (tipoInsumoRepository.existsByCodigoIgnoreCaseAndIdNot(
                codigo,
                currentId
        )) {
            throw new ConflictException(
                    "TIPO_INSUMO_ALREADY_EXISTS",
                    "Ya existe otro tipo de insumo con el código '%s'"
                            .formatted(codigo)
            );
        }
    }
}
