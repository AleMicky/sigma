package com.endecorani.sigma_api.modules.activos.application.service;

import com.endecorani.sigma_api.modules.activos.application.dto.ActivoAtributoOpcionDto;
import com.endecorani.sigma_api.modules.activos.application.dto.request.ActivoAtributoValorRequest;
import com.endecorani.sigma_api.modules.activos.application.dto.response.ActivoAtributoValorResponse;
import com.endecorani.sigma_api.modules.activos.domain.model.Activo;
import com.endecorani.sigma_api.modules.activos.domain.model.ActivoAtributo;
import com.endecorani.sigma_api.modules.activos.domain.model.ActivoAtributoValor;
import com.endecorani.sigma_api.modules.activos.domain.repository.ActivoAtributoRepository;
import com.endecorani.sigma_api.modules.activos.domain.repository.ActivoAtributoValorRepository;
import com.endecorani.sigma_api.modules.activos.domain.repository.ActivoRepository;
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
import tools.jackson.core.JacksonException;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.json.JsonMapper;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeParseException;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ActivoAtributoValorService extends AbstractCrudService<
        ActivoAtributoValor,
        ActivoAtributoValorRequest,
        ActivoAtributoValorResponse,
        UUID
        > {

    private static final int TEXT_MAX_LENGTH = 255;
    private static final int TEXTAREA_MAX_LENGTH = 4000;

    private static final Set<String> SORT_FIELDS = Set.of(
            "id",
            "activoId",
            "activoAtributoId",
            "valor",
            "createdAt",
            "updatedAt"
    );

    private final ActivoAtributoValorRepository activoAtributoValorRepository;
    private final ActivoRepository activoRepository;
    private final ActivoAtributoRepository activoAtributoRepository;
    private final TipoDatoRepository tipoDatoRepository;
    private final JsonMapper jsonMapper;

    @Override
    protected CrudRepository<ActivoAtributoValor, UUID> repository() {
        return activoAtributoValorRepository;
    }

    @Override
    protected Set<String> allowedSortFields() {
        return SORT_FIELDS;
    }

    @Transactional(readOnly = true)
    public PageResponse<ActivoAtributoValorResponse> findByActivoId(
            UUID activoId,
            PageRequestDto pageRequest
    ) {
        requireActivo(activoId);

        return PageResponse.from(
                activoAtributoValorRepository.findByActivoId(
                        activoId,
                        pageRequest.toPageable(allowedSortFields())
                ),
                this::toResponse
        );
    }

    @Override
    protected ActivoAtributoValor toDomain(ActivoAtributoValorRequest request) {
        Activo activo = requireActivo(request.activoId());
        ActivoAtributo atributo = requireAtributo(request.activoAtributoId());
        validateTipoActivoMatch(activo, atributo);
        validateUniqueForCreate(activo.getId(), atributo.getId());

        TipoDato tipoDato = requireTipoDato(atributo.getTipoDatoId());
        String valor = normalizeAndValidateValor(
                request.valor(),
                atributo,
                tipoDato
        );

        return ActivoAtributoValor.builder()
                .activoId(activo.getId())
                .activoAtributoId(atributo.getId())
                .valor(valor)
                .build();
    }

    @Override
    protected void updateDomain(
            ActivoAtributoValor domain,
            ActivoAtributoValorRequest request
    ) {
        Activo activo = requireActivo(request.activoId());
        ActivoAtributo atributo = requireAtributo(request.activoAtributoId());
        validateTipoActivoMatch(activo, atributo);
        validateUniqueForUpdate(activo.getId(), atributo.getId(), domain.getId());

        TipoDato tipoDato = requireTipoDato(atributo.getTipoDatoId());
        String valor = normalizeAndValidateValor(
                request.valor(),
                atributo,
                tipoDato
        );

        domain.setActivoId(activo.getId());
        domain.setActivoAtributoId(atributo.getId());
        domain.setValor(valor);
    }

    @Override
    protected ActivoAtributoValorResponse toResponse(ActivoAtributoValor domain) {
        return new ActivoAtributoValorResponse(
                domain.getId(),
                domain.getActivoId(),
                domain.getActivoAtributoId(),
                domain.getValor(),
                domain.getCreatedAt(),
                domain.getUpdatedAt(),
                domain.getCreatedBy(),
                domain.getUpdatedBy()
        );
    }

    @Override
    protected String resourceName() {
        return "Valor de atributo de activo";
    }

    private Activo requireActivo(UUID activoId) {
        return activoRepository
                .findById(activoId)
                .orElseThrow(() -> new ResourceNotFoundException("Activo", activoId));
    }

    private ActivoAtributo requireAtributo(UUID activoAtributoId) {
        return activoAtributoRepository
                .findById(activoAtributoId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Atributo de activo",
                                activoAtributoId
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

    private void validateTipoActivoMatch(Activo activo, ActivoAtributo atributo) {
        if (!activo.getTipoActivoId().equals(atributo.getTipoActivoId())) {
            throw new BusinessException(
                    "ACTIVO_ATRIBUTO_TIPO_MISMATCH",
                    "El atributo no pertenece al tipo de activo del activo seleccionado"
            );
        }
    }

    private void validateUniqueForCreate(UUID activoId, UUID activoAtributoId) {
        if (activoAtributoValorRepository.existsByActivoIdAndActivoAtributoId(
                activoId,
                activoAtributoId
        )) {
            throw new ConflictException(
                    "ACTIVO_ATRIBUTO_VALOR_ALREADY_EXISTS",
                    "Ya existe un valor para este atributo en el activo seleccionado"
            );
        }
    }

    private void validateUniqueForUpdate(
            UUID activoId,
            UUID activoAtributoId,
            UUID currentId
    ) {
        if (activoAtributoValorRepository.existsByActivoIdAndActivoAtributoIdAndIdNot(
                activoId,
                activoAtributoId,
                currentId
        )) {
            throw new ConflictException(
                    "ACTIVO_ATRIBUTO_VALOR_ALREADY_EXISTS",
                    "Ya existe otro valor para este atributo en el activo seleccionado"
            );
        }
    }

    private String normalizeAndValidateValor(
            String rawValor,
            ActivoAtributo atributo,
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
                    "ACTIVO_ATRIBUTO_VALOR_REQUIRED",
                    "El valor es obligatorio para el atributo '%s'"
                            .formatted(atributo.getCodigo())
            );
        }

        if (valor == null) {
            return null;
        }

        return switch (codigo) {
            case "TEXT" -> requireMaxLength(valor, TEXT_MAX_LENGTH, codigo);
            case "TEXTAREA" -> requireMaxLength(valor, TEXTAREA_MAX_LENGTH, codigo);
            case "NUMBER" -> validateNumber(valor);
            case "DECIMAL" -> validateDecimal(valor);
            case "DATE" -> validateDate(valor);
            case "DATETIME" -> validateDateTime(valor);
            case "BOOLEAN" -> valor;
            case "SELECT" -> validateSelect(valor, atributo.getOpciones());
            case "MULTISELECT" -> validateMultiselect(valor, atributo.getOpciones());
            default -> requireMaxLength(valor, TEXT_MAX_LENGTH, codigo);
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
                "INVALID_ACTIVO_ATRIBUTO_VALOR",
                "El valor booleano debe ser 'true' o 'false'"
        );
    }

    private String requireMaxLength(String valor, int maxLength, String tipoCodigo) {
        if (valor.length() > maxLength) {
            throw new BusinessException(
                    "INVALID_ACTIVO_ATRIBUTO_VALOR",
                    "El valor para el tipo '%s' no puede superar los %d caracteres"
                            .formatted(tipoCodigo, maxLength)
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
                    "INVALID_ACTIVO_ATRIBUTO_VALOR",
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
                    "INVALID_ACTIVO_ATRIBUTO_VALOR",
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
                    "INVALID_ACTIVO_ATRIBUTO_VALOR",
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
                    "INVALID_ACTIVO_ATRIBUTO_VALOR",
                    "El valor debe ser una fecha-hora válida en formato ISO (yyyy-MM-ddTHH:mm:ss)"
            );
        }
    }

    private String validateSelect(String valor, String opcionesJson) {
        Set<String> allowed = optionValues(opcionesJson);
        if (!allowed.contains(valor.toLowerCase(Locale.ROOT))) {
            throw new BusinessException(
                    "INVALID_ACTIVO_ATRIBUTO_VALOR",
                    "El valor '%s' no está entre las opciones permitidas"
                            .formatted(valor)
            );
        }
        return valor;
    }

    private String validateMultiselect(String valor, String opcionesJson) {
        List<String> selected;
        try {
            selected = jsonMapper.readValue(
                    valor,
                    new TypeReference<List<String>>() {
                    }
            );
        } catch (JacksonException exception) {
            throw new BusinessException(
                    "INVALID_ACTIVO_ATRIBUTO_VALOR",
                    "El valor MULTISELECT debe ser un JSON array de strings"
            );
        }

        if (selected == null || selected.isEmpty()) {
            throw new BusinessException(
                    "INVALID_ACTIVO_ATRIBUTO_VALOR",
                    "Debe seleccionar al menos una opción"
            );
        }

        Set<String> allowed = optionValues(opcionesJson);
        Set<String> unique = new HashSet<>();
        for (String item : selected) {
            String normalized = StringUtils.normalize(item);
            if (normalized == null
                    || !allowed.contains(normalized.toLowerCase(Locale.ROOT))) {
                throw new BusinessException(
                        "INVALID_ACTIVO_ATRIBUTO_VALOR",
                        "El valor '%s' no está entre las opciones permitidas"
                                .formatted(item)
                );
            }
            if (!unique.add(normalized.toLowerCase(Locale.ROOT))) {
                throw new BusinessException(
                        "INVALID_ACTIVO_ATRIBUTO_VALOR",
                        "Las opciones seleccionadas no pueden repetirse"
                );
            }
        }

        try {
            return jsonMapper.writeValueAsString(
                    selected.stream().map(StringUtils::normalize).toList()
            );
        } catch (JacksonException exception) {
            throw new BusinessException(
                    "INVALID_ACTIVO_ATRIBUTO_VALOR",
                    "No se pudo serializar el valor MULTISELECT"
            );
        }
    }

    private Set<String> optionValues(String opcionesJson) {
        if (StringUtils.isBlank(opcionesJson)) {
            throw new BusinessException(
                    "INVALID_ACTIVO_ATRIBUTO_OPCIONES",
                    "El atributo no tiene opciones configuradas"
            );
        }

        try {
            List<ActivoAtributoOpcionDto> opciones = jsonMapper.readValue(
                    opcionesJson,
                    new TypeReference<List<ActivoAtributoOpcionDto>>() {
                    }
            );

            Set<String> values = new HashSet<>();
            for (ActivoAtributoOpcionDto opcion : opciones) {
                if (opcion != null && opcion.value() != null) {
                    values.add(opcion.value().toLowerCase(Locale.ROOT));
                }
            }
            return values;
        } catch (JacksonException exception) {
            throw new BusinessException(
                    "INVALID_ACTIVO_ATRIBUTO_OPCIONES",
                    "Las opciones almacenadas no son un JSON válido"
            );
        }
    }
}
