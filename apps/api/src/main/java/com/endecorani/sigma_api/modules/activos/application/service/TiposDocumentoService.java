package com.endecorani.sigma_api.modules.activos.application.service;

import com.endecorani.sigma_api.modules.activos.application.dto.request.TiposDocumentoRequest;
import com.endecorani.sigma_api.modules.activos.application.dto.response.TiposDocumentoResponse;
import com.endecorani.sigma_api.modules.activos.domain.model.TiposDocumento;
import com.endecorani.sigma_api.modules.activos.domain.repository.TiposDocumentoRepository;
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
public class TiposDocumentoService extends AbstractCrudService<
        TiposDocumento,
        TiposDocumentoRequest,
        TiposDocumentoResponse,
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

    private final TiposDocumentoRepository tiposDocumentoRepository;

    @Override
    protected CrudRepository<TiposDocumento, UUID> repository() {
        return tiposDocumentoRepository;
    }

    @Override
    protected Set<String> allowedSortFields() {
        return SORT_FIELDS;
    }

    @Transactional(readOnly = true)
    public PageResponse<TiposDocumentoResponse> search(
            String query,
            PageRequestDto pageRequest
    ) {
        String normalized = StringUtils.normalize(query);

        if (normalized == null) {
            return findAll(pageRequest);
        }

        return PageResponse.from(
                tiposDocumentoRepository.search(
                        normalized,
                        pageRequest.toPageable(allowedSortFields())
                ),
                this::toResponse
        );
    }

    @Override
    protected TiposDocumento toDomain(TiposDocumentoRequest request) {
        String codigo = StringUtils.normalize(request.codigo());
        validateUniqueCodigoForCreate(codigo);

        return TiposDocumento.builder()
                .codigo(codigo)
                .nombre(StringUtils.normalize(request.nombre()))
                .descripcion(StringUtils.normalize(request.descripcion()))
                .requiereVencimiento(request.requiereVencimiento() != null
                        ? request.requiereVencimiento()
                        : Boolean.FALSE)
                .build();
    }

    @Override
    protected void updateDomain(
            TiposDocumento domain,
            TiposDocumentoRequest request
    ) {
        String codigo = StringUtils.normalize(request.codigo());
        validateUniqueCodigoForUpdate(codigo, domain.getId());

        domain.setCodigo(codigo);
        domain.setNombre(StringUtils.normalize(request.nombre()));
        domain.setDescripcion(StringUtils.normalize(request.descripcion()));
        domain.setRequiereVencimiento(request.requiereVencimiento() != null
                ? request.requiereVencimiento()
                : Boolean.FALSE);
    }

    @Override
    protected TiposDocumentoResponse toResponse(TiposDocumento domain) {
        return new TiposDocumentoResponse(
                domain.getId(),
                domain.getCodigo(),
                domain.getNombre(),
                domain.getDescripcion(),
                domain.getRequiereVencimiento(),
                domain.getCreatedAt(),
                domain.getUpdatedAt(),
                domain.getCreatedBy(),
                domain.getUpdatedBy()
        );
    }

    @Override
    protected String resourceName() {
        return "Tipo de documento";
    }

    private void validateUniqueCodigoForCreate(String codigo) {
        if (tiposDocumentoRepository.existsByCodigoIgnoreCase(codigo)) {
            throw new ConflictException(
                    "TIPO_DOCUMENTO_ALREADY_EXISTS",
                    "Ya existe un tipo de documento con el código '%s'"
                            .formatted(codigo)
            );
        }
    }

    private void validateUniqueCodigoForUpdate(
            String codigo,
            UUID currentId
    ) {
        if (tiposDocumentoRepository.existsByCodigoIgnoreCaseAndIdNot(
                codigo,
                currentId
        )) {
            throw new ConflictException(
                    "TIPO_DOCUMENTO_ALREADY_EXISTS",
                    "Ya existe otro tipo de documento con el código '%s'"
                            .formatted(codigo)
            );
        }
    }
}
