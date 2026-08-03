package com.endecorani.sigma_api.modules.activos.application.service;

import com.endecorani.sigma_api.modules.activos.application.dto.ActivoAtributoOpcionDto;
import com.endecorani.sigma_api.modules.activos.application.dto.ActivoAtributoRequest;
import com.endecorani.sigma_api.modules.activos.application.dto.ActivoAtributoResponse;
import com.endecorani.sigma_api.modules.activos.domain.model.ActivoAtributo;
import com.endecorani.sigma_api.modules.activos.domain.repository.ActivoAtributoRepository;
import com.endecorani.sigma_api.modules.activos.domain.repository.TipoActivoRepository;
import com.endecorani.sigma_api.modules.parametros.domain.model.TipoDato;
import com.endecorani.sigma_api.modules.parametros.domain.repository.TipoDatoRepository;
import com.endecorani.sigma_api.shared.application.crud.AbstractCrudService;
import com.endecorani.sigma_api.shared.application.pagination.PageRequestDto;
import com.endecorani.sigma_api.shared.application.pagination.PageResponse;
import com.endecorani.sigma_api.shared.application.storage.ImageStorageService;
import com.endecorani.sigma_api.shared.domain.exception.BusinessException;
import com.endecorani.sigma_api.shared.domain.exception.ConflictException;
import com.endecorani.sigma_api.shared.domain.exception.ResourceNotFoundException;
import com.endecorani.sigma_api.shared.domain.repository.CrudRepository;
import com.endecorani.sigma_api.shared.util.StringUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import tools.jackson.core.JacksonException;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.json.JsonMapper;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ActivoAtributoService extends AbstractCrudService<
        ActivoAtributo,
        ActivoAtributoRequest,
        ActivoAtributoResponse,
        UUID
        > {

    private static final String IMAGE_FOLDER = "activo-atributos";
    private static final int CODIGO_MIN_LENGTH = 2;
    private static final int CODIGO_MAX_LENGTH = 50;
    private static final int ETIQUETA_MIN_LENGTH = 2;
    private static final int ETIQUETA_MAX_LENGTH = 100;
    private static final int DESCRIPCION_MAX_LENGTH = 255;
    private static final int VALOR_DEFECTO_MAX_LENGTH = 255;
    private static final int OPCION_FIELD_MAX_LENGTH = 100;

    private static final Set<String> SORT_FIELDS = Set.of(
            "id",
            "codigo",
            "etiqueta",
            "orden",
            "requerido",
            "visible",
            "editable",
            "createdAt",
            "updatedAt"
    );

    private final ActivoAtributoRepository activoAtributoRepository;
    private final TipoActivoRepository tipoActivoRepository;
    private final TipoDatoRepository tipoDatoRepository;
    private final JsonMapper jsonMapper;
    private final ImageStorageService imageStorageService;

    @Override
    protected CrudRepository<ActivoAtributo, UUID> repository() {
        return activoAtributoRepository;
    }

    @Override
    protected Set<String> allowedSortFields() {
        return SORT_FIELDS;
    }

    @Transactional(readOnly = true)
    public PageResponse<ActivoAtributoResponse> findByTipoActivoId(
            UUID tipoActivoId,
            String query,
            PageRequestDto pageRequest
    ) {
        requireTipoActivoExists(tipoActivoId);

        String normalized = StringUtils.normalize(query);
        var pageable = pageRequest.toPageable(allowedSortFields());

        if (normalized == null) {
            return PageResponse.from(
                    activoAtributoRepository.findByTipoActivoId(
                            tipoActivoId,
                            pageable
                    ),
                    this::toResponse
            );
        }

        return PageResponse.from(
                activoAtributoRepository.searchByTipoActivoId(
                        tipoActivoId,
                        normalized,
                        pageable
                ),
                this::toResponse
        );
    }

    @Override
    protected ActivoAtributo toDomain(ActivoAtributoRequest request) {
        requireTipoActivoExists(request.tipoActivoId());
        TipoDato tipoDato = requireTipoDato(request.tipoDatoId());

        String codigo = requireNormalizedCodigo(request.codigo());
        validateUniqueCodigoForCreate(request.tipoActivoId(), codigo);

        return ActivoAtributo.builder()
                .tipoActivoId(request.tipoActivoId())
                .codigo(codigo)
                .etiqueta(requireNormalizedEtiqueta(request.etiqueta()))
                .descripcion(normalizeDescripcion(request.descripcion()))
                .tipoDatoId(tipoDato.getId())
                .orden(resolveOrdenForCreate(
                        request.tipoActivoId(),
                        request.orden()
                ))
                .requerido(defaultIfNull(request.requerido(), false))
                .visible(defaultIfNull(request.visible(), true))
                .editable(defaultIfNull(request.editable(), true))
                .valorDefecto(normalizeValorDefecto(request.valorDefecto()))
                .opciones(normalizeOpciones(request.opciones(), tipoDato))
                .build();
    }

    @Override
    protected void updateDomain(
            ActivoAtributo domain,
            ActivoAtributoRequest request
    ) {
        requireTipoActivoExists(request.tipoActivoId());
        TipoDato tipoDato = requireTipoDato(request.tipoDatoId());

        String codigo = requireNormalizedCodigo(request.codigo());
        validateUniqueCodigoForUpdate(
                request.tipoActivoId(),
                codigo,
                domain.getId()
        );

        int orden = resolveOrdenForUpdate(
                request.tipoActivoId(),
                request.orden(),
                domain.getId()
        );

        domain.setTipoActivoId(request.tipoActivoId());
        domain.setCodigo(codigo);
        domain.setEtiqueta(requireNormalizedEtiqueta(request.etiqueta()));
        domain.setDescripcion(normalizeDescripcion(request.descripcion()));
        domain.setTipoDatoId(tipoDato.getId());
        domain.setOrden(orden);
        domain.setRequerido(defaultIfNull(request.requerido(), false));
        domain.setVisible(defaultIfNull(request.visible(), true));
        domain.setEditable(defaultIfNull(request.editable(), true));
        domain.setValorDefecto(normalizeValorDefecto(request.valorDefecto()));
        domain.setOpciones(normalizeOpciones(request.opciones(), tipoDato));
    }

    @Transactional
    public ActivoAtributoResponse uploadImagen(UUID id, MultipartFile file) {
        ActivoAtributo domain = findDomainById(id);
        String url = imageStorageService.store(IMAGE_FOLDER, id, file);
        domain.setUrlImagen(url);
        return toResponse(activoAtributoRepository.save(domain));
    }

    @Transactional
    public ActivoAtributoResponse deleteImagen(UUID id) {
        ActivoAtributo domain = findDomainById(id);
        if (domain.getUrlImagen() != null) {
            imageStorageService.delete(domain.getUrlImagen());
            domain.setUrlImagen(null);
            domain = activoAtributoRepository.save(domain);
        }
        return toResponse(domain);
    }

    @Override
    @Transactional
    public void delete(UUID id) {
        ActivoAtributo domain = findDomainById(id);
        if (domain.getUrlImagen() != null) {
            imageStorageService.delete(domain.getUrlImagen());
        }
        activoAtributoRepository.deleteById(id);
    }

    @Override
    protected ActivoAtributoResponse toResponse(ActivoAtributo domain) {
        return new ActivoAtributoResponse(
                domain.getId(),
                domain.getTipoActivoId(),
                domain.getCodigo(),
                domain.getEtiqueta(),
                domain.getDescripcion(),
                domain.getTipoDatoId(),
                domain.getOrden(),
                domain.getRequerido(),
                domain.getVisible(),
                domain.getEditable(),
                domain.getValorDefecto(),
                deserializeOpciones(domain.getOpciones()),
                domain.getUrlImagen(),
                domain.getCreatedAt(),
                domain.getUpdatedAt(),
                domain.getCreatedBy(),
                domain.getUpdatedBy()
        );
    }

    @Override
    protected String resourceName() {
        return "Atributo de activo";
    }

    private void requireTipoActivoExists(UUID tipoActivoId) {
        if (!tipoActivoRepository.existsById(tipoActivoId)) {
            throw new ResourceNotFoundException("Tipo de activo", tipoActivoId);
        }
    }

    private TipoDato requireTipoDato(UUID tipoDatoId) {
        return tipoDatoRepository
                .findById(tipoDatoId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Tipo de dato", tipoDatoId)
                );
    }

    private void validateUniqueCodigoForCreate(
            UUID tipoActivoId,
            String codigo
    ) {
        if (activoAtributoRepository.existsByTipoActivoIdAndCodigoIgnoreCase(
                tipoActivoId,
                codigo
        )) {
            throw new ConflictException(
                    "ACTIVO_ATRIBUTO_ALREADY_EXISTS",
                    "Ya existe un atributo con el código '%s' en este tipo de activo"
                            .formatted(codigo)
            );
        }
    }

    private void validateUniqueCodigoForUpdate(
            UUID tipoActivoId,
            String codigo,
            UUID currentId
    ) {
        if (activoAtributoRepository.existsByTipoActivoIdAndCodigoIgnoreCaseAndIdNot(
                tipoActivoId,
                codigo,
                currentId
        )) {
            throw new ConflictException(
                    "ACTIVO_ATRIBUTO_ALREADY_EXISTS",
                    "Ya existe otro atributo con el código '%s' en este tipo de activo"
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
                    "INVALID_ACTIVO_ATRIBUTO_CODIGO",
                    "El código debe tener entre %d y %d caracteres"
                            .formatted(CODIGO_MIN_LENGTH, CODIGO_MAX_LENGTH)
            );
        }

        return normalized;
    }

    private String requireNormalizedEtiqueta(String value) {
        String normalized = StringUtils.normalize(value);

        if (normalized == null
                || normalized.length() < ETIQUETA_MIN_LENGTH
                || normalized.length() > ETIQUETA_MAX_LENGTH) {
            throw new BusinessException(
                    "INVALID_ACTIVO_ATRIBUTO_ETIQUETA",
                    "La etiqueta debe tener entre %d y %d caracteres"
                            .formatted(ETIQUETA_MIN_LENGTH, ETIQUETA_MAX_LENGTH)
            );
        }

        return normalized;
    }

    private String normalizeDescripcion(String value) {
        String normalized = StringUtils.normalize(value);

        if (normalized != null
                && normalized.length() > DESCRIPCION_MAX_LENGTH) {
            throw new BusinessException(
                    "INVALID_ACTIVO_ATRIBUTO_DESCRIPCION",
                    "La descripción no puede superar los %d caracteres"
                            .formatted(DESCRIPCION_MAX_LENGTH)
            );
        }

        return normalized;
    }

    private String normalizeValorDefecto(String value) {
        String normalized = StringUtils.trimToNull(value);

        if (normalized != null
                && normalized.length() > VALOR_DEFECTO_MAX_LENGTH) {
            throw new BusinessException(
                    "INVALID_ACTIVO_ATRIBUTO_VALOR_DEFECTO",
                    "El valor por defecto no puede superar los %d caracteres"
                            .formatted(VALOR_DEFECTO_MAX_LENGTH)
            );
        }

        return normalized;
    }

    private String normalizeOpciones(
            List<ActivoAtributoOpcionDto> opciones,
            TipoDato tipoDato
    ) {
        boolean permiteOpciones = Boolean.TRUE.equals(
                tipoDato.getPermiteOpciones()
        );

        if (!permiteOpciones) {
            if (opciones != null && !opciones.isEmpty()) {
                throw new BusinessException(
                        "ACTIVO_ATRIBUTO_OPCIONES_NOT_ALLOWED",
                        "El tipo de dato '%s' no admite opciones"
                                .formatted(tipoDato.getCodigo())
                );
            }
            return null;
        }

        if (opciones == null || opciones.isEmpty()) {
            throw new BusinessException(
                    "ACTIVO_ATRIBUTO_OPCIONES_REQUIRED",
                    "Las opciones son obligatorias para el tipo de dato '%s'"
                            .formatted(tipoDato.getCodigo())
            );
        }

        List<ActivoAtributoOpcionDto> normalized = opciones.stream()
                .map(this::requireNormalizedOpcion)
                .toList();

        Set<String> values = new HashSet<>();
        for (ActivoAtributoOpcionDto opcion : normalized) {
            if (!values.add(opcion.value().toLowerCase())) {
                throw new BusinessException(
                        "ACTIVO_ATRIBUTO_OPCION_DUPLICATED",
                        "Las opciones no pueden repetir el valor '%s'"
                                .formatted(opcion.value())
                );
            }
        }

        try {
            return jsonMapper.writeValueAsString(normalized);
        } catch (JacksonException exception) {
            throw new BusinessException(
                    "INVALID_ACTIVO_ATRIBUTO_OPCIONES",
                    "No se pudieron serializar las opciones del atributo"
            );
        }
    }

    private ActivoAtributoOpcionDto requireNormalizedOpcion(
            ActivoAtributoOpcionDto opcion
    ) {
        if (opcion == null) {
            throw new BusinessException(
                    "INVALID_ACTIVO_ATRIBUTO_OPCION",
                    "Cada opción debe incluir valor y etiqueta"
            );
        }

        String value = StringUtils.normalize(opcion.value());
        String label = StringUtils.normalize(opcion.label());

        if (value == null
                || value.length() > OPCION_FIELD_MAX_LENGTH
                || label == null
                || label.length() > OPCION_FIELD_MAX_LENGTH) {
            throw new BusinessException(
                    "INVALID_ACTIVO_ATRIBUTO_OPCION",
                    "Cada opción debe tener valor y etiqueta entre 1 y %d caracteres"
                            .formatted(OPCION_FIELD_MAX_LENGTH)
            );
        }

        return new ActivoAtributoOpcionDto(value, label);
    }

    private List<ActivoAtributoOpcionDto> deserializeOpciones(String opciones) {
        if (StringUtils.isBlank(opciones)) {
            return null;
        }

        try {
            return jsonMapper.readValue(
                    opciones,
                    new TypeReference<List<ActivoAtributoOpcionDto>>() {
                    }
            );
        } catch (JacksonException exception) {
            throw new BusinessException(
                    "INVALID_ACTIVO_ATRIBUTO_OPCIONES",
                    "Las opciones almacenadas no son un JSON válido"
            );
        }
    }

    private int resolveOrdenForCreate(UUID tipoActivoId, Integer orden) {
        if (orden == null) {
            Integer maxOrden = activoAtributoRepository
                    .findMaxOrdenByTipoActivoId(tipoActivoId);
            return maxOrden == null ? 0 : maxOrden + 1;
        }

        if (orden < 0) {
            throw new BusinessException(
                    "INVALID_ACTIVO_ATRIBUTO_ORDEN",
                    "El orden no puede ser negativo"
            );
        }

        validateUniqueOrdenForCreate(tipoActivoId, orden);
        return orden;
    }

    private int resolveOrdenForUpdate(
            UUID tipoActivoId,
            Integer orden,
            UUID currentId
    ) {
        int resolved = orden == null ? 0 : orden;

        if (resolved < 0) {
            throw new BusinessException(
                    "INVALID_ACTIVO_ATRIBUTO_ORDEN",
                    "El orden no puede ser negativo"
            );
        }

        validateUniqueOrdenForUpdate(tipoActivoId, resolved, currentId);
        return resolved;
    }

    private void validateUniqueOrdenForCreate(
            UUID tipoActivoId,
            int orden
    ) {
        if (activoAtributoRepository.existsByTipoActivoIdAndOrden(
                tipoActivoId,
                orden
        )) {
            throw new ConflictException(
                    "ACTIVO_ATRIBUTO_ORDEN_ALREADY_EXISTS",
                    "Ya existe un atributo con el orden '%d' en este tipo de activo"
                            .formatted(orden)
            );
        }
    }

    private void validateUniqueOrdenForUpdate(
            UUID tipoActivoId,
            int orden,
            UUID currentId
    ) {
        if (activoAtributoRepository.existsByTipoActivoIdAndOrdenAndIdNot(
                tipoActivoId,
                orden,
                currentId
        )) {
            throw new ConflictException(
                    "ACTIVO_ATRIBUTO_ORDEN_ALREADY_EXISTS",
                    "Ya existe otro atributo con el orden '%d' en este tipo de activo"
                            .formatted(orden)
            );
        }
    }

    private static boolean defaultIfNull(Boolean value, boolean defaultValue) {
        return value == null ? defaultValue : value;
    }
}
