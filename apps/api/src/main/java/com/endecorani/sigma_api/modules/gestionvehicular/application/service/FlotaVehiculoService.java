package com.endecorani.sigma_api.modules.gestionvehicular.application.service;

import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.entity.ActivoAtributoEntity;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.entity.ActivoAtributoValorEntity;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.entity.ActivoAsignacionEntity;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.entity.ActivoEntity;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.entity.TipoActivoEntity;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.repository.SpringActivoAtributoRepository;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.repository.SpringActivoAtributoValorRepository;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.repository.SpringActivoAsignacionRepository;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.repository.SpringActivoRepository;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.repository.SpringTipoActivoRepository;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.flotavehiculo.request.FlotaVehiculoBatchRequest;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.flotavehiculo.request.FlotaVehiculoRequest;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.flotavehiculo.request.FlotaVehiculoUpdate;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.flotavehiculo.request.SincronizarFlotaVehiculosRequest;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.flotavehiculo.response.FlotaVehiculoActivoInfo;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.flotavehiculo.response.FlotaVehiculoFlotaInfo;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.flotavehiculo.response.FlotaVehiculoResponse;
import com.endecorani.sigma_api.modules.gestionvehicular.application.mapper.FlotaVehiculoMapper;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.model.FlotaVehicular;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.model.FlotaVehiculo;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.repository.FlotaVehicularRepository;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.repository.FlotaVehiculoRepository;
import com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.entity.AreaEntity;
import com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.entity.VEmpleadoEntity;
import com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.repository.SpringAreaRepository;
import com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.repository.SpringVEmpleadoRepository;
import com.endecorani.sigma_api.shared.application.pagination.PageRequestDto;
import com.endecorani.sigma_api.shared.application.pagination.PageResponse;
import com.endecorani.sigma_api.shared.domain.exception.BusinessException;
import com.endecorani.sigma_api.shared.domain.exception.ConflictException;
import com.endecorani.sigma_api.shared.domain.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FlotaVehiculoService {

    private static final Pattern PLACA_PATTERN = Pattern.compile(
            "PLACA[:\\s#-]+([0-9A-Za-z]+(?:[\\s-][0-9A-Za-z]+)*)",
            Pattern.CASE_INSENSITIVE
    );

    private static final Set<String> SORT_FIELDS = Set.of(
            "id",
            "flotaVehicularId",
            "activoId",
            "activo",
            "createdAt",
            "updatedAt"
    );

    private final FlotaVehiculoRepository repository;
    private final FlotaVehicularRepository flotaVehicularRepository;
    private final SpringActivoRepository springActivoRepository;
    private final SpringTipoActivoRepository springTipoActivoRepository;
    private final SpringActivoAtributoValorRepository springActivoAtributoValorRepository;
    private final SpringActivoAtributoRepository springActivoAtributoRepository;
    private final SpringActivoAsignacionRepository springActivoAsignacionRepository;
    private final SpringVEmpleadoRepository springVEmpleadoRepository;
    private final SpringAreaRepository springAreaRepository;
    private final FlotaVehiculoMapper mapper;

    @Transactional(readOnly = true)
    public PageResponse<FlotaVehiculoResponse> listar(
            UUID flotaVehicularId,
            UUID activoId,
            Boolean activo,
            PageRequestDto pageRequest
    ) {
        Pageable pageable = pageRequest.toPageable(SORT_FIELDS);
        Page<FlotaVehiculo> resultado = repository.searchWithFilters(flotaVehicularId, activoId, activo, pageable);
        return toPageResponse(resultado);
    }

    @Transactional(readOnly = true)
    public List<FlotaVehiculoResponse> findByFlotaVehicularId(UUID flotaVehicularId) {
        validarFlotaExiste(flotaVehicularId);
        List<FlotaVehiculo> vehiculos = repository.findByFlotaVehicularId(flotaVehicularId);
        return toListResponse(vehiculos);
    }

    @Transactional(readOnly = true)
    public List<FlotaVehiculoResponse> findByResponsableEmpleadoId(UUID empleadoId, Boolean activo) {
        List<FlotaVehiculo> vehiculos = repository.findByResponsableEmpleadoId(empleadoId, activo);
        return toListResponse(vehiculos);
    }

    @Transactional(readOnly = true)
    public FlotaVehiculoResponse findById(UUID id) {
        FlotaVehiculo flotaVehiculo = obtenerPorId(id);
        return toResponse(flotaVehiculo);
    }

    @Transactional
    public List<FlotaVehiculoResponse> create(FlotaVehiculoRequest dto) {
        validarFlotaExiste(dto.flotaVehicularId());

        List<UUID> targetActivoIds = new ArrayList<>();
        if (dto.activoIds() != null && !dto.activoIds().isEmpty()) {
            targetActivoIds.addAll(dto.activoIds().stream().filter(Objects::nonNull).distinct().toList());
        } else if (dto.activoId() != null) {
            targetActivoIds.add(dto.activoId());
        }

        if (targetActivoIds.isEmpty()) {
            throw new BusinessException("Debe proporcionar al menos un ID de vehículo (activo)");
        }

        boolean estadoActivo = dto.activo() != null ? dto.activo() : true;
        return procesarAsignacionVehiculos(dto.flotaVehicularId(), targetActivoIds, estadoActivo);
    }

    @Transactional
    public List<FlotaVehiculoResponse> createBatch(FlotaVehiculoBatchRequest dto) {
        validarFlotaExiste(dto.flotaVehicularId());
        List<UUID> targetActivoIds = dto.activoIds().stream().filter(Objects::nonNull).distinct().toList();
        if (targetActivoIds.isEmpty()) {
            throw new BusinessException("Debe proporcionar al menos un ID de vehículo (activo)");
        }

        boolean estadoActivo = dto.activo() != null ? dto.activo() : true;
        return procesarAsignacionVehiculos(dto.flotaVehicularId(), targetActivoIds, estadoActivo);
    }

    @Transactional
    public List<FlotaVehiculoResponse> sincronizar(UUID flotaVehicularId, SincronizarFlotaVehiculosRequest dto) {
        validarFlotaExiste(flotaVehicularId);

        List<UUID> targetActivoIds = dto.activoIds() != null
                ? dto.activoIds().stream().filter(Objects::nonNull).distinct().toList()
                : List.of();

        // Validar que todos los activos existan en lote
        if (!targetActivoIds.isEmpty()) {
            Set<UUID> foundActivoIds = springActivoRepository.findAllById(targetActivoIds).stream()
                    .map(ActivoEntity::getId)
                    .collect(Collectors.toSet());
            for (UUID activoId : targetActivoIds) {
                if (!foundActivoIds.contains(activoId)) {
                    throw new ResourceNotFoundException("Vehículo (Activo)", activoId);
                }
            }
        }

        List<FlotaVehiculo> actuales = repository.findByFlotaVehicularId(flotaVehicularId);
        Map<UUID, FlotaVehiculo> actualMap = actuales.stream()
                .collect(Collectors.toMap(FlotaVehiculo::getActivoId, fv -> fv, (a, b) -> a));

        Set<UUID> targetSet = new HashSet<>(targetActivoIds);

        // Eliminar los que ya no están
        List<FlotaVehiculo> paraEliminar = actuales.stream()
                .filter(fv -> !targetSet.contains(fv.getActivoId()))
                .toList();

        if (!paraEliminar.isEmpty()) {
            repository.deleteAll(paraEliminar);
        }

        // Agregar los nuevos o asegurar activos
        List<FlotaVehiculo> paraGuardar = new ArrayList<>();
        for (UUID activoId : targetActivoIds) {
            FlotaVehiculo existente = actualMap.get(activoId);
            if (existente == null) {
                paraGuardar.add(FlotaVehiculo.builder()
                        .flotaVehicularId(flotaVehicularId)
                        .activoId(activoId)
                        .activo(true)
                        .build());
            } else if (!existente.isActivo()) {
                existente.setActivo(true);
                paraGuardar.add(existente);
            }
        }

        if (!paraGuardar.isEmpty()) {
            repository.saveAll(paraGuardar);
        }

        List<FlotaVehiculo> actualizados = repository.findByFlotaVehicularId(flotaVehicularId);
        return toListResponse(actualizados);
    }

    @Transactional
    public FlotaVehiculoResponse update(UUID id, FlotaVehiculoUpdate dto) {
        FlotaVehiculo actual = obtenerPorId(id);

        validarFlotaExiste(dto.flotaVehicularId());
        validarActivoExiste(dto.activoId());
        validarVehiculoUnicoEnFlotaParaActualizar(dto.flotaVehicularId(), dto.activoId(), id);

        mapper.updateDomain(dto, actual);
        if (dto.activo() != null) {
            actual.setActivo(dto.activo());
        }

        FlotaVehiculo actualizado = repository.save(actual);
        return toResponse(actualizado);
    }

    @Transactional
    public FlotaVehiculoResponse toggleActivo(UUID id) {
        FlotaVehiculo actual = obtenerPorId(id);
        actual.setActivo(!actual.isActivo());
        FlotaVehiculo actualizado = repository.save(actual);
        return toResponse(actualizado);
    }

    @Transactional
    public void delete(UUID id) {
        obtenerPorId(id);
        repository.deleteById(id);
    }

    private List<FlotaVehiculoResponse> procesarAsignacionVehiculos(UUID flotaVehicularId, List<UUID> activoIds, boolean estadoActivo) {
        for (UUID activoId : activoIds) {
            validarActivoExiste(activoId);
        }

        List<FlotaVehiculo> existentes = repository.findByFlotaVehicularIdAndActivoIdIn(flotaVehicularId, activoIds);
        Map<UUID, FlotaVehiculo> existenteMap = existentes.stream()
                .collect(Collectors.toMap(FlotaVehiculo::getActivoId, fv -> fv, (a, b) -> a));

        List<FlotaVehiculo> paraGuardar = new ArrayList<>();
        for (UUID activoId : activoIds) {
            FlotaVehiculo existente = existenteMap.get(activoId);
            if (existente != null) {
                existente.setActivo(estadoActivo);
                paraGuardar.add(existente);
            } else {
                paraGuardar.add(FlotaVehiculo.builder()
                        .flotaVehicularId(flotaVehicularId)
                        .activoId(activoId)
                        .activo(estadoActivo)
                        .build());
            }
        }

        List<FlotaVehiculo> guardados = repository.saveAll(paraGuardar);
        return toListResponse(guardados);
    }

    private PageResponse<FlotaVehiculoResponse> toPageResponse(Page<FlotaVehiculo> page) {
        if (page.isEmpty()) {
            return PageResponse.of(List.of(), page);
        }
        List<FlotaVehiculoResponse> responses = toListResponse(page.getContent());
        return PageResponse.of(responses, page);
    }

    private List<FlotaVehiculoResponse> toListResponse(List<FlotaVehiculo> content) {
        if (content.isEmpty()) {
            return List.of();
        }

        Set<UUID> flotaIds = content.stream()
                .map(FlotaVehiculo::getFlotaVehicularId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        Set<UUID> activoIds = content.stream()
                .map(FlotaVehiculo::getActivoId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        Map<UUID, FlotaVehiculoFlotaInfo> flotaMap = flotaIds.isEmpty()
                ? Map.of()
                : flotaVehicularRepository.findAllById(flotaIds).stream()
                .collect(Collectors.toMap(
                        FlotaVehicular::getId,
                        f -> new FlotaVehiculoFlotaInfo(f.getId(), f.getCodigo(), f.getNombre()),
                        (a, b) -> a
                ));

        Map<UUID, FlotaVehiculoActivoInfo> activoMap = cargarActivoInfoMap(activoIds);

        return content.stream()
                .map(domain -> {
                    FlotaVehiculoFlotaInfo flotaInfo = domain.getFlotaVehicularId() != null ? flotaMap.get(domain.getFlotaVehicularId()) : null;
                    FlotaVehiculoActivoInfo activoInfo = domain.getActivoId() != null ? activoMap.get(domain.getActivoId()) : null;
                    return mapper.toResponse(domain, flotaInfo, activoInfo);
                })
                .toList();
    }

    private FlotaVehiculoResponse toResponse(FlotaVehiculo domain) {
        FlotaVehiculoFlotaInfo flotaInfo = domain.getFlotaVehicularId() != null
                ? flotaVehicularRepository.findById(domain.getFlotaVehicularId())
                .map(f -> new FlotaVehiculoFlotaInfo(f.getId(), f.getCodigo(), f.getNombre()))
                .orElse(null)
                : null;

        FlotaVehiculoActivoInfo activoInfo = domain.getActivoId() != null
                ? cargarActivoInfoMap(List.of(domain.getActivoId())).get(domain.getActivoId())
                : null;

        return mapper.toResponse(domain, flotaInfo, activoInfo);
    }

    private Map<UUID, FlotaVehiculoActivoInfo> cargarActivoInfoMap(Collection<UUID> activoIds) {
        if (activoIds == null || activoIds.isEmpty()) {
            return Map.of();
        }

        List<ActivoEntity> activos = springActivoRepository.findAllById(activoIds);
        if (activos.isEmpty()) {
            return Map.of();
        }

        // 1. Tipos de activo
        Set<UUID> tipoIds = activos.stream()
                .map(ActivoEntity::getTipoActivoId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());
        Map<UUID, String> tipoMap = tipoIds.isEmpty()
                ? Map.of()
                : springTipoActivoRepository.findAllById(tipoIds).stream()
                .collect(Collectors.toMap(
                        TipoActivoEntity::getId,
                        TipoActivoEntity::getNombre,
                        (a, b) -> a
                ));

        // 2. Valores de atributos
        List<ActivoAtributoValorEntity> valores = springActivoAtributoValorRepository.findByActivoIdIn(activoIds);
        Map<UUID, List<ActivoAtributoValorEntity>> valoresPorActivo = valores.stream()
                .collect(Collectors.groupingBy(ActivoAtributoValorEntity::getActivoId));

        Set<UUID> atributoDefIds = valores.stream()
                .map(ActivoAtributoValorEntity::getActivoAtributoId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());
        Map<UUID, ActivoAtributoEntity> defMap = atributoDefIds.isEmpty()
                ? Map.of()
                : springActivoAtributoRepository.findAllById(atributoDefIds).stream()
                .collect(Collectors.toMap(
                        ActivoAtributoEntity::getId,
                        a -> a,
                        (a, b) -> a
                ));

        // 3. Asignaciones activas de los activos
        List<ActivoAsignacionEntity> asignaciones = springActivoAsignacionRepository.findActiveByActivoIds(activoIds);
        Map<UUID, ActivoAsignacionEntity> asignacionPorActivo = new HashMap<>();
        for (ActivoAsignacionEntity asig : asignaciones) {
            if (asig.getActivo() != null && asig.getActivo().getId() != null) {
                asignacionPorActivo.putIfAbsent(asig.getActivo().getId(), asig);
            }
        }

        // 4. Empleados y Áreas de las asignaciones
        Set<UUID> empleadoIds = asignaciones.stream()
                .map(ActivoAsignacionEntity::getEmpleadoId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());
        Map<UUID, VEmpleadoEntity> empleadoMap = empleadoIds.isEmpty()
                ? Map.of()
                : springVEmpleadoRepository.findAllById(empleadoIds).stream()
                .collect(Collectors.toMap(
                        VEmpleadoEntity::getEmpleadoId,
                        e -> e,
                        (a, b) -> a
                ));

        Set<UUID> areaIds = asignaciones.stream()
                .map(ActivoAsignacionEntity::getAreaId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());
        Map<UUID, String> areaMap = areaIds.isEmpty()
                ? Map.of()
                : springAreaRepository.findAllById(areaIds).stream()
                .collect(Collectors.toMap(
                        AreaEntity::getId,
                        AreaEntity::getNombre,
                        (a, b) -> a
                ));

        // 5. Construcción de FlotaVehiculoActivoInfo para cada activo
        Map<UUID, FlotaVehiculoActivoInfo> resultMap = new HashMap<>();
        for (ActivoEntity a : activos) {
            String tipoActivo = a.getTipoActivoId() != null ? tipoMap.get(a.getTipoActivoId()) : null;

            String placa = null;
            String marca = null;
            String modelo = null;
            String anio = null;
            String color = null;
            Map<String, String> atributosMap = new LinkedHashMap<>();

            List<ActivoAtributoValorEntity> listaValores = valoresPorActivo.getOrDefault(a.getId(), List.of());
            for (ActivoAtributoValorEntity v : listaValores) {
                ActivoAtributoEntity def = defMap.get(v.getActivoAtributoId());
                if (def != null && v.getValor() != null && !v.getValor().isBlank()) {
                    String valor = v.getValor().trim();
                    String key = def.getEtiqueta() != null ? def.getEtiqueta() : def.getCodigo();
                    atributosMap.put(key, valor);

                    String cod = def.getCodigo() != null ? def.getCodigo().trim().toUpperCase(Locale.ROOT) : "";
                    if ("PLACA".equals(cod)) {
                        placa = valor;
                    } else if ("MARCA".equals(cod)) {
                        marca = valor;
                    } else if ("MODELO".equals(cod)) {
                        modelo = valor;
                    } else if ("ANIO".equals(cod) || "AÑO".equals(cod)) {
                        anio = valor;
                    } else if ("COLOR".equals(cod)) {
                        color = valor;
                    }
                }
            }

            // Fallback con regex en la descripción si placa sigue nula
            if ((placa == null || placa.isBlank()) && a.getDescripcion() != null) {
                Matcher matcher = PLACA_PATTERN.matcher(a.getDescripcion());
                if (matcher.find()) {
                    placa = matcher.group(1).trim();
                }
            }

            // Datos del responsable del activo y su área
            ActivoAsignacionEntity asig = asignacionPorActivo.get(a.getId());
            String responsableNombre = null;
            String responsableArea = null;
            String responsableCargo = null;

            if (asig != null) {
                if (asig.getEmpleadoId() != null) {
                    VEmpleadoEntity emp = empleadoMap.get(asig.getEmpleadoId());
                    if (emp != null) {
                        responsableNombre = emp.getNombreCompleto();
                        responsableArea = emp.getArea();
                        responsableCargo = emp.getCargo();
                    }
                }
                if (asig.getAreaId() != null) {
                    String areaNombre = areaMap.get(asig.getAreaId());
                    if (responsableArea == null || responsableArea.isBlank()) {
                        responsableArea = areaNombre;
                    }
                    if (responsableNombre == null || responsableNombre.isBlank()) {
                        responsableNombre = areaNombre;
                    }
                }
            }

            FlotaVehiculoActivoInfo info = FlotaVehiculoActivoInfo.builder()
                    .id(a.getId())
                    .codigo(a.getCodigo())
                    .nombre(a.getNombre())
                    .descripcion(a.getDescripcion())
                    .urlImagen(a.getUrlImagen())
                    .placa(placa)
                    .tipoActivo(tipoActivo)
                    .marca(marca)
                    .modelo(modelo)
                    .anio(anio)
                    .color(color)
                    .atributos(atributosMap.isEmpty() ? null : atributosMap)
                    .responsableNombre(responsableNombre)
                    .responsableArea(responsableArea)
                    .responsableCargo(responsableCargo)
                    .build();

            resultMap.put(a.getId(), info);
        }

        return resultMap;
    }

    private FlotaVehiculo obtenerPorId(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehículo de flota", id));
    }

    private void validarFlotaExiste(UUID flotaVehicularId) {
        if (flotaVehicularId == null || !flotaVehicularRepository.existsById(flotaVehicularId)) {
            throw new ResourceNotFoundException("Flota vehicular", flotaVehicularId);
        }
    }

    private void validarActivoExiste(UUID activoId) {
        if (activoId == null || !springActivoRepository.existsById(activoId)) {
            throw new ResourceNotFoundException("Vehículo (Activo)", activoId);
        }
    }

    private void validarVehiculoUnicoEnFlotaParaCrear(UUID flotaVehicularId, UUID activoId) {
        if (repository.existsByFlotaVehicularIdAndActivoId(flotaVehicularId, activoId)) {
            throw new ConflictException(
                    "FLOTA_VEHICULO_ALREADY_EXISTS",
                    "El vehículo ya se encuentra asignado a la flota vehicular indicada"
            );
        }
    }

    private void validarVehiculoUnicoEnFlotaParaActualizar(UUID flotaVehicularId, UUID activoId, UUID currentId) {
        if (repository.existsByFlotaVehicularIdAndActivoIdAndIdNot(flotaVehicularId, activoId, currentId)) {
            throw new ConflictException(
                    "FLOTA_VEHICULO_ALREADY_EXISTS",
                    "El vehículo ya se encuentra asignado a la flota vehicular indicada"
            );
        }
    }
}
