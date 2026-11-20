package com.endecorani.sigma_api.modules.gestionvehicular.application.service;

import com.endecorani.sigma_api.modules.activos.application.dto.ActivoAtributoOpcionDto;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.entity.ActivoAtributoEntity;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.entity.ActivoAtributoValorEntity;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.entity.ActivoEntity;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.entity.EstadoOperativoEntity;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.entity.TipoActivoEntity;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.repository.SpringActivoAtributoRepository;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.repository.SpringActivoAtributoValorRepository;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.repository.SpringEstadoOperativoRepository;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.repository.SpringTipoActivoRepository;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.vehiculo.response.VehiculoAtributoResponse;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.vehiculo.response.VehiculoCatalogoResponse;
import com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.entity.FlotaVehicularEntity;
import com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.entity.FlotaVehiculoEntity;
import com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.repository.SpringFlotaVehicularRepository;
import com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.repository.SpringFlotaVehiculoRepository;
import com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.repository.SpringVehiculoCatalogoRepository;
import com.endecorani.sigma_api.modules.parametros.infrastructure.persistence.entity.TipoDatoEntity;
import com.endecorani.sigma_api.modules.parametros.infrastructure.persistence.entity.UbicacionEntity;
import com.endecorani.sigma_api.modules.parametros.infrastructure.persistence.repository.SpringTipoDatoRepository;
import com.endecorani.sigma_api.modules.parametros.infrastructure.persistence.repository.SpringUbicacionRepository;
import com.endecorani.sigma_api.shared.application.pagination.PageRequestDto;
import com.endecorani.sigma_api.shared.application.pagination.PageResponse;
import com.endecorani.sigma_api.shared.domain.exception.ResourceNotFoundException;
import com.endecorani.sigma_api.shared.util.StringUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.core.JacksonException;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.json.JsonMapper;

import java.text.Normalizer;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VehiculoGestionVehicularService {

    private static final String TIPO_VEHICULO_NORMALIZADO = "vehiculo";
    private static final DateTimeFormatter DATE_DISPLAY_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final DateTimeFormatter DATETIME_DISPLAY_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    private static final Set<String> SORT_FIELDS = Set.of(
            "id",
            "codigo",
            "codigoAlternativo",
            "nombre",
            "fechaAdquisicion",
            "activo",
            "createdAt",
            "updatedAt"
    );

    private final SpringVehiculoCatalogoRepository vehiculoCatalogoRepository;
    private final SpringTipoActivoRepository tipoActivoRepository;
    private final SpringActivoAtributoRepository activoAtributoRepository;
    private final SpringActivoAtributoValorRepository activoAtributoValorRepository;
    private final SpringTipoDatoRepository tipoDatoRepository;
    private final SpringUbicacionRepository ubicacionRepository;
    private final SpringEstadoOperativoRepository estadoOperativoRepository;
    private final SpringFlotaVehiculoRepository flotaVehiculoRepository;
    private final SpringFlotaVehicularRepository flotaVehicularRepository;
    private final JsonMapper jsonMapper;

    @Transactional(readOnly = true)
    public PageResponse<VehiculoCatalogoResponse> listarVehiculos(
            String query,
            UUID estadoOperativoId,
            UUID ubicacionId,
            UUID flotaId,
            Boolean activo,
            PageRequestDto pageRequest
    ) {
        Pageable pageable = pageRequest.toPageable(SORT_FIELDS);
        List<TipoActivoEntity> tiposVehiculo = resolveTiposActivoVehiculo();

        if (tiposVehiculo.isEmpty()) {
            return PageResponse.of(List.of(), Page.empty(pageable));
        }

        Map<UUID, TipoActivoEntity> tipoById = tiposVehiculo.stream()
                .collect(Collectors.toMap(TipoActivoEntity::getId, Function.identity(), (a, b) -> a));

        String normalizedQuery = StringUtils.normalize(query);

        Page<ActivoEntity> page = vehiculoCatalogoRepository.searchVehiculos(
                tipoById.keySet(),
                normalizedQuery,
                estadoOperativoId,
                ubicacionId,
                flotaId,
                activo,
                pageable
        );

        if (page.isEmpty()) {
            return PageResponse.of(List.of(), page);
        }

        List<ActivoEntity> activos = page.getContent();
        List<UUID> activoIds = activos.stream().map(ActivoEntity::getId).toList();

        // 1. Atributos visibles configurados por cada tipo de activo vehículo (ordenados por orden ASC)
        Map<UUID, List<ActivoAtributoEntity>> atributosByTipoId = new HashMap<>();
        Set<UUID> tipoDatoIds = new java.util.HashSet<>();
        for (UUID tipoId : tipoById.keySet()) {
            List<ActivoAtributoEntity> attrs = activoAtributoRepository.findByTipoActivoId(tipoId).stream()
                    .filter(attr -> Boolean.TRUE.equals(attr.getVisible()))
                    .sorted(Comparator.comparingInt(attr -> attr.getOrden() != null ? attr.getOrden() : 0))
                    .toList();
            atributosByTipoId.put(tipoId, attrs);
            attrs.stream().map(ActivoAtributoEntity::getTipoDatoId).filter(Objects::nonNull).forEach(tipoDatoIds::add);
        }

        Map<UUID, TipoDatoEntity> tipoDatoById = tipoDatoIds.isEmpty()
                ? Map.of()
                : tipoDatoRepository.findAllById(tipoDatoIds).stream()
                        .collect(Collectors.toMap(TipoDatoEntity::getId, Function.identity(), (a, b) -> a));

        // 2. Valores de atributos en batch para los activos de la página
        Map<UUID, Map<UUID, String>> valoresByActivoId = new HashMap<>();
        for (ActivoAtributoValorEntity val : activoAtributoValorRepository.findByActivoIdIn(activoIds)) {
            valoresByActivoId
                    .computeIfAbsent(val.getActivoId(), k -> new HashMap<>())
                    .put(val.getActivoAtributoId(), val.getValor());
        }

        // 3. Ubicaciones y estados operativos en batch
        Set<UUID> ubicacionIds = activos.stream()
                .map(ActivoEntity::getUbicacionId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());
        Map<UUID, UbicacionEntity> ubicacionById = ubicacionIds.isEmpty()
                ? Map.of()
                : ubicacionRepository.findAllById(ubicacionIds).stream()
                        .collect(Collectors.toMap(UbicacionEntity::getId, Function.identity(), (a, b) -> a));

        Set<UUID> estadoIds = activos.stream()
                .map(ActivoEntity::getEstadoOperativoId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());
        Map<UUID, EstadoOperativoEntity> estadoById = estadoIds.isEmpty()
                ? Map.of()
                : estadoOperativoRepository.findAllById(estadoIds).stream()
                        .collect(Collectors.toMap(EstadoOperativoEntity::getId, Function.identity(), (a, b) -> a));

        // 4. Flotas activas vinculadas en batch
        List<FlotaVehiculoEntity> flotaLinks = flotaVehiculoRepository.findByActivoIdInAndActivoTrue(activoIds);
        Set<UUID> flotaIds = flotaLinks.stream()
                .map(FlotaVehiculoEntity::getFlotaVehicularId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());
        Map<UUID, FlotaVehicularEntity> flotaById = flotaIds.isEmpty()
                ? Map.of()
                : flotaVehicularRepository.findAllById(flotaIds).stream()
                        .filter(FlotaVehicularEntity::isActivo)
                        .collect(Collectors.toMap(FlotaVehicularEntity::getId, Function.identity(), (a, b) -> a));

        Map<UUID, List<VehiculoCatalogoResponse.FlotaInfo>> flotasByActivoId = new HashMap<>();
        for (FlotaVehiculoEntity link : flotaLinks) {
            FlotaVehicularEntity flota = flotaById.get(link.getFlotaVehicularId());
            if (flota != null) {
                flotasByActivoId
                        .computeIfAbsent(link.getActivoId(), k -> new ArrayList<>())
                        .add(new VehiculoCatalogoResponse.FlotaInfo(
                                flota.getId(),
                                flota.getCodigo(),
                                flota.getNombre()
                        ));
            }
        }

        // Cache de opciones deserializadas por atributoId
        Map<UUID, List<ActivoAtributoOpcionDto>> opcionesByAtributoId = new HashMap<>();

        List<VehiculoCatalogoResponse> content = activos.stream()
                .map(entity -> toResponse(
                        entity,
                        tipoById.get(entity.getTipoActivoId()),
                        entity.getUbicacionId() != null ? ubicacionById.get(entity.getUbicacionId()) : null,
                        entity.getEstadoOperativoId() != null ? estadoById.get(entity.getEstadoOperativoId()) : null,
                        flotasByActivoId.getOrDefault(entity.getId(), List.of()),
                        atributosByTipoId.getOrDefault(entity.getTipoActivoId(), List.of()),
                        valoresByActivoId.getOrDefault(entity.getId(), Map.of()),
                        tipoDatoById,
                        opcionesByAtributoId
                ))
                .toList();

        return PageResponse.of(content, page);
    }

    @Transactional(readOnly = true)
    public VehiculoCatalogoResponse obtenerVehiculoPorId(UUID id) {
        List<TipoActivoEntity> tiposVehiculo = resolveTiposActivoVehiculo();
        Map<UUID, TipoActivoEntity> tipoById = tiposVehiculo.stream()
                .collect(Collectors.toMap(TipoActivoEntity::getId, Function.identity(), (a, b) -> a));

        ActivoEntity entity = vehiculoCatalogoRepository.findById(id)
                .filter(a -> tipoById.containsKey(a.getTipoActivoId()))
                .orElseThrow(() -> new ResourceNotFoundException("Vehículo", id));

        TipoActivoEntity tipoActivo = tipoById.get(entity.getTipoActivoId());

        List<ActivoAtributoEntity> atributosVisibles = activoAtributoRepository
                .findByTipoActivoId(entity.getTipoActivoId()).stream()
                .filter(attr -> Boolean.TRUE.equals(attr.getVisible()))
                .sorted(Comparator.comparingInt(attr -> attr.getOrden() != null ? attr.getOrden() : 0))
                .toList();

        Set<UUID> tipoDatoIds = atributosVisibles.stream()
                .map(ActivoAtributoEntity::getTipoDatoId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());
        Map<UUID, TipoDatoEntity> tipoDatoById = tipoDatoIds.isEmpty()
                ? Map.of()
                : tipoDatoRepository.findAllById(tipoDatoIds).stream()
                        .collect(Collectors.toMap(TipoDatoEntity::getId, Function.identity(), (a, b) -> a));

        Map<UUID, String> valoresByAtributoId = new HashMap<>();
        for (ActivoAtributoValorEntity val : activoAtributoValorRepository.findByActivoIdIn(List.of(entity.getId()))) {
            valoresByAtributoId.put(val.getActivoAtributoId(), val.getValor());
        }

        UbicacionEntity ubicacion = entity.getUbicacionId() != null
                ? ubicacionRepository.findById(entity.getUbicacionId()).orElse(null)
                : null;
        EstadoOperativoEntity estadoOperativo = entity.getEstadoOperativoId() != null
                ? estadoOperativoRepository.findById(entity.getEstadoOperativoId()).orElse(null)
                : null;

        List<FlotaVehiculoEntity> flotaLinks = flotaVehiculoRepository.findByActivoIdInAndActivoTrue(List.of(entity.getId()));
        Set<UUID> flotaIds = flotaLinks.stream()
                .map(FlotaVehiculoEntity::getFlotaVehicularId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());
        List<VehiculoCatalogoResponse.FlotaInfo> flotas = flotaIds.isEmpty()
                ? List.of()
                : flotaVehicularRepository.findAllById(flotaIds).stream()
                        .filter(FlotaVehicularEntity::isActivo)
                        .map(flota -> new VehiculoCatalogoResponse.FlotaInfo(
                                flota.getId(),
                                flota.getCodigo(),
                                flota.getNombre()
                        ))
                        .toList();

        return toResponse(
                entity,
                tipoActivo,
                ubicacion,
                estadoOperativo,
                flotas,
                atributosVisibles,
                valoresByAtributoId,
                tipoDatoById,
                new HashMap<>()
        );
    }

    private List<TipoActivoEntity> resolveTiposActivoVehiculo() {
        List<TipoActivoEntity> todos = tipoActivoRepository.findAll();

        List<TipoActivoEntity> exactos = todos.stream()
                .filter(t -> TIPO_VEHICULO_NORMALIZADO.equals(normalizeText(t.getNombre())))
                .toList();

        if (!exactos.isEmpty()) {
            return exactos;
        }

        return todos.stream()
                .filter(t -> normalizeText(t.getNombre()).contains(TIPO_VEHICULO_NORMALIZADO))
                .toList();
    }

    private VehiculoCatalogoResponse toResponse(
            ActivoEntity entity,
            TipoActivoEntity tipoActivo,
            UbicacionEntity ubicacion,
            EstadoOperativoEntity estadoOperativo,
            List<VehiculoCatalogoResponse.FlotaInfo> flotas,
            List<ActivoAtributoEntity> atributosDefinidos,
            Map<UUID, String> valoresByAtributoId,
            Map<UUID, TipoDatoEntity> tipoDatoById,
            Map<UUID, List<ActivoAtributoOpcionDto>> opcionesByAtributoId
    ) {
        VehiculoCatalogoResponse.TipoActivoInfo tipoInfo = tipoActivo != null
                ? new VehiculoCatalogoResponse.TipoActivoInfo(
                        tipoActivo.getId(),
                        tipoActivo.getNombre(),
                        tipoActivo.getColor(),
                        tipoActivo.getIcono()
                )
                : null;

        VehiculoCatalogoResponse.UbicacionInfo ubicacionInfo = ubicacion != null
                ? new VehiculoCatalogoResponse.UbicacionInfo(
                        ubicacion.getId(),
                        ubicacion.getCodigo(),
                        ubicacion.getNombre()
                )
                : null;

        VehiculoCatalogoResponse.EstadoOperativoInfo estadoInfo = estadoOperativo != null
                ? new VehiculoCatalogoResponse.EstadoOperativoInfo(
                        estadoOperativo.getId(),
                        estadoOperativo.getCodigo(),
                        estadoOperativo.getNombre(),
                        estadoOperativo.getColor()
                )
                : null;

        List<VehiculoAtributoResponse> atributos = atributosDefinidos.stream()
                .map(attr -> {
                    TipoDatoEntity tipoDato = attr.getTipoDatoId() != null
                            ? tipoDatoById.get(attr.getTipoDatoId())
                            : null;
                    String tipoDatoCodigo = tipoDato != null && tipoDato.getCodigo() != null
                            ? tipoDato.getCodigo().toUpperCase(Locale.ROOT)
                            : "TEXT";
                    String rawValor = valoresByAtributoId.get(attr.getId());
                    List<ActivoAtributoOpcionDto> opciones = opcionesByAtributoId.computeIfAbsent(
                            attr.getId(),
                            id -> deserializeOpciones(attr.getOpciones())
                    );
                    String valorFormateado = formatValor(rawValor, tipoDatoCodigo, opciones);

                    return new VehiculoAtributoResponse(
                            attr.getId(),
                            attr.getCodigo(),
                            attr.getEtiqueta(),
                            tipoDatoCodigo,
                            attr.getOrden(),
                            Boolean.TRUE.equals(attr.getVisible()),
                            rawValor,
                            valorFormateado
                    );
                })
                .toList();

        return new VehiculoCatalogoResponse(
                entity.getId(),
                entity.getCodigo(),
                entity.getCodigoAlternativo(),
                entity.getNombre(),
                entity.getDescripcion(),
                entity.getFechaAdquisicion(),
                entity.getUrlImagen(),
                entity.getActivo(),
                tipoInfo,
                ubicacionInfo,
                estadoInfo,
                flotas,
                atributos
        );
    }

    private List<ActivoAtributoOpcionDto> deserializeOpciones(String opcionesJson) {
        if (StringUtils.isBlank(opcionesJson)) {
            return List.of();
        }
        try {
            List<ActivoAtributoOpcionDto> parsed = jsonMapper.readValue(
                    opcionesJson,
                    new TypeReference<List<ActivoAtributoOpcionDto>>() {
                    }
            );
            return parsed != null ? parsed : List.of();
        } catch (JacksonException ignored) {
            return List.of();
        }
    }

    private String formatValor(
            String rawValor,
            String tipoDatoCodigo,
            List<ActivoAtributoOpcionDto> opciones
    ) {
        if (rawValor == null || rawValor.isBlank()) {
            return null;
        }
        String trimmed = rawValor.trim();

        if ("BOOLEAN".equals(tipoDatoCodigo)) {
            if ("true".equalsIgnoreCase(trimmed)) {
                return "Sí";
            }
            if ("false".equalsIgnoreCase(trimmed)) {
                return "No";
            }
            return trimmed;
        }

        if ("MULTISELECT".equals(tipoDatoCodigo) || trimmed.startsWith("[")) {
            try {
                List<String> values = jsonMapper.readValue(
                        trimmed,
                        new TypeReference<List<String>>() {
                        }
                );
                if (values != null) {
                    List<String> labels = values.stream()
                            .filter(v -> v != null && !v.isBlank())
                            .map(v -> resolveOpcionLabel(v, opciones))
                            .toList();
                    return labels.isEmpty() ? null : String.join(", ", labels);
                }
            } catch (JacksonException ignored) {
                // fallback a valor original
            }
        }

        if (!opciones.isEmpty()) {
            return resolveOpcionLabel(trimmed, opciones);
        }

        if ("DATE".equals(tipoDatoCodigo)) {
            try {
                return LocalDate.parse(trimmed).format(DATE_DISPLAY_FORMATTER);
            } catch (DateTimeParseException ignored) {
                return trimmed;
            }
        }

        if ("DATETIME".equals(tipoDatoCodigo)) {
            try {
                return LocalDateTime.parse(trimmed).format(DATETIME_DISPLAY_FORMATTER);
            } catch (DateTimeParseException ignored) {
                return trimmed;
            }
        }

        return trimmed;
    }

    private String resolveOpcionLabel(String value, List<ActivoAtributoOpcionDto> opciones) {
        for (ActivoAtributoOpcionDto opcion : opciones) {
            if (opcion.value() != null && opcion.value().equalsIgnoreCase(value)) {
                return opcion.label() != null ? opcion.label() : value;
            }
        }
        return value;
    }

    private String normalizeText(String text) {
        if (text == null) {
            return "";
        }
        return Normalizer.normalize(text, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .trim()
                .toLowerCase(Locale.ROOT);
    }
}
