package com.endecorani.sigma_api.modules.inventarios.application.service;

import com.endecorani.sigma_api.modules.inventarios.application.dto.request.InsumoRequest;
import com.endecorani.sigma_api.modules.inventarios.application.dto.response.InsumoResponse;
import com.endecorani.sigma_api.modules.inventarios.domain.model.Insumo;
import com.endecorani.sigma_api.modules.inventarios.domain.repository.InsumoRepository;
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
public class InsumoService extends AbstractCrudService<
        Insumo,
        InsumoRequest,
        InsumoResponse,
        UUID
        > {

    private static final Set<String> SORT_FIELDS = Set.of(
            "id",
            "codigo",
            "nombre",
            "descripcion",
            "marca",
            "createdAt",
            "updatedAt"
    );

    private final InsumoRepository insumoRepository;

    @Override
    protected CrudRepository<Insumo, UUID> repository() {
        return insumoRepository;
    }

    @Override
    protected Set<String> allowedSortFields() {
        return SORT_FIELDS;
    }

    @Transactional(readOnly = true)
    public PageResponse<InsumoResponse> search(
            String query,
            PageRequestDto pageRequest
    ) {
        String normalized = StringUtils.normalize(query);

        if (normalized == null) {
            return findAll(pageRequest);
        }

        return PageResponse.from(
                insumoRepository.search(
                        normalized,
                        pageRequest.toPageable(allowedSortFields())
                ),
                this::toResponse
        );
    }

    @Override
    protected Insumo toDomain(InsumoRequest request) {
        String codigo = StringUtils.normalize(request.codigo());
        validateUniqueCodigoForCreate(codigo);

        return Insumo.builder()
                .codigo(codigo)
                .nombre(StringUtils.normalize(request.nombre()))
                .descripcion(StringUtils.normalize(request.descripcion()))
                .tipoInsumoId(request.tipoInsumoId())
                .categoriaInsumoId(request.categoriaInsumoId())
                .unidadMedidaId(request.unidadMedidaId())
                .marca(StringUtils.normalize(request.marca()))
                .build();
    }

    @Override
    protected void updateDomain(
            Insumo domain,
            InsumoRequest request
    ) {
        String codigo = StringUtils.normalize(request.codigo());
        validateUniqueCodigoForUpdate(codigo, domain.getId());

        domain.setCodigo(codigo);
        domain.setNombre(StringUtils.normalize(request.nombre()));
        domain.setDescripcion(StringUtils.normalize(request.descripcion()));
        domain.setTipoInsumoId(request.tipoInsumoId());
        domain.setCategoriaInsumoId(request.categoriaInsumoId());
        domain.setUnidadMedidaId(request.unidadMedidaId());
        domain.setMarca(StringUtils.normalize(request.marca()));
    }

    @Override
    protected InsumoResponse toResponse(Insumo domain) {
        return new InsumoResponse(
                domain.getId(),
                domain.getCodigo(),
                domain.getNombre(),
                domain.getDescripcion(),
                domain.getTipoInsumoId(),
                domain.getCategoriaInsumoId(),
                domain.getUnidadMedidaId(),
                domain.getMarca(),
                domain.getCreatedAt(),
                domain.getUpdatedAt(),
                domain.getCreatedBy(),
                domain.getUpdatedBy()
        );
    }

    @Override
    protected String resourceName() {
        return "Insumo";
    }

    private void validateUniqueCodigoForCreate(String codigo) {
        if (insumoRepository.existsByCodigoIgnoreCase(codigo)) {
            throw new ConflictException(
                    "INSUMO_ALREADY_EXISTS",
                    "Ya existe un insumo con el código '%s'"
                            .formatted(codigo)
            );
        }
    }

    private void validateUniqueCodigoForUpdate(
            String codigo,
            UUID currentId
    ) {
        if (insumoRepository.existsByCodigoIgnoreCaseAndIdNot(
                codigo,
                currentId
        )) {
            throw new ConflictException(
                    "INSUMO_ALREADY_EXISTS",
                    "Ya existe otro insumo con el código '%s'"
                            .formatted(codigo)
            );
        }
    }
}
