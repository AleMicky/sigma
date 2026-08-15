package com.endecorani.sigma_api.modules.inventarios.application.service;

import com.endecorani.sigma_api.modules.inventarios.application.dto.request.InsumoAtributoValorRequest;
import com.endecorani.sigma_api.modules.inventarios.application.dto.response.InsumoAtributoValorResponse;
import com.endecorani.sigma_api.modules.inventarios.domain.model.Insumo;
import com.endecorani.sigma_api.modules.inventarios.domain.model.InsumoAtributoValor;
import com.endecorani.sigma_api.modules.inventarios.domain.model.TipoInsumoAtributo;
import com.endecorani.sigma_api.modules.inventarios.domain.repository.InsumoAtributoValorRepository;
import com.endecorani.sigma_api.modules.inventarios.domain.repository.InsumoRepository;
import com.endecorani.sigma_api.modules.inventarios.domain.repository.TipoInsumoAtributoRepository;
import com.endecorani.sigma_api.modules.parametros.domain.model.TipoDato;
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

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeParseException;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class InsumoAtributoValorService extends AbstractCrudService<
        InsumoAtributoValor,
        InsumoAtributoValorRequest,
        InsumoAtributoValorResponse,
        UUID
        > {

    private static final int VALOR_MAX_LENGTH = 500;

    private static final Set<String> SORT_FIELDS = Set.of(
            "id",
            "valor",
            "createdAt",
            "updatedAt"
    );

    private final InsumoAtributoValorRepository insumoAtributoValorRepository;
    private final InsumoRepository insumoRepository;
    private final TipoInsumoAtributoRepository tipoInsumoAtributoRepository;
    private final TipoDatoRepository tipoDatoRepository;

    @Override
    protected CrudRepository<InsumoAtributoValor, UUID> repository() {
        return insumoAtributoValorRepository;
    }

    @Override
    protected Set<String> allowedSortFields() {
        return SORT_FIELDS;
    }

    @Transactional(readOnly = true)
    public PageResponse<InsumoAtributoValorResponse> findByInsumoId(
            UUID insumoId,
            PageRequestDto pageRequest
    ) {
        requireInsumo(insumoId);

        return PageResponse.from(
                insumoAtributoValorRepository.findByInsumoId(
                        insumoId,
                        pageRequest.toPageable(allowedSortFields())
                ),
                this::toResponse
        );
    }

    @Override
    protected InsumoAtributoValor toDomain(InsumoAtributoValorRequest request) {
        Insumo insumo = requireInsumo(request.insumoId());
        TipoInsumoAtributo atributo = requireAtributo(request.tipoInsumoAtributoId());
        validateUniqueForCreate(insumo.getId(), atributo.getId());

        TipoDato tipoDato = requireTipoDato(atributo.getTipoDatoId());
        String valor = normalizeAndValidateValor(
                request.valor(),
                atributo,
                tipoDato
        );

        return InsumoAtributoValor.builder()
                .insumoId(insumo.getId())
                .tipoInsumoAtributoId(atributo.getId())
                .valor(valor)
                .build();
    }

    @Override
    protected void updateDomain(
            InsumoAtributoValor domain,
            InsumoAtributoValorRequest request
    ) {
        Insumo insumo = requireInsumo(request.insumoId());
        TipoInsumoAtributo atributo = requireAtributo(request.tipoInsumoAtributoId());
        validateUniqueForUpdate(
                insumo.getId(),
                atributo.getId(),
                domain.getId()
        );

        TipoDato tipoDato = requireTipoDato(atributo.getTipoDatoId());
        String valor = normalizeAndValidateValor(
                request.valor(),
                atributo,
                tipoDato
        );

        domain.setInsumoId(insumo.getId());
        domain.setTipoInsumoAtributoId(atributo.getId());
        domain.setValor(valor);
    }

    @Override
    protected InsumoAtributoValorResponse toResponse(
            InsumoAtributoValor domain
    ) {
        return new InsumoAtributoValorResponse(
                domain.getId(),
                domain.getInsumoId(),
                domain.getTipoInsumoAtributoId(),
                domain.getValor(),
                domain.getCreatedAt(),
                domain.getUpdatedAt(),
                domain.getCreatedBy(),
                domain.getUpdatedBy()
        );
    }

    @Override
    protected String resourceName() {
        return "Valor de atributo de insumo";
    }

    private Insumo requireInsumo(UUID insumoId) {
        return insumoRepository
                .findById(insumoId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Insumo", insumoId)
                );
    }

    private TipoInsumoAtributo requireAtributo(UUID tipoInsumoAtributoId) {
        return tipoInsumoAtributoRepository
                .findById(tipoInsumoAtributoId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Atributo de tipo de insumo",
                                tipoInsumoAtributoId
                        )
                );
    }

    private TipoDato requireTipoDato(UUID tipoDatoId) {
        return tipoDatoRepository
                .findById(tipoDatoId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Tipo de dato", tipoDatoId)
                );
    }

    private void validateUniqueForCreate(
            UUID insumoId,
            UUID tipoInsumoAtributoId
    ) {
        if (insumoAtributoValorRepository
                .existsByInsumoIdAndTipoInsumoAtributoId(
                        insumoId,
                        tipoInsumoAtributoId
                )) {
            throw new ConflictException(
                    "INSUMO_ATRIBUTO_VALOR_ALREADY_EXISTS",
                    "Ya existe un valor para este atributo en el insumo seleccionado"
            );
        }
    }

    private void validateUniqueForUpdate(
            UUID insumoId,
            UUID tipoInsumoAtributoId,
            UUID currentId
    ) {
        if (insumoAtributoValorRepository
                .existsByInsumoIdAndTipoInsumoAtributoIdAndIdNot(
                        insumoId,
                        tipoInsumoAtributoId,
                        currentId
                )) {
            throw new ConflictException(
                    "INSUMO_ATRIBUTO_VALOR_ALREADY_EXISTS",
                    "Ya existe otro valor para este atributo en el insumo seleccionado"
            );
        }
    }

    private String normalizeAndValidateValor(
            String rawValor,
            TipoInsumoAtributo atributo,
            TipoDato tipoDato
    ) {
        String codigo = tipoDato.getCodigo() == null
                ? ""
                : tipoDato.getCodigo().toUpperCase(Locale.ROOT);

        String valor = switch (codigo) {
            case "TEXTAREA" -> StringUtils.trimToNull(rawValor);
            case "BOOLEAN" -> normalizeBoolean(rawValor);
            default -> StringUtils.normalize(rawValor);
        };

        boolean requerido = Boolean.TRUE.equals(atributo.getRequerido());
        if (requerido && valor == null) {
            throw new BusinessException(
                    "INSUMO_ATRIBUTO_VALOR_REQUIRED",
                    "El valor es obligatorio para el atributo '%s'"
                            .formatted(atributo.getCodigo())
            );
        }

        if (valor == null) {
            return null;
        }

        return switch (codigo) {
            case "NUMBER" -> validateNumber(valor);
            case "DECIMAL" -> validateDecimal(valor);
            case "DATE" -> validateDate(valor);
            case "DATETIME" -> validateDateTime(valor);
            case "BOOLEAN" -> valor;
            default -> requireMaxLength(valor);
        };
    }

    private String normalizeBoolean(String rawValor) {
        String trimmed = StringUtils.trimToNull(rawValor);
        if (trimmed == null) {
            return null;
        }

        String lower = trimmed.toLowerCase(Locale.ROOT);
        if ("true".equals(lower) || "false".equals(lower)) {
            return lower;
        }

        throw new BusinessException(
                "INVALID_INSUMO_ATRIBUTO_VALOR",
                "El valor booleano debe ser 'true' o 'false'"
        );
    }

    private String requireMaxLength(String valor) {
        if (valor.length() > VALOR_MAX_LENGTH) {
            throw new BusinessException(
                    "INVALID_INSUMO_ATRIBUTO_VALOR",
                    "El valor no puede superar los %d caracteres"
                            .formatted(VALOR_MAX_LENGTH)
            );
        }
        return valor;
    }

    private String validateNumber(String valor) {
        try {
            Long.parseLong(valor);
            return valor;
        } catch (NumberFormatException exception) {
            throw new BusinessException(
                    "INVALID_INSUMO_ATRIBUTO_VALOR",
                    "El valor debe ser un número entero válido"
            );
        }
    }

    private String validateDecimal(String valor) {
        try {
            new BigDecimal(valor);
            return valor;
        } catch (NumberFormatException exception) {
            throw new BusinessException(
                    "INVALID_INSUMO_ATRIBUTO_VALOR",
                    "El valor debe ser un número decimal válido"
            );
        }
    }

    private String validateDate(String valor) {
        try {
            LocalDate.parse(valor);
            return valor;
        } catch (DateTimeParseException exception) {
            throw new BusinessException(
                    "INVALID_INSUMO_ATRIBUTO_VALOR",
                    "El valor debe ser una fecha válida en formato ISO (yyyy-MM-dd)"
            );
        }
    }

    private String validateDateTime(String valor) {
        try {
            LocalDateTime.parse(valor);
            return valor;
        } catch (DateTimeParseException exception) {
            throw new BusinessException(
                    "INVALID_INSUMO_ATRIBUTO_VALOR",
                    "El valor debe ser una fecha-hora válida en formato ISO (yyyy-MM-ddTHH:mm:ss)"
            );
        }
    }
}
