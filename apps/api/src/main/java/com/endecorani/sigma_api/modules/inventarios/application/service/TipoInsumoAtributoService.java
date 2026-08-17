package com.endecorani.sigma_api.modules.inventarios.application.service;

import com.endecorani.sigma_api.modules.inventarios.application.dto.request.TipoInsumoAtributoRequest;
import com.endecorani.sigma_api.modules.inventarios.application.dto.response.TipoInsumoAtributoResponse;
import com.endecorani.sigma_api.modules.inventarios.domain.model.TipoInsumoAtributo;
import com.endecorani.sigma_api.modules.inventarios.domain.repository.TipoInsumoAtributoRepository;
import com.endecorani.sigma_api.modules.inventarios.domain.repository.TipoInsumoRepository;
import com.endecorani.sigma_api.modules.parametros.domain.repository.TipoDatoRepository;
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
public class TipoInsumoAtributoService extends AbstractCrudService<
        TipoInsumoAtributo,
        TipoInsumoAtributoRequest,
        TipoInsumoAtributoResponse,
        UUID
        > {

    private static final int CODIGO_MIN_LENGTH = 2;
    private static final int CODIGO_MAX_LENGTH = 50;
    private static final int NOMBRE_MIN_LENGTH = 2;
    private static final int NOMBRE_MAX_LENGTH = 100;

    private static final Set<String> SORT_FIELDS = Set.of(
            "id",
            "codigo",
            "nombre",
            "requerido",
            "orden",
            "createdAt",
            "updatedAt"
    );

    private final TipoInsumoAtributoRepository tipoInsumoAtributoRepository;
    private final TipoInsumoRepository tipoInsumoRepository;
    private final TipoDatoRepository tipoDatoRepository;

    @Override
    protected CrudRepository<TipoInsumoAtributo, UUID> repository() {
        return tipoInsumoAtributoRepository;
    }

    @Override
    protected Set<String> allowedSortFields() {
        return SORT_FIELDS;
    }

    @Transactional(readOnly = true)
    public PageResponse<TipoInsumoAtributoResponse> findByTipoInsumoId(
            UUID tipoInsumoId,
            String query,
            PageRequestDto pageRequest
    ) {
        requireTipoInsumoExists(tipoInsumoId);

        String normalized = StringUtils.normalize(query);
        var pageable = pageRequest.toPageable(allowedSortFields());

        if (normalized == null) {
            return PageResponse.from(
                    tipoInsumoAtributoRepository.findByTipoInsumoId(
                            tipoInsumoId,
                            pageable
                    ),
                    this::toResponse
            );
        }

        return PageResponse.from(
                tipoInsumoAtributoRepository.searchByTipoInsumoId(
                        tipoInsumoId,
                        normalized,
                        pageable
                ),
                this::toResponse
        );
    }

    @Override
    protected TipoInsumoAtributo toDomain(TipoInsumoAtributoRequest request) {
        requireTipoInsumoExists(request.tipoInsumoId());
        requireTipoDato(request.tipoDatoId());

        String codigo = requireNormalizedCodigo(request.codigo());
        validateUniqueCodigoForCreate(request.tipoInsumoId(), codigo);

        return TipoInsumoAtributo.builder()
                .tipoDatoId(request.tipoDatoId())
                .tipoInsumoId(request.tipoInsumoId())
                .codigo(codigo)
                .nombre(requireNormalizedNombre(request.nombre()))
                .requerido(defaultIfNull(request.requerido(), false))
                .orden(resolveOrdenForCreate(
                        request.tipoInsumoId(),
                        request.orden()
                ))
                .opciones(StringUtils.normalize(request.opciones()))
                .build();
    }

    @Override
    protected void updateDomain(
            TipoInsumoAtributo domain,
            TipoInsumoAtributoRequest request
    ) {
        requireTipoInsumoExists(request.tipoInsumoId());
        requireTipoDato(request.tipoDatoId());

        String codigo = requireNormalizedCodigo(request.codigo());
        validateUniqueCodigoForUpdate(
                request.tipoInsumoId(),
                codigo,
                domain.getId()
        );

        int orden = resolveOrdenForUpdate(
                request.tipoInsumoId(),
                request.orden(),
                domain.getId()
        );

        domain.setTipoDatoId(request.tipoDatoId());
        domain.setTipoInsumoId(request.tipoInsumoId());
        domain.setCodigo(codigo);
        domain.setNombre(requireNormalizedNombre(request.nombre()));
        domain.setRequerido(defaultIfNull(request.requerido(), false));
        domain.setOrden(orden);
        domain.setOpciones(StringUtils.normalize(request.opciones()));
    }

    @Override
    protected TipoInsumoAtributoResponse toResponse(TipoInsumoAtributo domain) {
        return new TipoInsumoAtributoResponse(
                domain.getId(),
                domain.getTipoDatoId(),
                domain.getTipoInsumoId(),
                domain.getCodigo(),
                domain.getNombre(),
                domain.getRequerido(),
                domain.getOrden(),
                domain.getOpciones(),
                domain.getCreatedAt(),
                domain.getUpdatedAt(),
                domain.getCreatedBy(),
                domain.getUpdatedBy()
        );
    }

    @Override
    protected String resourceName() {
        return "Atributo de tipo de insumo";
    }

    private void requireTipoInsumoExists(UUID tipoInsumoId) {
        if (!tipoInsumoRepository.existsById(tipoInsumoId)) {
            throw new ResourceNotFoundException("Tipo de insumo", tipoInsumoId);
        }
    }

    private void requireTipoDato(UUID tipoDatoId) {
        if (!tipoDatoRepository.existsById(tipoDatoId)) {
            throw new ResourceNotFoundException("Tipo de dato", tipoDatoId);
        }
    }

    private void validateUniqueCodigoForCreate(
            UUID tipoInsumoId,
            String codigo
    ) {
        if (tipoInsumoAtributoRepository.existsByTipoInsumoIdAndCodigoIgnoreCase(
                tipoInsumoId,
                codigo
        )) {
            throw new ConflictException(
                    "TIPO_INSUMO_ATRIBUTO_ALREADY_EXISTS",
                    "Ya existe un atributo con el código '%s' en este tipo de insumo"
                            .formatted(codigo)
            );
        }
    }

    private void validateUniqueCodigoForUpdate(
            UUID tipoInsumoId,
            String codigo,
            UUID currentId
    ) {
        if (tipoInsumoAtributoRepository
                .existsByTipoInsumoIdAndCodigoIgnoreCaseAndIdNot(
                        tipoInsumoId,
                        codigo,
                        currentId
                )) {
            throw new ConflictException(
                    "TIPO_INSUMO_ATRIBUTO_ALREADY_EXISTS",
                    "Ya existe otro atributo con el código '%s' en este tipo de insumo"
                            .formatted(codigo)
            );
        }
    }

    private String requireNormalizedCodigo(String value) {
        String normalized = StringUtils.normalize(value);

        if (normalized == null
                || normalized.length() < CODIGO_MIN_LENGTH
                || normalized.length() > CODIGO_MAX_LENGTH) {
            throw new BusinessException(
                    "INVALID_TIPO_INSUMO_ATRIBUTO_CODIGO",
                    "El código debe tener entre %d y %d caracteres"
                            .formatted(CODIGO_MIN_LENGTH, CODIGO_MAX_LENGTH)
            );
        }

        return normalized;
    }

    private String requireNormalizedNombre(String value) {
        String normalized = StringUtils.normalize(value);

        if (normalized == null
                || normalized.length() < NOMBRE_MIN_LENGTH
                || normalized.length() > NOMBRE_MAX_LENGTH) {
            throw new BusinessException(
                    "INVALID_TIPO_INSUMO_ATRIBUTO_NOMBRE",
                    "El nombre debe tener entre %d y %d caracteres"
                            .formatted(NOMBRE_MIN_LENGTH, NOMBRE_MAX_LENGTH)
            );
        }

        return normalized;
    }

    private int resolveOrdenForCreate(UUID tipoInsumoId, Integer orden) {
        if (orden == null) {
            Integer maxOrden = tipoInsumoAtributoRepository
                    .findMaxOrdenByTipoInsumoId(tipoInsumoId);
            return maxOrden == null ? 0 : maxOrden + 1;
        }

        if (orden < 0) {
            throw new BusinessException(
                    "INVALID_TIPO_INSUMO_ATRIBUTO_ORDEN",
                    "El orden no puede ser negativo"
            );
        }

        validateUniqueOrdenForCreate(tipoInsumoId, orden);
        return orden;
    }

    private int resolveOrdenForUpdate(
            UUID tipoInsumoId,
            Integer orden,
            UUID currentId
    ) {
        int resolved = orden == null ? 0 : orden;

        if (resolved < 0) {
            throw new BusinessException(
                    "INVALID_TIPO_INSUMO_ATRIBUTO_ORDEN",
                    "El orden no puede ser negativo"
            );
        }

        validateUniqueOrdenForUpdate(tipoInsumoId, resolved, currentId);
        return resolved;
    }

    private void validateUniqueOrdenForCreate(
            UUID tipoInsumoId,
            int orden
    ) {
        if (tipoInsumoAtributoRepository.existsByTipoInsumoIdAndOrden(
                tipoInsumoId,
                orden
        )) {
            throw new ConflictException(
                    "TIPO_INSUMO_ATRIBUTO_ORDEN_ALREADY_EXISTS",
                    "Ya existe un atributo con el orden '%d' en este tipo de insumo"
                            .formatted(orden)
            );
        }
    }

    private void validateUniqueOrdenForUpdate(
            UUID tipoInsumoId,
            int orden,
            UUID currentId
    ) {
        if (tipoInsumoAtributoRepository.existsByTipoInsumoIdAndOrdenAndIdNot(
                tipoInsumoId,
                orden,
                currentId
        )) {
            throw new ConflictException(
                    "TIPO_INSUMO_ATRIBUTO_ORDEN_ALREADY_EXISTS",
                    "Ya existe otro atributo con el orden '%d' en este tipo de insumo"
                            .formatted(orden)
            );
        }
    }

    private static boolean defaultIfNull(Boolean value, boolean defaultValue) {
        return value == null ? defaultValue : value;
    }
}
