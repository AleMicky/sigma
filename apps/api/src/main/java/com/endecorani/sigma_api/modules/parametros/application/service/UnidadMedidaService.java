package com.endecorani.sigma_api.modules.parametros.application.service;

import com.endecorani.sigma_api.modules.parametros.application.dto.request.UnidadMedidaRequest;
import com.endecorani.sigma_api.modules.parametros.application.dto.response.UnidadMedidaResponse;
import com.endecorani.sigma_api.modules.parametros.domain.model.UnidadMedida;
import com.endecorani.sigma_api.modules.parametros.domain.repository.UnidadMedidaRepository;
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
public class UnidadMedidaService extends AbstractCrudService<
        UnidadMedida,
        UnidadMedidaRequest,
        UnidadMedidaResponse,
        UUID
        > {

    private static final int CODIGO_MIN_LENGTH = 2;
    private static final int CODIGO_MAX_LENGTH = 50;
    private static final int NOMBRE_MIN_LENGTH = 2;
    private static final int NOMBRE_MAX_LENGTH = 100;
    private static final int SIMBOLO_MIN_LENGTH = 1;
    private static final int SIMBOLO_MAX_LENGTH = 20;

    private static final Set<String> SORT_FIELDS = Set.of(
            "id",
            "codigo",
            "nombre",
            "simbolo",
            "permiteDecimal",
            "createdAt",
            "updatedAt"
    );

    private final UnidadMedidaRepository unidadMedidaRepository;

    @Override
    protected CrudRepository<UnidadMedida, UUID> repository() {
        return unidadMedidaRepository;
    }

    @Override
    protected Set<String> allowedSortFields() {
        return SORT_FIELDS;
    }

    @Transactional(readOnly = true)
    public PageResponse<UnidadMedidaResponse> search(
            String query,
            PageRequestDto pageRequest
    ) {
        String normalized = StringUtils.normalize(query);

        if (normalized == null) {
            return findAll(pageRequest);
        }

        return PageResponse.from(
                unidadMedidaRepository.search(
                        normalized,
                        pageRequest.toPageable(allowedSortFields())
                ),
                this::toResponse
        );
    }

    @Override
    protected UnidadMedida toDomain(UnidadMedidaRequest request) {
        String codigo = requireNormalizedCodigo(request.codigo());
        validateUniqueCodigoForCreate(codigo);

        return UnidadMedida.builder()
                .codigo(codigo)
                .nombre(requireNormalizedNombre(request.nombre()))
                .simbolo(requireNormalizedSimbolo(request.simbolo()))
                .permiteDecimal(requirePermiteDecimal(request.permiteDecimal()))
                .build();
    }

    @Override
    protected void updateDomain(
            UnidadMedida domain,
            UnidadMedidaRequest request
    ) {
        rejectCodigoChange(domain.getCodigo(), request.codigo());

        domain.setNombre(requireNormalizedNombre(request.nombre()));
        domain.setSimbolo(requireNormalizedSimbolo(request.simbolo()));
        domain.setPermiteDecimal(requirePermiteDecimal(request.permiteDecimal()));
    }

    @Override
    protected UnidadMedidaResponse toResponse(UnidadMedida domain) {
        return new UnidadMedidaResponse(
                domain.getId(),
                domain.getCodigo(),
                domain.getNombre(),
                domain.getSimbolo(),
                domain.getPermiteDecimal(),
                domain.getCreatedAt(),
                domain.getUpdatedAt(),
                domain.getCreatedBy(),
                domain.getUpdatedBy()
        );
    }

    @Override
    protected String resourceName() {
        return "Unidad de medida";
    }

    private void validateUniqueCodigoForCreate(String codigo) {
        if (unidadMedidaRepository.existsByCodigoIgnoreCase(codigo)) {
            throw new ConflictException(
                    "UNIDAD_MEDIDA_ALREADY_EXISTS",
                    "Ya existe una unidad de medida con el código '%s'"
                            .formatted(codigo)
            );
        }
    }

    private void rejectCodigoChange(String currentCodigo, String requestedCodigo) {
        String normalized = StringUtils.normalize(requestedCodigo);

        if (normalized == null || !normalized.equalsIgnoreCase(currentCodigo)) {
            throw new BusinessException(
                    "UNIDAD_MEDIDA_CODIGO_IMMUTABLE",
                    "El código de la unidad de medida no se puede modificar"
            );
        }
    }

    private String requireNormalizedCodigo(String value) {
        String normalized = StringUtils.normalize(value);

        if (normalized == null
                || normalized.length() < CODIGO_MIN_LENGTH
                || normalized.length() > CODIGO_MAX_LENGTH) {
            throw new BusinessException(
                    "INVALID_UNIDAD_MEDIDA_CODIGO",
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
                    "INVALID_UNIDAD_MEDIDA_NOMBRE",
                    "El nombre debe tener entre %d y %d caracteres"
                            .formatted(NOMBRE_MIN_LENGTH, NOMBRE_MAX_LENGTH)
            );
        }

        return normalized;
    }

    private String requireNormalizedSimbolo(String value) {
        String normalized = StringUtils.normalize(value);

        if (normalized == null
                || normalized.length() < SIMBOLO_MIN_LENGTH
                || normalized.length() > SIMBOLO_MAX_LENGTH) {
            throw new BusinessException(
                    "INVALID_UNIDAD_MEDIDA_SIMBOLO",
                    "El símbolo debe tener entre %d y %d caracteres"
                            .formatted(SIMBOLO_MIN_LENGTH, SIMBOLO_MAX_LENGTH)
            );
        }

        return normalized;
    }

    private Boolean requirePermiteDecimal(Boolean value) {
        if (value == null) {
            throw new BusinessException(
                    "INVALID_UNIDAD_MEDIDA_PERMITE_DECIMAL",
                    "El indicador de decimales es obligatorio"
            );
        }

        return value;
    }
}
