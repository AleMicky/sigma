package com.endecorani.sigma_api.modules.gestionvehicular.application.service;

import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.flotavehiculo.response.FlotaVehiculoResponse;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.responsableflota.request.ResponsableFlotaRequest;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.responsableflota.request.ResponsableFlotaUpdate;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.responsableflota.response.ResponsableFlotaEmpleadoInfo;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.responsableflota.response.ResponsableFlotaFlotaInfo;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.responsableflota.response.ResponsableFlotaResponse;
import com.endecorani.sigma_api.modules.gestionvehicular.application.mapper.ResponsableFlotaMapper;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.model.FlotaVehicular;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.model.ResponsableFlota;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.repository.FlotaVehicularRepository;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.repository.ResponsableFlotaRepository;
import com.endecorani.sigma_api.modules.gestionvehicular.infrastructure.persistence.repository.SpringResponsableFlotaRepository;
import com.endecorani.sigma_api.modules.organizacion.domain.repository.EmpleadoRepository;
import com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.entity.VEmpleadoEntity;
import com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.repository.SpringVEmpleadoRepository;
import com.endecorani.sigma_api.shared.application.pagination.PageRequestDto;
import com.endecorani.sigma_api.shared.application.pagination.PageResponse;
import com.endecorani.sigma_api.shared.domain.exception.ConflictException;
import com.endecorani.sigma_api.shared.domain.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ResponsableFlotaService {

    private static final Set<String> SORT_FIELDS = Set.of(
            "id",
            "flotaVehicularId",
            "empleadoId",
            "principal",
            "activo",
            "createdAt",
            "updatedAt"
    );

    private final ResponsableFlotaRepository repository;
    private final SpringResponsableFlotaRepository springRepository;
    private final FlotaVehicularRepository flotaVehicularRepository;
    private final EmpleadoRepository empleadoRepository;
    private final SpringVEmpleadoRepository springVEmpleadoRepository;
    private final FlotaVehiculoService flotaVehiculoService;
    private final ResponsableFlotaMapper mapper;

    @Transactional(readOnly = true)
    public PageResponse<ResponsableFlotaResponse> listar(
            UUID flotaVehicularId,
            UUID empleadoId,
            Boolean principal,
            Boolean activo,
            PageRequestDto pageRequest
    ) {
        Pageable pageable = pageRequest.toPageable(SORT_FIELDS);
        Page<ResponsableFlota> resultado = repository.searchWithFilters(flotaVehicularId, empleadoId, principal, activo, pageable);
        return toPageResponse(resultado);
    }

    @Transactional(readOnly = true)
    public List<ResponsableFlotaResponse> findByFlotaVehicularId(UUID flotaVehicularId) {
        validarFlotaExiste(flotaVehicularId);
        List<ResponsableFlota> responsables = repository.findByFlotaVehicularId(flotaVehicularId);
        return toListResponse(responsables);
    }

    @Transactional(readOnly = true)
    public List<ResponsableFlotaResponse> findByEmpleadoId(UUID empleadoId) {
        validarEmpleadoExiste(empleadoId);
        List<ResponsableFlota> flotas = repository.findByEmpleadoId(empleadoId);
        return toListResponse(flotas);
    }

    @Transactional(readOnly = true)
    public List<FlotaVehiculoResponse> findVehiculosByEmpleadoId(UUID empleadoId, Boolean activo) {
        validarEmpleadoExiste(empleadoId);
        return flotaVehiculoService.findByResponsableEmpleadoId(empleadoId, activo);
    }

    @Transactional(readOnly = true)
    public ResponsableFlotaResponse findById(UUID id) {
        ResponsableFlota responsable = obtenerPorId(id);
        return toResponse(responsable);
    }

    @Transactional
    public ResponsableFlotaResponse create(ResponsableFlotaRequest dto) {
        validarFlotaExiste(dto.flotaVehicularId());
        validarEmpleadoExiste(dto.empleadoId());
        validarResponsableUnicoEnFlotaParaCrear(dto.flotaVehicularId(), dto.empleadoId());

        ResponsableFlota responsable = mapper.toDomain(dto);
        if (dto.principal() != null) {
            responsable.setPrincipal(dto.principal());
        } else {
            responsable.setPrincipal(false);
        }

        if (dto.activo() != null) {
            responsable.setActivo(dto.activo());
        } else {
            responsable.setActivo(true);
        }

        ResponsableFlota guardado = repository.save(responsable);

        if (guardado.isPrincipal()) {
            springRepository.clearOtherPrincipals(guardado.getFlotaVehicularId(), guardado.getId());
        }

        return toResponse(guardado);
    }

    @Transactional
    public ResponsableFlotaResponse update(UUID id, ResponsableFlotaUpdate dto) {
        ResponsableFlota actual = obtenerPorId(id);

        validarFlotaExiste(dto.flotaVehicularId());
        validarEmpleadoExiste(dto.empleadoId());
        validarResponsableUnicoEnFlotaParaActualizar(dto.flotaVehicularId(), dto.empleadoId(), id);

        mapper.updateDomain(dto, actual);
        if (dto.principal() != null) {
            actual.setPrincipal(dto.principal());
        }
        if (dto.activo() != null) {
            actual.setActivo(dto.activo());
        }

        ResponsableFlota actualizado = repository.save(actual);

        if (actualizado.isPrincipal()) {
            springRepository.clearOtherPrincipals(actualizado.getFlotaVehicularId(), actualizado.getId());
        }

        return toResponse(actualizado);
    }

    @Transactional
    public ResponsableFlotaResponse toggleActivo(UUID id) {
        ResponsableFlota actual = obtenerPorId(id);
        actual.setActivo(!actual.isActivo());
        ResponsableFlota actualizado = repository.save(actual);
        return toResponse(actualizado);
    }

    @Transactional
    public ResponsableFlotaResponse setPrincipal(UUID id) {
        ResponsableFlota actual = obtenerPorId(id);
        actual.setPrincipal(true);
        actual.setActivo(true);
        ResponsableFlota actualizado = repository.save(actual);
        springRepository.clearOtherPrincipals(actualizado.getFlotaVehicularId(), actualizado.getId());
        return toResponse(actualizado);
    }

    @Transactional
    public void delete(UUID id) {
        obtenerPorId(id);
        repository.deleteById(id);
    }

    private PageResponse<ResponsableFlotaResponse> toPageResponse(Page<ResponsableFlota> page) {
        if (page.isEmpty()) {
            return PageResponse.of(List.of(), page);
        }
        List<ResponsableFlotaResponse> responses = toListResponse(page.getContent());
        return PageResponse.of(responses, page);
    }

    private List<ResponsableFlotaResponse> toListResponse(List<ResponsableFlota> content) {
        if (content.isEmpty()) {
            return List.of();
        }

        Set<UUID> flotaIds = content.stream()
                .map(ResponsableFlota::getFlotaVehicularId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        Set<UUID> empleadoIds = content.stream()
                .map(ResponsableFlota::getEmpleadoId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        Map<UUID, ResponsableFlotaFlotaInfo> flotaMap = flotaIds.isEmpty()
                ? Map.of()
                : flotaIds.stream()
                .map(flotaVehicularRepository::findById)
                .filter(Optional::isPresent)
                .map(Optional::get)
                .collect(Collectors.toMap(
                        FlotaVehicular::getId,
                        f -> new ResponsableFlotaFlotaInfo(f.getId(), f.getCodigo(), f.getNombre()),
                        (a, b) -> a
                ));

        Map<UUID, ResponsableFlotaEmpleadoInfo> empleadoMap = empleadoIds.isEmpty()
                ? Map.of()
                : springVEmpleadoRepository.findAllById(empleadoIds).stream()
                .collect(Collectors.toMap(
                        VEmpleadoEntity::getEmpleadoId,
                        ve -> new ResponsableFlotaEmpleadoInfo(
                                ve.getEmpleadoId(),
                                ve.getCodigo(),
                                ve.getNombreCompleto(),
                                ve.getCargo(),
                                ve.getArea()
                        ),
                        (a, b) -> a
                ));

        return content.stream()
                .map(domain -> {
                    ResponsableFlotaFlotaInfo flotaInfo = domain.getFlotaVehicularId() != null ? flotaMap.get(domain.getFlotaVehicularId()) : null;
                    ResponsableFlotaEmpleadoInfo empleadoInfo = domain.getEmpleadoId() != null ? empleadoMap.get(domain.getEmpleadoId()) : null;
                    return mapper.toResponse(domain, flotaInfo, empleadoInfo);
                })
                .toList();
    }

    private ResponsableFlotaResponse toResponse(ResponsableFlota domain) {
        ResponsableFlotaFlotaInfo flotaInfo = domain.getFlotaVehicularId() != null
                ? flotaVehicularRepository.findById(domain.getFlotaVehicularId())
                .map(f -> new ResponsableFlotaFlotaInfo(f.getId(), f.getCodigo(), f.getNombre()))
                .orElse(null)
                : null;

        ResponsableFlotaEmpleadoInfo empleadoInfo = domain.getEmpleadoId() != null
                ? springVEmpleadoRepository.findById(domain.getEmpleadoId())
                .map(ve -> new ResponsableFlotaEmpleadoInfo(
                        ve.getEmpleadoId(),
                        ve.getCodigo(),
                        ve.getNombreCompleto(),
                        ve.getCargo(),
                        ve.getArea()
                ))
                .orElseGet(() -> empleadoRepository.findById(domain.getEmpleadoId())
                        .map(emp -> new ResponsableFlotaEmpleadoInfo(
                                emp.getId(),
                                emp.getCodigo(),
                                emp.getNombreCompleto(),
                                emp.getCargo(),
                                emp.getArea()
                        ))
                        .orElse(null))
                : null;

        return mapper.toResponse(domain, flotaInfo, empleadoInfo);
    }

    private ResponsableFlota obtenerPorId(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Responsable de flota", id));
    }

    private void validarFlotaExiste(UUID flotaVehicularId) {
        if (flotaVehicularId == null || !flotaVehicularRepository.existsById(flotaVehicularId)) {
            throw new ResourceNotFoundException("Flota vehicular", flotaVehicularId);
        }
    }

    private void validarEmpleadoExiste(UUID empleadoId) {
        if (empleadoId == null || !empleadoRepository.existsById(empleadoId)) {
            throw new ResourceNotFoundException("Empleado", empleadoId);
        }
    }

    private void validarResponsableUnicoEnFlotaParaCrear(UUID flotaVehicularId, UUID empleadoId) {
        if (repository.existsByFlotaVehicularIdAndEmpleadoId(flotaVehicularId, empleadoId)) {
            throw new ConflictException(
                    "RESPONSABLE_FLOTA_ALREADY_EXISTS",
                    "El empleado ya se encuentra asignado como responsable de la flota indicada"
            );
        }
    }

    private void validarResponsableUnicoEnFlotaParaActualizar(UUID flotaVehicularId, UUID empleadoId, UUID currentId) {
        if (repository.existsByFlotaVehicularIdAndEmpleadoIdAndIdNot(flotaVehicularId, empleadoId, currentId)) {
            throw new ConflictException(
                    "RESPONSABLE_FLOTA_ALREADY_EXISTS",
                    "El empleado ya se encuentra asignado como responsable de la flota indicada"
            );
        }
    }
}
