package com.endecorani.sigma_api.modules.gestionvehicular.application.service;

import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.entity.ActivoEntity;
import com.endecorani.sigma_api.modules.activos.infrastructure.persistence.repository.SpringActivoRepository;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.asignacionvehicular.request.AsignacionVehicularRequest;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.asignacionvehicular.request.AsignacionVehicularUpdate;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.asignacionvehicular.response.*;
import com.endecorani.sigma_api.modules.gestionvehicular.application.mapper.AsignacionVehicularMapper;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.model.AsignacionVehicular;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.model.Conductor;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.model.SolicitudVehicular;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.repository.AsignacionVehicularRepository;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.repository.ConductorRepository;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.repository.SolicitudVehicularRepository;
import com.endecorani.sigma_api.modules.organizacion.domain.model.Empleado;
import com.endecorani.sigma_api.modules.organizacion.domain.repository.EmpleadoRepository;
import com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.entity.VEmpleadoEntity;
import com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.repository.SpringVEmpleadoRepository;
import com.endecorani.sigma_api.shared.application.pagination.PageRequestDto;
import com.endecorani.sigma_api.shared.application.pagination.PageResponse;
import com.endecorani.sigma_api.shared.domain.exception.ResourceNotFoundException;
import com.endecorani.sigma_api.shared.util.StringUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AsignacionVehicularService {

    private static final Set<String> SORT_FIELDS = Set.of(
            "id",
            "solicitudVehicularId",
            "activoId",
            "conductorId",
            "asignadoPorId",
            "fechaAsignacion",
            "createdAt",
            "updatedAt"
    );

    private final AsignacionVehicularRepository repository;
    private final SolicitudVehicularRepository solicitudVehicularRepository;
    private final SpringActivoRepository springActivoRepository;
    private final ConductorRepository conductorRepository;
    private final EmpleadoRepository empleadoRepository;
    private final SpringVEmpleadoRepository springVEmpleadoRepository;
    private final AsignacionVehicularMapper mapper;

    @Transactional(readOnly = true)
    public PageResponse<AsignacionVehicularResponse> listar(String search, PageRequestDto pageRequest) {
        return listar(search, null, null, null, null, pageRequest);
    }

    @Transactional(readOnly = true)
    public PageResponse<AsignacionVehicularResponse> listar(
            String search,
            UUID solicitudVehicularId,
            UUID activoId,
            UUID conductorId,
            UUID asignadoPorId,
            PageRequestDto pageRequest
    ) {
        String normalizedSearch = StringUtils.normalize(search);
        Pageable pageable = pageRequest.toPageable(SORT_FIELDS);
        Page<AsignacionVehicular> resultado = repository.searchWithFilters(
                normalizedSearch,
                solicitudVehicularId,
                activoId,
                conductorId,
                asignadoPorId,
                pageable
        );

        return toPageResponse(resultado);
    }

    @Transactional(readOnly = true)
    public AsignacionVehicularResponse findById(UUID id) {
        AsignacionVehicular asignacion = obtenerPorId(id);
        return toResponse(asignacion);
    }

    @Transactional(readOnly = true)
    public List<AsignacionVehicularResponse> findBySolicitudVehicularId(UUID solicitudVehicularId) {
        return repository.findBySolicitudVehicularId(solicitudVehicularId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public AsignacionVehicularResponse create(AsignacionVehicularRequest dto) {
        validarDependenciasExisten(
                dto.solicitudVehicularId(),
                dto.activoId(),
                dto.conductorId(),
                dto.asignadoPorId()
        );

        LocalDateTime fecha = dto.fechaAsignacion() != null ? dto.fechaAsignacion() : LocalDateTime.now();

        AsignacionVehicular domain = mapper.toDomain(dto);
        domain.setFechaAsignacion(fecha);
        domain.setObservacion(StringUtils.normalize(dto.observacion()));

        AsignacionVehicular guardado = repository.save(domain);
        return toResponse(guardado);
    }

    @Transactional
    public AsignacionVehicularResponse update(UUID id, AsignacionVehicularUpdate dto) {
        AsignacionVehicular actual = obtenerPorId(id);

        validarDependenciasExisten(
                dto.solicitudVehicularId(),
                dto.activoId(),
                dto.conductorId(),
                dto.asignadoPorId()
        );

        mapper.updateDomain(dto, actual);
        if (dto.fechaAsignacion() != null) {
            actual.setFechaAsignacion(dto.fechaAsignacion());
        }
        actual.setObservacion(StringUtils.normalize(dto.observacion()));

        AsignacionVehicular actualizado = repository.save(actual);
        return toResponse(actualizado);
    }

    @Transactional
    public AsignacionVehicularResponse update(UUID id, AsignacionVehicularRequest dto) {
        AsignacionVehicular actual = obtenerPorId(id);

        validarDependenciasExisten(
                dto.solicitudVehicularId(),
                dto.activoId(),
                dto.conductorId(),
                dto.asignadoPorId()
        );

        mapper.updateDomainFromRequest(dto, actual);
        if (dto.fechaAsignacion() != null) {
            actual.setFechaAsignacion(dto.fechaAsignacion());
        }
        actual.setObservacion(StringUtils.normalize(dto.observacion()));

        AsignacionVehicular actualizado = repository.save(actual);
        return toResponse(actualizado);
    }

    @Transactional
    public void delete(UUID id) {
        obtenerPorId(id);
        repository.deleteById(id);
    }

    private PageResponse<AsignacionVehicularResponse> toPageResponse(Page<AsignacionVehicular> page) {
        if (page.isEmpty()) {
            return PageResponse.of(List.of(), page);
        }

        List<AsignacionVehicular> content = page.getContent();

        Set<UUID> solicitudIds = content.stream()
                .map(AsignacionVehicular::getSolicitudVehicularId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        Set<UUID> activoIds = content.stream()
                .map(AsignacionVehicular::getActivoId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        Set<UUID> conductorIds = content.stream()
                .map(AsignacionVehicular::getConductorId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        Set<UUID> asignadoPorIds = content.stream()
                .map(AsignacionVehicular::getAsignadoPorId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        Map<UUID, AsignacionVehicularSolicitudInfo> solicitudMap = new HashMap<>();
        for (UUID sId : solicitudIds) {
            solicitudVehicularRepository.findById(sId).ifPresent(s ->
                    solicitudMap.put(sId, new AsignacionVehicularSolicitudInfo(
                            s.getId(),
                            s.getNumero(),
                            s.getMotivo(),
                            s.getDestino(),
                            s.getFechaSalida(),
                            s.getFechaRetornoEstimada(),
                            s.getEstado()
                    ))
            );
        }

        Map<UUID, AsignacionVehicularActivoInfo> activoMap = activoIds.isEmpty()
                ? Map.of()
                : springActivoRepository.findAllById(activoIds).stream()
                .collect(Collectors.toMap(
                        ActivoEntity::getId,
                        a -> new AsignacionVehicularActivoInfo(
                                a.getId(),
                                a.getCodigo(),
                                a.getNombre(),
                                null
                        ),
                        (a, b) -> a
                ));

        Map<UUID, Conductor> conductorMap = new HashMap<>();
        Set<UUID> conductorEmpleadoIds = new HashSet<>();
        for (UUID cId : conductorIds) {
            conductorRepository.findById(cId).ifPresent(c -> {
                conductorMap.put(cId, c);
                if (c.getEmpleadoId() != null) {
                    conductorEmpleadoIds.add(c.getEmpleadoId());
                }
            });
        }

        Set<UUID> allEmpleadoIds = new HashSet<>(asignadoPorIds);
        allEmpleadoIds.addAll(conductorEmpleadoIds);

        Map<UUID, VEmpleadoEntity> vempleadoMap = allEmpleadoIds.isEmpty()
                ? Map.of()
                : springVEmpleadoRepository.findAllById(allEmpleadoIds).stream()
                .collect(Collectors.toMap(VEmpleadoEntity::getEmpleadoId, ve -> ve, (a, b) -> a));

        List<AsignacionVehicularResponse> responses = content.stream()
                .map(domain -> {
                    AsignacionVehicularSolicitudInfo solInfo = domain.getSolicitudVehicularId() != null
                            ? solicitudMap.get(domain.getSolicitudVehicularId()) : null;

                    AsignacionVehicularActivoInfo actInfo = domain.getActivoId() != null
                            ? activoMap.get(domain.getActivoId()) : null;

                    Conductor cond = domain.getConductorId() != null ? conductorMap.get(domain.getConductorId()) : null;
                    AsignacionVehicularConductorInfo condInfo = null;
                    if (cond != null) {
                        VEmpleadoEntity ve = cond.getEmpleadoId() != null ? vempleadoMap.get(cond.getEmpleadoId()) : null;
                        condInfo = new AsignacionVehicularConductorInfo(
                                cond.getId(),
                                cond.getEmpleadoId(),
                                ve != null ? ve.getNombreCompleto() : null,
                                cond.getNumeroLicencia(),
                                cond.getCategoriaLicencia()
                        );
                    }

                    VEmpleadoEntity asigVe = domain.getAsignadoPorId() != null ? vempleadoMap.get(domain.getAsignadoPorId()) : null;
                    AsignacionVehicularEmpleadoInfo asigInfo = asigVe != null
                            ? new AsignacionVehicularEmpleadoInfo(
                            asigVe.getEmpleadoId(),
                            asigVe.getCodigo(),
                            asigVe.getNombreCompleto(),
                            asigVe.getCargo(),
                            asigVe.getArea()
                    ) : null;

                    return mapper.toResponse(domain, solInfo, actInfo, condInfo, asigInfo);
                })
                .toList();

        return PageResponse.of(responses, page);
    }

    private AsignacionVehicularResponse toResponse(AsignacionVehicular domain) {
        AsignacionVehicularSolicitudInfo solInfo = domain.getSolicitudVehicularId() != null
                ? obtenerSolicitudInfo(domain.getSolicitudVehicularId()) : null;

        AsignacionVehicularActivoInfo actInfo = domain.getActivoId() != null
                ? obtenerActivoInfo(domain.getActivoId()) : null;

        AsignacionVehicularConductorInfo condInfo = domain.getConductorId() != null
                ? obtenerConductorInfo(domain.getConductorId()) : null;

        AsignacionVehicularEmpleadoInfo asigInfo = domain.getAsignadoPorId() != null
                ? obtenerEmpleadoInfo(domain.getAsignadoPorId()) : null;

        return mapper.toResponse(domain, solInfo, actInfo, condInfo, asigInfo);
    }

    private AsignacionVehicularSolicitudInfo obtenerSolicitudInfo(UUID solicitudId) {
        return solicitudVehicularRepository.findById(solicitudId)
                .map(s -> new AsignacionVehicularSolicitudInfo(
                        s.getId(),
                        s.getNumero(),
                        s.getMotivo(),
                        s.getDestino(),
                        s.getFechaSalida(),
                        s.getFechaRetornoEstimada(),
                        s.getEstado()
                ))
                .orElse(null);
    }

    private AsignacionVehicularActivoInfo obtenerActivoInfo(UUID activoId) {
        return springActivoRepository.findById(activoId)
                .map(a -> new AsignacionVehicularActivoInfo(
                        a.getId(),
                        a.getCodigo(),
                        a.getNombre(),
                        null
                ))
                .orElse(null);
    }

    private AsignacionVehicularConductorInfo obtenerConductorInfo(UUID conductorId) {
        return conductorRepository.findById(conductorId)
                .map(c -> {
                    String nombre = null;
                    if (c.getEmpleadoId() != null) {
                        nombre = springVEmpleadoRepository.findById(c.getEmpleadoId())
                                .map(VEmpleadoEntity::getNombreCompleto)
                                .orElseGet(() -> empleadoRepository.findById(c.getEmpleadoId())
                                        .map(Empleado::getNombreCompleto)
                                        .orElse(null));
                    }
                    return new AsignacionVehicularConductorInfo(
                            c.getId(),
                            c.getEmpleadoId(),
                            nombre,
                            c.getNumeroLicencia(),
                            c.getCategoriaLicencia()
                    );
                })
                .orElse(null);
    }

    private AsignacionVehicularEmpleadoInfo obtenerEmpleadoInfo(UUID empleadoId) {
        return springVEmpleadoRepository.findById(empleadoId)
                .map(ve -> new AsignacionVehicularEmpleadoInfo(
                        ve.getEmpleadoId(),
                        ve.getCodigo(),
                        ve.getNombreCompleto(),
                        ve.getCargo(),
                        ve.getArea()
                ))
                .orElseGet(() -> empleadoRepository.findById(empleadoId)
                        .map(emp -> new AsignacionVehicularEmpleadoInfo(
                                emp.getId(),
                                emp.getCodigo(),
                                emp.getNombreCompleto(),
                                emp.getCargo(),
                                emp.getArea()
                        ))
                        .orElse(null));
    }

    private AsignacionVehicular obtenerPorId(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Asignación vehicular", id));
    }

    private void validarDependenciasExisten(
            UUID solicitudVehicularId,
            UUID activoId,
            UUID conductorId,
            UUID asignadoPorId
    ) {
        if (solicitudVehicularId != null && solicitudVehicularRepository.findById(solicitudVehicularId).isEmpty()) {
            throw new ResourceNotFoundException("Solicitud vehicular", solicitudVehicularId);
        }
        if (activoId != null && springActivoRepository.findById(activoId).isEmpty()) {
            throw new ResourceNotFoundException("Activo (Vehículo)", activoId);
        }
        if (conductorId != null && conductorRepository.findById(conductorId).isEmpty()) {
            throw new ResourceNotFoundException("Conductor", conductorId);
        }
        if (asignadoPorId != null && empleadoRepository.findById(asignadoPorId).isEmpty() && springVEmpleadoRepository.findById(asignadoPorId).isEmpty()) {
            throw new ResourceNotFoundException("Empleado asignador", asignadoPorId);
        }
    }
}
