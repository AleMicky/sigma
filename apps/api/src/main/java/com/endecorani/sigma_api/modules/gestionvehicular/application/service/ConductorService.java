package com.endecorani.sigma_api.modules.gestionvehicular.application.service;

import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.conductor.request.ConductorRequest;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.conductor.request.ConductorUpdate;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.conductor.response.ConductorEmpleadoInfo;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.conductor.response.ConductorResponse;
import com.endecorani.sigma_api.modules.gestionvehicular.application.mapper.ConductorMapper;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.enums.EstadoConductor;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.enums.EstadoLicenciaConductor;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.model.Conductor;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.model.ConductorLicencia;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.repository.ConductorRepository;
import com.endecorani.sigma_api.modules.organizacion.domain.model.Empleado;
import com.endecorani.sigma_api.modules.organizacion.domain.repository.EmpleadoRepository;
import com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.entity.VEmpleadoEntity;
import com.endecorani.sigma_api.modules.organizacion.infrastructure.persistence.repository.SpringVEmpleadoRepository;
import com.endecorani.sigma_api.shared.application.pagination.PageRequestDto;
import com.endecorani.sigma_api.shared.application.pagination.PageResponse;
import com.endecorani.sigma_api.shared.domain.exception.BusinessException;
import com.endecorani.sigma_api.shared.domain.exception.ConflictException;
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
public class ConductorService {

    private static final Set<String> SORT_FIELDS = Set.of(
            "id",
            "empleadoId",
            "estado",
            "activo",
            "createdAt",
            "updatedAt"
    );

    private final ConductorRepository repository;
    private final EmpleadoRepository empleadoRepository;
    private final SpringVEmpleadoRepository springVEmpleadoRepository;
    private final ConductorMapper mapper;

    @Transactional(readOnly = true)
    public PageResponse<ConductorResponse> findAll(PageRequestDto pageRequest) {
        Pageable pageable = pageRequest.toPageable(SORT_FIELDS);
        Page<Conductor> resultado = repository.findAll(pageable);
        return toPageResponse(resultado);
    }

    @Transactional(readOnly = true)
    public PageResponse<ConductorResponse> listar(String search, PageRequestDto pageRequest) {
        return listar(search, null, null, null, pageRequest);
    }

    @Transactional(readOnly = true)
    public PageResponse<ConductorResponse> listar(
            String search,
            String categoria,
            EstadoConductor estado,
            Boolean activo,
            PageRequestDto pageRequest
    ) {
        String normalizedSearch = StringUtils.normalize(search);
        String normalizedCategoria = StringUtils.normalize(categoria);
        Pageable pageable = pageRequest.toPageable(SORT_FIELDS);
        Page<Conductor> resultado;

        if ((normalizedSearch == null || normalizedSearch.isBlank()) &&
            (normalizedCategoria == null || normalizedCategoria.isBlank()) &&
            estado == null &&
            activo == null) {
            resultado = repository.findAll(pageable);
        } else {
            resultado = repository.searchWithFilters(normalizedSearch, normalizedCategoria, estado, activo, pageable);
        }

        return toPageResponse(resultado);
    }

    @Transactional(readOnly = true)
    public List<ConductorResponse> findDisponibles(LocalDateTime fechaSalida, LocalDateTime fechaRetorno) {
        if (fechaSalida == null || fechaRetorno == null) {
            throw new BusinessException("Las fechas de salida y retorno son obligatorias");
        }
        if (fechaRetorno.isBefore(fechaSalida)) {
            throw new BusinessException("La fecha de retorno no puede ser anterior a la fecha de salida");
        }
        List<Conductor> disponibles = repository.findDisponibles(fechaSalida, fechaRetorno);
        return toListResponse(disponibles);
    }

    @Transactional(readOnly = true)
    public ConductorResponse findById(UUID id) {
        Conductor conductor = obtenerPorId(id);
        return toResponse(conductor);
    }

    @Transactional
    public ConductorResponse create(ConductorRequest dto) {
        UUID empleadoId = dto.empleadoId();
        Empleado empleado = obtenerEmpleado(empleadoId);

        validarEmpleadoUnicoParaCrear(empleadoId);

        Conductor domain = mapper.toDomain(dto);
        if (domain.getEstado() == null) {
            domain.setEstado(EstadoConductor.ACTIVO);
        }
        if (dto.activo() == null) {
            domain.setActivo(true);
        }
        domain.setObservacion(StringUtils.normalize(dto.observacion()));

        if (domain.getLicencias() != null) {
            for (ConductorLicencia lic : domain.getLicencias()) {
                lic.setNumeroLicencia(StringUtils.normalize(lic.getNumeroLicencia()));
                lic.setCategoriaLicencia(StringUtils.normalize(lic.getCategoriaLicencia()));
                lic.setObservacion(StringUtils.normalize(lic.getObservacion()));
                if (lic.getEstado() == null) {
                    lic.setEstado(EstadoLicenciaConductor.VIGENTE);
                }
                if (lic.isActivo() == false && dto.licencias() != null) {
                    // keep as is
                } else {
                    lic.setActivo(true);
                }
            }
        }

        Conductor guardado = repository.save(domain);
        return toResponse(guardado, empleado);
    }

    @Transactional
    public ConductorResponse update(UUID id, ConductorRequest dto) {
        Conductor actual = obtenerPorId(id);

        UUID empleadoId = dto.empleadoId();
        Empleado empleado = obtenerEmpleado(empleadoId);

        validarEmpleadoUnicoParaActualizar(empleadoId, id);

        mapper.updateDomainFromRequest(dto, actual);
        actual.setObservacion(StringUtils.normalize(dto.observacion()));
        if (dto.estado() != null) {
            actual.setEstado(dto.estado());
        }
        if (dto.activo() != null) {
            actual.setActivo(dto.activo());
        }

        if (dto.licencias() != null) {
            List<ConductorLicencia> nuevasLicencias = mapper.toDomainList(dto.licencias());
            for (ConductorLicencia lic : nuevasLicencias) {
                lic.setNumeroLicencia(StringUtils.normalize(lic.getNumeroLicencia()));
                lic.setCategoriaLicencia(StringUtils.normalize(lic.getCategoriaLicencia()));
                lic.setObservacion(StringUtils.normalize(lic.getObservacion()));
                if (lic.getEstado() == null) {
                    lic.setEstado(EstadoLicenciaConductor.VIGENTE);
                }
            }
            actual.setLicencias(nuevasLicencias);
        }

        Conductor actualizado = repository.save(actual);
        return toResponse(actualizado, empleado);
    }

    @Transactional
    public ConductorResponse update(UUID id, ConductorUpdate dto) {
        Conductor actual = obtenerPorId(id);

        UUID empleadoId = dto.empleadoId();
        Empleado empleado = obtenerEmpleado(empleadoId);

        validarEmpleadoUnicoParaActualizar(empleadoId, id);

        mapper.updateDomain(dto, actual);
        actual.setObservacion(StringUtils.normalize(dto.observacion()));
        if (dto.estado() != null) {
            actual.setEstado(dto.estado());
        }
        if (dto.activo() != null) {
            actual.setActivo(dto.activo());
        }

        if (dto.licencias() != null) {
            List<ConductorLicencia> nuevasLicencias = mapper.toDomainList(dto.licencias());
            for (ConductorLicencia lic : nuevasLicencias) {
                lic.setNumeroLicencia(StringUtils.normalize(lic.getNumeroLicencia()));
                lic.setCategoriaLicencia(StringUtils.normalize(lic.getCategoriaLicencia()));
                lic.setObservacion(StringUtils.normalize(lic.getObservacion()));
                if (lic.getEstado() == null) {
                    lic.setEstado(EstadoLicenciaConductor.VIGENTE);
                }
            }
            actual.setLicencias(nuevasLicencias);
        }

        Conductor actualizado = repository.save(actual);
        return toResponse(actualizado, empleado);
    }

    @Transactional
    public void delete(UUID id) {
        obtenerPorId(id);
        repository.deleteById(id);
    }

    private PageResponse<ConductorResponse> toPageResponse(Page<Conductor> page) {
        if (page.isEmpty()) {
            return PageResponse.of(List.of(), page);
        }
        List<ConductorResponse> responses = toListResponse(page.getContent());
        return PageResponse.of(responses, page);
    }

    private List<ConductorResponse> toListResponse(List<Conductor> content) {
        if (content.isEmpty()) {
            return List.of();
        }

        Set<UUID> empleadoIds = content.stream()
                .map(Conductor::getEmpleadoId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        Map<UUID, ConductorEmpleadoInfo> empleadoMap = empleadoIds.isEmpty()
                ? Map.of()
                : springVEmpleadoRepository.findAllById(empleadoIds).stream()
                .collect(Collectors.toMap(
                        VEmpleadoEntity::getEmpleadoId,
                        ve -> new ConductorEmpleadoInfo(
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
                    ConductorEmpleadoInfo empleadoInfo = domain.getEmpleadoId() != null ? empleadoMap.get(domain.getEmpleadoId()) : null;
                    return mapper.toResponse(domain, empleadoInfo);
                })
                .toList();
    }

    private ConductorResponse toResponse(Conductor conductor) {
        ConductorEmpleadoInfo empleadoInfo = conductor.getEmpleadoId() != null
                ? obtenerEmpleadoInfo(conductor.getEmpleadoId())
                : null;
        return mapper.toResponse(conductor, empleadoInfo);
    }

    private ConductorResponse toResponse(Conductor conductor, Empleado empleado) {
        ConductorEmpleadoInfo empleadoInfo = conductor.getEmpleadoId() != null
                ? obtenerEmpleadoInfo(conductor.getEmpleadoId())
                : (empleado != null ? mapper.toEmpleadoInfo(empleado) : null);
        return mapper.toResponse(conductor, empleadoInfo);
    }

    private ConductorEmpleadoInfo obtenerEmpleadoInfo(UUID empleadoId) {
        if (empleadoId == null) {
            return null;
        }
        return springVEmpleadoRepository.findById(empleadoId)
                .map(ve -> new ConductorEmpleadoInfo(
                        ve.getEmpleadoId(),
                        ve.getCodigo(),
                        ve.getNombreCompleto(),
                        ve.getCargo(),
                        ve.getArea()
                ))
                .orElseGet(() -> empleadoRepository.findById(empleadoId)
                        .map(emp -> new ConductorEmpleadoInfo(
                                emp.getId(),
                                emp.getCodigo(),
                                emp.getNombreCompleto(),
                                emp.getCargo(),
                                emp.getArea()
                        ))
                        .orElse(null));
    }

    private Empleado obtenerEmpleado(UUID empleadoId) {
        return empleadoRepository.findById(empleadoId)
                .orElseThrow(() -> new ResourceNotFoundException("Empleado", empleadoId));
    }

    private Conductor obtenerPorId(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Conductor", id));
    }

    private void validarEmpleadoUnicoParaCrear(UUID empleadoId) {
        if (repository.existsByEmpleadoId(empleadoId)) {
            throw new ConflictException(
                    "CONDUCTOR_EMPLEADO_ALREADY_EXISTS",
                    "Ya existe un conductor asociado al empleado '%s'".formatted(empleadoId)
            );
        }
    }

    private void validarEmpleadoUnicoParaActualizar(UUID empleadoId, UUID currentId) {
        if (repository.existsByEmpleadoIdAndIdNot(empleadoId, currentId)) {
            throw new ConflictException(
                    "CONDUCTOR_EMPLEADO_ALREADY_EXISTS",
                    "Ya existe otro conductor asociado al empleado '%s'".formatted(empleadoId)
            );
        }
    }
}
