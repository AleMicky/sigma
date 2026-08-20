package com.endecorani.sigma_api.modules.parametros.application.service;

import com.endecorani.sigma_api.modules.parametros.application.dto.request.TipoDatoRequest;
import com.endecorani.sigma_api.modules.parametros.application.dto.response.TipoDatoResponse;
import com.endecorani.sigma_api.modules.parametros.domain.model.TipoDato;
import com.endecorani.sigma_api.modules.parametros.domain.repository.TipoDatoRepository;
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
public class TipoDatoService extends AbstractCrudService<
        TipoDato,
        TipoDatoRequest,
        TipoDatoResponse,
        UUID
        > {

    private static final int CODIGO_MIN_LENGTH = 2;
    private static final int CODIGO_MAX_LENGTH = 50;
    private static final int NOMBRE_MIN_LENGTH = 2;
    private static final int NOMBRE_MAX_LENGTH = 100;
    private static final int DESCRIPCION_MAX_LENGTH = 255;

    private static final Set<String> SORT_FIELDS = Set.of(
            "id",
            "codigo",
            "nombre",
            "permiteOpciones",
            "createdAt",
            "updatedAt"
    );

    private final TipoDatoRepository tipoDatoRepository;

    @Override
    protected CrudRepository<TipoDato, UUID> repository() {
        return tipoDatoRepository;
    }

    @Override
    protected Set<String> allowedSortFields() {
        return SORT_FIELDS;
    }

    @Transactional(readOnly = true)
    public PageResponse<TipoDatoResponse> search(
            String query,
            PageRequestDto pageRequest
    ) {
        String normalized = StringUtils.normalize(query);

        if (normalized == null) {
            return findAll(pageRequest);
        }

        return PageResponse.from(
                tipoDatoRepository.search(
                        normalized,
                        pageRequest.toPageable(allowedSortFields())
                ),
                this::toResponse
        );
    }

    @Override
    protected TipoDato toDomain(TipoDatoRequest request) {
        String codigo = requireNormalizedCodigo(request.codigo());
        validateUniqueCodigoForCreate(codigo);

        return TipoDato.builder()
                .codigo(codigo)
                .nombre(requireNormalizedNombre(request.nombre()))
                .descripcion(normalizeDescripcion(request.descripcion()))
                .permiteOpciones(requirePermiteOpciones(request.permiteOpciones()))
                .build();
    }

    @Override
    protected void updateDomain(
            TipoDato domain,
            TipoDatoRequest request
    ) {
        rejectCodigoChange(domain.getCodigo(), request.codigo());

        domain.setNombre(requireNormalizedNombre(request.nombre()));
        domain.setDescripcion(normalizeDescripcion(request.descripcion()));
        domain.setPermiteOpciones(requirePermiteOpciones(request.permiteOpciones()));
    }

    @Override
    protected TipoDatoResponse toResponse(TipoDato domain) {
        return new TipoDatoResponse(
                domain.getId(),
                domain.getCodigo(),
                domain.getNombre(),
                domain.getDescripcion(),
                domain.getPermiteOpciones(),
                domain.getCreatedAt(),
                domain.getUpdatedAt(),
                domain.getCreatedBy(),
                domain.getUpdatedBy()
        );
    }

    @Override
    protected String resourceName() {
        return "Tipo de dato";
    }

    private void validateUniqueCodigoForCreate(String codigo) {
        if (tipoDatoRepository.existsByCodigoIgnoreCase(codigo)) {
            throw new ConflictException(
                    "TIPO_DATO_ALREADY_EXISTS",
                    "Ya existe un tipo de dato con el código '%s'"
                            .formatted(codigo)
            );
        }
    }

    private void rejectCodigoChange(String currentCodigo, String requestedCodigo) {
        String normalized = StringUtils.normalize(requestedCodigo);

        if (normalized == null || !normalized.equalsIgnoreCase(currentCodigo)) {
            throw new BusinessException(
                    "TIPO_DATO_CODIGO_IMMUTABLE",
                    "El código del tipo de dato no se puede modificar"
            );
        }
    }

    private String requireNormalizedCodigo(String value) {
        String normalized = StringUtils.normalize(value);

        if (normalized == null
                || normalized.length() < CODIGO_MIN_LENGTH
                || normalized.length() > CODIGO_MAX_LENGTH) {
            throw new BusinessException(
                    "INVALID_TIPO_DATO_CODIGO",
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
                    "INVALID_TIPO_DATO_NOMBRE",
                    "El nombre debe tener entre %d y %d caracteres"
                            .formatted(NOMBRE_MIN_LENGTH, NOMBRE_MAX_LENGTH)
            );
        }

        return normalized;
    }

    private String normalizeDescripcion(String value) {
        String normalized = StringUtils.normalize(value);

        if (normalized != null && normalized.length() > DESCRIPCION_MAX_LENGTH) {
            throw new BusinessException(
                    "INVALID_TIPO_DATO_DESCRIPCION",
                    "La descripción no puede superar los %d caracteres"
                            .formatted(DESCRIPCION_MAX_LENGTH)
            );
        }

        return normalized;
    }

    private Boolean requirePermiteOpciones(Boolean value) {
        if (value == null) {
            throw new BusinessException(
                    "INVALID_TIPO_DATO_PERMITE_OPCIONES",
                    "El indicador de opciones es obligatorio"
            );
        }

        return value;
    }
}
