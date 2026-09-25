package com.endecorani.sigma_api.modules.gestionvehicular.application.service;

import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.conductor.request.ConductorRequest;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.conductor.request.ConductorUpdate;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.conductor.response.ConductorEmpleadoInfo;
import com.endecorani.sigma_api.modules.gestionvehicular.application.dto.conductor.response.ConductorResponse;
import com.endecorani.sigma_api.modules.gestionvehicular.application.mapper.ConductorMapper;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.model.Conductor;
import com.endecorani.sigma_api.modules.gestionvehicular.domain.repository.ConductorRepository;
import com.endecorani.sigma_api.modules.organizacion.domain.model.Empleado;
import com.endecorani.sigma_api.modules.organizacion.domain.repository.EmpleadoRepository;
import com.endecorani.sigma_api.shared.application.pagination.PageRequestDto;
import com.endecorani.sigma_api.shared.application.pagination.PageResponse;
import com.endecorani.sigma_api.shared.domain.exception.ConflictException;
import com.endecorani.sigma_api.shared.domain.exception.ResourceNotFoundException;
import com.endecorani.sigma_api.shared.util.StringUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ConductorService {

    private static final Set<String> SORT_FIELDS = Set.of(
            "id",
            "empleadoId",
            "numeroLicencia",
            "categoriaLicencia",
            "fechaVencimiento",
            "activo",
            "createdAt",
            "updatedAt"
    );

    private final ConductorRepository repository;
    private final EmpleadoRepository empleadoRepository;
    private final ConductorMapper mapper;

    @Transactional(readOnly = true)
    public PageResponse<ConductorResponse> findAll(PageRequestDto pageRequest) {
        Pageable pageable = pageRequest.toPageable(SORT_FIELDS);
        Page<Conductor> resultado = repository.findAll(pageable);
        return toPageResponse(resultado);
    }

    @Transactional(readOnly = true)
    public PageResponse<ConductorResponse> listar(String search, PageRequestDto pageRequest) {
        return listar(search, null, null, pageRequest);
    }

    @Transactional(readOnly = true)
    public PageResponse<ConductorResponse> listar(String search, String categoria, Boolean activo, PageRequestDto pageRequest) {
        String normalizedSearch = StringUtils.normalize(search);
        String normalizedCategoria = StringUtils.normalize(categoria);
        Pageable pageable = pageRequest.toPageable(SORT_FIELDS);
        Page<Conductor> resultado;

        if ((normalizedSearch == null || normalizedSearch.isBlank()) &&
            (normalizedCategoria == null || normalizedCategoria.isBlank()) &&
            activo == null) {
            resultado = repository.findAll(pageable);
        } else {
            resultado = repository.searchWithFilters(normalizedSearch, normalizedCategoria, activo, pageable);
        }

        return toPageResponse(resultado);
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

        String numeroLicencia = StringUtils.normalize(dto.numeroLicencia());
        validarUnicosParaCrear(empleadoId, numeroLicencia);

        Conductor domain = mapper.toDomain(dto);
        domain.setNumeroLicencia(numeroLicencia);
        domain.setCategoriaLicencia(StringUtils.normalize(dto.categoriaLicencia()));
        if (dto.activo() == null) {
            domain.setActivo(true);
        }

        Conductor guardado = repository.save(domain);
        return toResponse(guardado, empleado);
    }

    @Transactional
    public ConductorResponse update(UUID id, ConductorRequest dto) {
        Conductor actual = obtenerPorId(id);

        UUID empleadoId = dto.empleadoId();
        Empleado empleado = obtenerEmpleado(empleadoId);

        String numeroLicencia = StringUtils.normalize(dto.numeroLicencia());
        validarUnicosParaActualizar(empleadoId, numeroLicencia, id);

        mapper.updateDomainFromRequest(dto, actual);
        actual.setNumeroLicencia(numeroLicencia);
        actual.setCategoriaLicencia(StringUtils.normalize(dto.categoriaLicencia()));
        if (dto.activo() != null) {
            actual.setActivo(dto.activo());
        }

        Conductor actualizado = repository.save(actual);
        return toResponse(actualizado, empleado);
    }

    @Transactional
    public ConductorResponse update(UUID id, ConductorUpdate dto) {
        Conductor actual = obtenerPorId(id);

        UUID empleadoId = dto.empleadoId();
        Empleado empleado = obtenerEmpleado(empleadoId);

        String numeroLicencia = StringUtils.normalize(dto.numeroLicencia());
        validarUnicosParaActualizar(empleadoId, numeroLicencia, id);

        mapper.updateDomain(dto, actual);
        actual.setNumeroLicencia(numeroLicencia);
        actual.setCategoriaLicencia(StringUtils.normalize(dto.categoriaLicencia()));
        if (dto.activo() != null) {
            actual.setActivo(dto.activo());
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

        List<Conductor> content = page.getContent();
        Set<UUID> empleadoIds = content.stream()
                .map(Conductor::getEmpleadoId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        Map<UUID, Empleado> empleadoMap = empleadoIds.isEmpty()
                ? Map.of()
                : empleadoRepository.findAllById(empleadoIds).stream()
                .collect(Collectors.toMap(Empleado::getId, Function.identity(), (a, b) -> a));

        List<ConductorResponse> responses = content.stream()
                .map(domain -> toResponse(domain, empleadoMap.get(domain.getEmpleadoId())))
                .toList();

        return PageResponse.of(responses, page);
    }

    private ConductorResponse toResponse(Conductor conductor) {
        Empleado empleado = conductor.getEmpleadoId() != null
                ? empleadoRepository.findById(conductor.getEmpleadoId()).orElse(null)
                : null;
        return toResponse(conductor, empleado);
    }

    private ConductorResponse toResponse(Conductor conductor, Empleado empleado) {
        ConductorEmpleadoInfo empleadoInfo = empleado != null
                ? mapper.toEmpleadoInfo(empleado)
                : null;
        return mapper.toResponse(conductor, empleadoInfo);
    }

    private Empleado obtenerEmpleado(UUID empleadoId) {
        return empleadoRepository.findById(empleadoId)
                .orElseThrow(() -> new ResourceNotFoundException("Empleado", empleadoId));
    }

    private Conductor obtenerPorId(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Conductor", id));
    }

    private void validarUnicosParaCrear(UUID empleadoId, String numeroLicencia) {
        if (repository.existsByEmpleadoId(empleadoId)) {
            throw new ConflictException(
                    "CONDUCTOR_EMPLEADO_ALREADY_EXISTS",
                    "Ya existe un conductor asociado al empleado '%s'".formatted(empleadoId)
            );
        }

        if (repository.existsByNumeroLicenciaIgnoreCase(numeroLicencia)) {
            throw new ConflictException(
                    "CONDUCTOR_NUMERO_LICENCIA_ALREADY_EXISTS",
                    "Ya existe un conductor con el número de licencia '%s'".formatted(numeroLicencia)
            );
        }
    }

    private void validarUnicosParaActualizar(UUID empleadoId, String numeroLicencia, UUID currentId) {
        if (repository.existsByEmpleadoIdAndIdNot(empleadoId, currentId)) {
            throw new ConflictException(
                    "CONDUCTOR_EMPLEADO_ALREADY_EXISTS",
                    "Ya existe otro conductor asociado al empleado '%s'".formatted(empleadoId)
            );
        }

        if (repository.existsByNumeroLicenciaIgnoreCaseAndIdNot(numeroLicencia, currentId)) {
            throw new ConflictException(
                    "CONDUCTOR_NUMERO_LICENCIA_ALREADY_EXISTS",
                    "Ya existe otro conductor con el número de licencia '%s'".formatted(numeroLicencia)
            );
        }
    }
}
